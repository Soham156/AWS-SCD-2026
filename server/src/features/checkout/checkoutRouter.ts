import { Router } from 'express';
import { supabase } from '../../shared/lib/supabase.js';
import { checkoutLimiter } from '../../shared/middleware/rateLimiter.js';
import crypto from 'crypto';

const router = Router();

// POST /api/checkout/initiate
router.post('/initiate', checkoutLimiter, async (req, res, next) => {
  try {
    const { ticket_id, pass_type_id } = req.body;
    if (!ticket_id || !pass_type_id) {
      res.status(400).json({ error: 'ticket_id and pass_type_id are required' });
      return;
    }

    // Look up registration
    const { data: registration, error: regErr } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', ticket_id)
      .single();

    if (regErr || !registration) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    // Look up pass type
    const { data: passType, error: ptErr } = await supabase
      .from('pass_types')
      .select('*')
      .eq('id', pass_type_id)
      .single();

    if (ptErr || !passType) {
      res.status(404).json({ error: 'Pass type not found' });
      return;
    }

    const shortId = registration.id.split('-')[0];
    const orderId = `SCD-${shortId}-${Date.now()}`;

    // Create Cashfree order via API
    const cashfreeRes = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.CASHFREE_APP_ID!,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: Number(passType.price),
        order_currency: 'INR',
        customer_details: {
          customer_id: registration.id,
          customer_name: registration.full_name,
          customer_email: registration.email,
          customer_phone: '9999999999', // placeholder — phone not collected
        },
        order_meta: {
          return_url: `${process.env.FRONTEND_URL}/ticket/${registration.id}?order_id={order_id}`,
        },
      }),
    });

    const cashfreeData = await cashfreeRes.json();

    if (!cashfreeRes.ok) {
      console.error('[Cashfree Error]', cashfreeData);
      res.status(502).json({ error: 'Payment gateway error' });
      return;
    }

    // Insert payment row
    await supabase.from('payments').insert({
      registration_id: registration.id,
      cashfree_order_id: orderId,
      amount: Number(passType.price),
      status: 'initiated',
    });

    res.json({
      payment_session_id: cashfreeData.payment_session_id,
      cashfree_order_id: orderId,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
