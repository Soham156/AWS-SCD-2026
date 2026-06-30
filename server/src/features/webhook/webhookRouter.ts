import { Router } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { supabase } from '../../shared/lib/supabase.js';
import { fulfillOrder } from '../../shared/lib/fulfillOrder.js';

const router = Router();

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

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
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

      // Fulfillment is shared with the on-return verify endpoint and is idempotent,
      // so duplicate webhooks / a webhook+verify race never double-issue tickets.
      const result = await fulfillOrder(orderId, { paymentId, gatewayResponse: eventData });
      if (result === 'unknown_order') {
        console.warn('[Webhook] Unknown order:', orderId);
        res.status(200).json({ message: 'Unknown order, ignoring' });
        return;
      }
    } else if (event === 'PAYMENT_FAILED_WEBHOOK') {
      const orderId = eventData?.order?.order_id;
      if (orderId) {
        // Fetch current state BEFORE updating to avoid double ticket releases
        const { data: payment } = await supabase
          .from('payments')
          .select('order_id, status, orders(pass_type_id, quantity)')
          .eq('cashfree_order_id', orderId)
          .single();

        if (payment) {
          // If it was still 'initiated', release the tickets to the pool immediately.
          // If it was already 'expired', the cron job already handled the release.
          if (payment.status === 'initiated') {
            const passId = (payment.orders as any)?.pass_type_id;
            const quantity = (payment.orders as any)?.quantity || 1;
            if (passId) {
              await supabase.rpc('release_tickets', { p_pass_id: passId, p_amount: quantity });
            }
          }

          await supabase
            .from('payments')
            .update({ status: 'failed', gateway_response: eventData })
            .eq('cashfree_order_id', orderId);

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
