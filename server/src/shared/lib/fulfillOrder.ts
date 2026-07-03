import { randomInt } from 'crypto';
import { supabase } from './supabase.js';
import { generateQRToken } from './qrToken.js';
import { enqueueOrderEmails } from '../../features/email/emailQueue.js';

function generateTicketNumber(): string {
  return `SCD-${randomInt(100000, 999999)}-26`;
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

  // Promo-code use increments are handled by the DB trigger on payment_status → 'PAID'.

  // Enqueue confirmation emails (idempotent via per-registration keys, non-blocking).
  enqueueOrderEmails(payment.order_id, (payment.orders as any)?.primary_email)
    .catch(err => console.error('[Fulfill] Failed to enqueue order emails:', err));

  // Reclaim inventory that was released when the session left 'initiated'.
  if (wasReleased) {
    const o = payment.orders as any;
    if (o?.pass_type_id && o?.quantity) {
      await supabase.rpc('reserve_tickets', { p_pass_id: o.pass_type_id, p_amount: o.quantity });
    }
  }

  return 'fulfilled';
}
