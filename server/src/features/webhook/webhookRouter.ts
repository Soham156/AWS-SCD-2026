import { Router } from 'express';
import { createHmac } from 'crypto';
import { supabase } from '../../shared/lib/supabase.js';
import { generateQRToken } from '../../shared/lib/qrToken.js';
import { enqueueRegistrationConfirmation } from '../email/emailQueue.js';

const router = Router();

function generateTicketNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `AWS-${num}-26`;
}

// POST /api/webhooks/cashfree
router.post('/cashfree', async (req, res, next) => {
  try {
    // Verify webhook signature using raw body (per Cashfree official docs)
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;
    const rawBody = (req as any).rawBody as string;

    // Per Cashfree docs: use your Client Secret (CASHFREE_SECRET_KEY) for HMAC
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!signature || !secretKey || !rawBody || !timestamp) {
      console.warn('[Webhook] Missing signature, secret, timestamp, or rawBody');
      res.status(401).json({ error: 'Unauthorized: Missing webhook signature or payload' });
      return;
    }

    const expectedSig = createHmac('sha256', secretKey)
      .update(timestamp + rawBody)
      .digest('base64');

    if (signature !== expectedSig) {
      console.warn('[Webhook] Invalid signature');
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    const { data: eventData } = req.body;
    const event = req.body.type;

    if (event === 'PAYMENT_SUCCESS_WEBHOOK' || event === 'PAYMENT_SUCCESS') {
      const orderId = eventData?.order?.order_id;
      const paymentId = eventData?.payment?.cf_payment_id?.toString();

      if (!orderId) {
        res.status(400).json({ error: 'Missing order_id' });
        return;
      }

      // Idempotency check
      const { data: payment } = await supabase
        .from('payments')
        .select('*, orders(id, pass_type_id, promo_code_id, quantity)')
        .eq('cashfree_order_id', orderId)
        .single();

      if (!payment) {
        console.warn('[Webhook] Unknown order:', orderId);
        res.status(200).json({ message: 'Unknown order, ignoring' });
        return;
      }

      if (payment.status === 'paid') {
        // Already processed
        res.status(200).json({ message: 'Already processed' });
        return;
      }

      let wasExpired = false;
      if (payment.status === 'expired') {
        console.warn('[Webhook] Paid an expired order. Accepting it but re-incrementing sold:', orderId);
        wasExpired = true;
      }

      // Update payment
      await supabase
        .from('payments')
        .update({
          status: 'paid',
          cashfree_payment_id: paymentId,
          gateway_response: eventData,
        })
        .eq('cashfree_order_id', orderId);

      // Update order
      await supabase
        .from('orders')
        .update({ payment_status: 'PAID' })
        .eq('id', payment.order_id);

      // Process each registration for the order
      const { data: registrations } = await supabase
        .from('registrations')
        .select('id')
        .eq('order_id', payment.order_id);

      if (registrations) {
        for (const reg of registrations) {
          // Generate unique ticket number
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

          if (!ticket_number) throw new Error('Failed to generate unique ticket number');

          const qr_token = generateQRToken(ticket_number);

          // Update registration with ticket details
          await supabase
            .from('registrations')
            .update({
              payment_status: 'PAID',
              ticket_number,
              qr_token
            })
            .eq('id', reg.id);

          // Enqueue confirmation email (async, non-blocking)
          enqueueRegistrationConfirmation(reg.id, ticket_number, qr_token)
            .catch(err => console.error('[Webhook] Failed to enqueue confirmation email:', err));
        }
      }

      const orderData = payment.orders as any;

      if (orderData?.promo_code_id) {
        // Increment promo uses atomically
        await supabase.rpc('increment_promo_uses', { p_promo_id: orderData.promo_code_id });
      }

      // Increment sold count ONLY if it was expired (since the cron job decremented it)
      if (wasExpired && orderData?.pass_type_id && orderData?.quantity) {
        // Reserve tickets atomically (it was expired, so we must reclaim the inventory)
        await supabase.rpc('reserve_tickets', { p_pass_id: orderData.pass_type_id, p_amount: orderData.quantity });
      }
    } else if (event === 'PAYMENT_FAILED_WEBHOOK') {
      const orderId = eventData?.order?.order_id;
      if (orderId) {
        await supabase
          .from('payments')
          .update({ status: 'failed', gateway_response: eventData })
          .eq('cashfree_order_id', orderId);

        const { data: payment } = await supabase
          .from('payments')
          .select('order_id, status, orders(pass_type_id)')
          .eq('cashfree_order_id', orderId)
          .single();

        if (payment) {
          await supabase
            .from('orders')
            .update({ payment_status: 'FAILED' })
            .eq('id', payment.order_id)
            .neq('payment_status', 'PAID');

          await supabase
            .from('registrations')
            .update({ payment_status: 'FAILED' })
            .eq('order_id', payment.order_id)
            .neq('payment_status', 'PAID');
        }
      }
    }

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    next(err);
  }
});

export default router;
