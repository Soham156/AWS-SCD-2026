import { Router } from 'express';
import { createHmac } from 'crypto';
import { supabase } from '../../shared/lib/supabase.js';
import { generateQRToken } from '../../shared/lib/qrToken.js';

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

    if (signature && secretKey && rawBody) {
      const expectedSig = createHmac('sha256', secretKey)
        .update(timestamp + rawBody)
        .digest('base64');

      if (signature !== expectedSig) {
        console.warn('[Webhook] Invalid signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
      console.log('[Webhook] Signature verified successfully');
    } else {
      console.warn('[Webhook] Skipping signature verification (missing signature/secret/rawBody)');
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
        .select('*, registrations(id, pass_type_id, ticket_number)')
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

      if (!ticket_number) {
        throw new Error('Failed to generate unique ticket number');
      }

      const qr_token = generateQRToken(ticket_number);

      // Update payment
      await supabase
        .from('payments')
        .update({
          status: 'paid',
          cashfree_payment_id: paymentId,
          gateway_response: eventData,
        })
        .eq('cashfree_order_id', orderId);

      // Update registration with ticket details
      await supabase
        .from('registrations')
        .update({
          payment_status: 'PAID',
          ticket_number,
          qr_token
        })
        .eq('id', payment.registration_id);

      // Increment sold count
      const regData = payment.registrations as any;
      if (regData?.pass_type_id) {
        await supabase.rpc('increment_sold', { pass_id: regData.pass_type_id });
      }

      // TODO: Trigger AWS SES email (deferred — SES not configured yet)
      console.log('[Webhook] Payment success for order:', orderId, 'Ticket:', ticket_number);
    } else if (event === 'PAYMENT_FAILED_WEBHOOK') {
      const orderId = eventData?.order?.order_id;
      if (orderId) {
        await supabase
          .from('payments')
          .update({ status: 'failed', gateway_response: eventData })
          .eq('cashfree_order_id', orderId);

        // We can optionally mark registration as FAILED if we want, but keeping it PENDING is also fine
        // since we allow them to retry from PENDING state.
        // Let's mark it as FAILED to be explicit
        const { data: payment } = await supabase
          .from('payments')
          .select('registration_id')
          .eq('cashfree_order_id', orderId)
          .single();

        if (payment) {
          await supabase
            .from('registrations')
            .update({ payment_status: 'FAILED' })
            .eq('id', payment.registration_id)
            // only update if not paid
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
