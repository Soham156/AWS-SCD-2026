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

    let frontendUrl = process.env.FRONTEND_URL || 'https://aws-scd-2026.vercel.app';
    if (!frontendUrl.startsWith('http')) {
      frontendUrl = `https://${frontendUrl}`;
    }
    const isSandbox = process.env.CASHFREE_APP_ID?.startsWith('TEST');
    const cashfreeBaseUrl = isSandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

    // Create Cashfree order via API
    const cashfreeRes = await fetch(`${cashfreeBaseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.CASHFREE_APP_ID || '',
        'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: Number(passType.price),
        order_currency: 'INR',
        customer_details: {
          customer_id: registration.id.slice(0, 50), // Cashfree limit is 50 chars
          customer_name: registration.full_name,
          customer_email: registration.email,
          customer_phone: '9999999999', // placeholder
        },
        order_meta: {
          return_url: `${frontendUrl}/ticket/${registration.id}?order_id={order_id}`,
        },
      }),
    });

    const cashfreeData = await cashfreeRes.json();

    if (!cashfreeRes.ok) {
      console.error('[Cashfree Error]', cashfreeData);
      // Return the exact Cashfree error so we can debug it in the browser
      res.status(502).json({ 
        error: 'Payment gateway error', 
        details: cashfreeData,
        message: cashfreeData?.message || 'Unknown Cashfree Error'
      });
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
