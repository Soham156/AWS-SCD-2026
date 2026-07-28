import { randomInt } from 'crypto';
import { supabase } from './supabase.js';
import { generateQRToken } from './qrToken.js';
import { enqueueOrderEmails } from '../../features/email/emailQueue.js';

function generateTicketNumber(): string {
  return `SCD-${randomInt(100000, 999999)}-26`;
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[randomInt(0, chars.length)];
  }
  return code;
}

/**
 * Confirms a paid order exactly once: marks payment + order PAID, assigns ticket
 * numbers, and enqueues confirmation emails.
 *
 * Safe to call from BOTH the Cashfree webhook and the on-return verify endpoint.
 * Concurrent/duplicate calls are deduped by an atomic status claim
 * (UPDATE ... WHERE status != 'paid'), so tickets and emails are never issued twice.
 */
export async function fulfillOrder(
  cashfreeOrderId: string,
  opts: { paymentId?: string; gatewayResponse?: any } = {}
): Promise<'fulfilled' | 'already_paid' | 'unknown_order'> {
  const { data: payment } = await supabase
    .from('payments')
    .select('order_id, status, orders(pass_type_id, quantity, primary_email)')
    .eq('cashfree_order_id', cashfreeOrderId)
    .single();

  if (!payment) return 'unknown_order';
  if (payment.status === 'paid') return 'already_paid';

  // Capture prior status before the claim: any status other than 'initiated'
  // (expired, abandoned, failed) means inventory was already released, so a
  // successful payment must re-reserve it.
  const wasReleased = payment.status !== 'initiated';

  // Atomic claim: only the first caller flips non-paid → paid and proceeds.
  // ponytail: the .neq('status','paid') is the lock — do not replace with a read-then-write.
  const { data: claimed } = await supabase
    .from('payments')
    .update({
      status: 'paid',
      cashfree_payment_id: opts.paymentId,
      gateway_response: opts.gatewayResponse,
    })
    .eq('cashfree_order_id', cashfreeOrderId)
    .neq('status', 'paid')
    .select('order_id')
    .single();

  if (!claimed) return 'already_paid'; // another trigger won the race

  await supabase.from('orders').update({ payment_status: 'PAID' }).eq('id', payment.order_id);

  // Fail-safe: if cleanup archived registrations before we got here, restore them.
  const { data: existingRegs } = await supabase
    .from('registrations')
    .select('id')
    .eq('order_id', payment.order_id);

  if (!existingRegs || existingRegs.length === 0) {
    const { data: archivedRegs } = await supabase
      .from('archived_registrations')
      .select('*')
      .eq('order_id', payment.order_id);

    if (archivedRegs && archivedRegs.length > 0) {
      console.log(`[Fulfill] Recovering ${archivedRegs.length} archived registration(s) for order ${payment.order_id}`);
      // Strip archived_at before reinserting (column doesn't exist on registrations)
      const toRestore = archivedRegs.map(({ archived_at, ...rest }) => rest);
      const { error: restoreErr } = await supabase.from('registrations').upsert(toRestore, { onConflict: 'id' });
      if (restoreErr) {
        console.error('[Fulfill] Failed to restore archived registrations:', restoreErr);
      } else {
        await supabase.from('archived_registrations').delete().in('id', archivedRegs.map(r => r.id));
      }
    }
  }

  // Only issue tickets for registrations that don't already have one (crash-safe).
  const { data: registrations } = await supabase
    .from('registrations')
    .select('id')
    .eq('order_id', payment.order_id)
    .is('ticket_number', null);

  for (const reg of registrations || []) {
    let ticket_number = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateTicketNumber();
      const { data: conflict } = await supabase
        .from('registrations')
        .select('id')
        .eq('ticket_number', candidate)
        .single();
      if (!conflict) {
        ticket_number = candidate;
        break;
      }
    }

    if (!ticket_number) {
      console.error(`[Fulfill] Failed to generate unique ticket number for reg ${reg.id}`);
      continue;
    }

    await supabase
      .from('registrations')
      .update({ payment_status: 'PAID', ticket_number, qr_token: generateQRToken(ticket_number) })
      .eq('id', reg.id);
  }

  // --- Referral code generation (crash-safe: skip if already set) ---
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('referral_code, referred_by_order_id, primary_email, quantity')
    .eq('id', payment.order_id)
    .single();

  if (existingOrder && !existingOrder.referral_code) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateReferralCode();
      const { error: codeErr } = await supabase
        .from('orders')
        .update({ referral_code: code })
        .eq('id', payment.order_id)
        .is('referral_code', null); // only set if still null (idempotent)
      if (!codeErr) break;
      // unique constraint violation → retry with a new code
    }
  }

  // --- Award referral points if this order was referred ---
  if (existingOrder?.referred_by_order_id) {
    // Get referrer's email from their order
    const { data: referrerOrder } = await supabase
      .from('orders')
      .select('primary_email')
      .eq('id', existingOrder.referred_by_order_id)
      .single();

    if (referrerOrder?.primary_email) {
      // Insert is idempotent via unique index on referred_order_id
      try {
        await supabase
          .from('referral_points')
          .upsert({
            referrer_email: referrerOrder.primary_email,
            referrer_order_id: existingOrder.referred_by_order_id,
            referred_order_id: payment.order_id,
            points: 25 * (existingOrder.quantity || 1),
          }, { onConflict: 'referred_order_id' });
      } catch (err) {
        console.error('[Fulfill] Failed to award referral points:', err);
      }
    }
  }

  // Promo-code use increments are handled by the DB trigger on payment_status → 'PAID'.

  // Enqueue confirmation emails (idempotent via per-registration keys, non-blocking).
  enqueueOrderEmails(payment.order_id, (payment.orders as any)?.primary_email)
    .catch(err => console.error('[Fulfill] Failed to enqueue order emails:', err));

  // Reclaim inventory that was released when the session left 'initiated'.
  if (wasReleased) {
    const o = payment.orders as any;
    if (o?.pass_type_id && o?.quantity) {
      const { data: success } = await supabase.rpc('reserve_tickets', { p_pass_id: o.pass_type_id, p_amount: o.quantity });
      if (!success) {
        // Fallback: if capacity was exceeded, force-increment the sold count anyway
        // since the user has already paid.
        for (let i = 0; i < o.quantity; i++) {
          await supabase.rpc('increment_sold', { pass_id: o.pass_type_id });
        }
      }
    }
  }

  return 'fulfilled';
}
