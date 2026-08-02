
import { supabase } from './supabase.js';

// On-demand, request-driven cleanup for serverless (Lambda) where setInterval
// never fires — the process is frozen between requests. Each function self-throttles
// via a module-level timestamp so calling them on every request is cheap.
// ponytail: throttle state is per-instance (in-memory). On serverless each warm
// instance runs its own clock; cold starts reset it. That's fine — the checks are
// idempotent and time-bounded, so at worst they run a little more often. Move to a
// DB-backed lock only if concurrent instances doing redundant work becomes measurable.

let lastSessionSweep = 0;
let lastRegistrationSweep = 0;

const SESSION_THROTTLE_MS = 30 * 1000; // at most once per 30s
const REGISTRATION_THROTTLE_MS = 15 * 60 * 1000; // at most once per 15 min

const SESSION_TTL_MS = 5 * 60 * 1000; // release tickets 5 min after checkout starts
const ORPHAN_ORDER_TTL_MS = 10 * 60 * 1000; // delete emptied orders after 10 min
const PENDING_REG_TTL_MS = 15 * 60 * 1000; // archive pending registrations after 15 min

/**
 * Release reserved tickets for payment sessions initiated more than SESSION_TTL_MS
 * ago and left unpaid. Marks them 'expired' and decrements sold inventory.
 */
export async function cleanupExpiredSessions(): Promise<void> {
  if (Date.now() - lastSessionSweep < SESSION_THROTTLE_MS) return;
  lastSessionSweep = Date.now();

  try {
    const cutoff = new Date(Date.now() - SESSION_TTL_MS).toISOString();
    const { data: expired, error } = await supabase
      .from('payments')
      .select('id, orders(pass_type_id, quantity)')
      .eq('status', 'initiated')
      .lt('created_at', cutoff);

    if (error) {
      console.error('[Cleanup] Failed to fetch expired sessions:', error);
      return;
    }

    let releasedCount = 0;
    for (const p of expired || []) {
      // Atomic claim: only expire a row that is STILL 'initiated'. If a payment
      // landed between our SELECT and here, fulfillOrder already flipped it to
      // 'paid' — the guard makes this a no-op so we never clobber a paid session
      // or release a ticket the customer just bought.
      const { data: claimed } = await supabase
        .from('payments')
        .update({ status: 'expired' })
        .eq('id', p.id)
        .eq('status', 'initiated')
        .select('id')
        .single();

      if (!claimed) continue; // it got paid (or already swept) — leave it alone

      const passId = (p.orders as any)?.pass_type_id;
      const quantity = (p.orders as any)?.quantity || 1;
      if (passId) {
        await supabase.rpc('release_tickets', { p_pass_id: passId, p_amount: quantity });
      }
      releasedCount++;
    }

    if (releasedCount > 0) {
      console.log(`[Cleanup] Released tickets for ${releasedCount} expired session(s).`);
    }
  } catch (err) {
    console.error('[Cleanup] Unexpected error sweeping sessions:', err);
  }
}

/**
 * Archive pending registrations older than PENDING_REG_TTL_MS, and delete orphan
 * orders (no primary_email, unpaid) older than ORPHAN_ORDER_TTL_MS. These hold no
 * inventory; PAID orders are always kept.
 */
export async function cleanupAbandonedRegistrations(): Promise<void> {
  if (Date.now() - lastRegistrationSweep < REGISTRATION_THROTTLE_MS) return;
  lastRegistrationSweep = Date.now();

  try {
    // --- Abandoned pending & failed registrations (> 15 min) ---
    const regCutoff = new Date(Date.now() - PENDING_REG_TTL_MS).toISOString();
    const { data: abandonedRegs, error: fetchErr } = await supabase
      .from('registrations')
      .select('*')
      .in('payment_status', ['PENDING', 'FAILED'])
      .lt('created_at', regCutoff);

    if (fetchErr) {
      console.error('[Cleanup] Failed to fetch pending/failed registrations:', fetchErr);
    } else if (abandonedRegs && abandonedRegs.length > 0) {
      // Guard: do not archive registrations that have an active payment session
      // OR whose parent order is already PAID (race: payment landed before cleanup ran).
      const { data: activeSessions } = await supabase
        .from('payments')
        .select('order_id')
        .eq('status', 'initiated');
      const activeOrderIds = new Set(activeSessions?.map(s => s.order_id).filter(Boolean) || []);

      // Also exclude registrations whose order is already paid
      const orderIds = [...new Set(abandonedRegs.map(r => r.order_id).filter(Boolean))];
      const paidOrderIds = new Set<string>();
      if (orderIds.length > 0) {
        const { data: paidOrders } = await supabase
          .from('orders')
          .select('id')
          .in('id', orderIds)
          .eq('payment_status', 'PAID');
        for (const o of paidOrders || []) paidOrderIds.add(o.id);
      }

      const regsToArchive = abandonedRegs.filter(r =>
        !activeOrderIds.has(r.order_id) && !paidOrderIds.has(r.order_id)
      );

      if (regsToArchive.length > 0) {
        const { error: archiveErr } = await supabase
          .from('archived_registrations')
          .upsert(regsToArchive, { onConflict: 'id' });

        if (archiveErr) {
          console.error('[Cleanup] Failed to archive registrations:', archiveErr);
        } else {
          const ids = regsToArchive.map(r => r.id);
          await supabase.from('payments').delete().in('registration_id', ids);
          const { error: deleteErr } = await supabase.from('registrations').delete().in('id', ids);
          if (deleteErr) console.error('[Cleanup] Failed to delete archived registrations:', deleteErr);
          else console.log(`[Cleanup] Archived ${ids.length} abandoned/failed registration(s) older than 15 min.`);
        }
      }
    }

    // --- Orphan orders (> 10 min, never reached /attendees so no email) ---
    const orphanCutoff = new Date(Date.now() - ORPHAN_ORDER_TTL_MS).toISOString();
    const { data: orphanOrders, error: orphanErr } = await supabase
      .from('orders')
      .select('id')
      .is('primary_email', null)
      .neq('payment_status', 'PAID')
      .lt('created_at', orphanCutoff);

    if (orphanErr) {
      console.error('[Cleanup] Failed to fetch orphan orders:', orphanErr);
    } else if (orphanOrders && orphanOrders.length > 0) {
      const ids = orphanOrders.map(o => o.id);
      // Remove dependents first to satisfy FK constraints.
      await supabase.from('payments').delete().in('order_id', ids);
      await supabase.from('registrations').delete().in('order_id', ids);
      const { error: deleteErr } = await supabase.from('orders').delete().in('id', ids);
      if (deleteErr) console.error('[Cleanup] Failed to delete orphan orders:', deleteErr);
      else console.log(`[Cleanup] Deleted ${ids.length} orphan order(s) unused for 10 min.`);
    }
  } catch (err) {
    console.error('[Cleanup] Unexpected error sweeping registrations:', err);
  }
}

/** Run both cleanups (each self-throttles). Fire-and-forget from request handlers. */
export async function runCleanups(): Promise<void> {
  await Promise.all([cleanupExpiredSessions(), cleanupAbandonedRegistrations()]);
}
