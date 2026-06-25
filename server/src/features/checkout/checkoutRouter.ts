import { Router } from 'express';
import { supabase } from '../../shared/lib/supabase.js';
import { checkoutLimiter } from '../../shared/middleware/rateLimiter.js';

const router = Router();

// POST /api/checkout/initiate
router.post('/initiate', checkoutLimiter, async (req, res, next) => {
  try {
    const { order_id } = req.body;
    if (!order_id) {
      res.status(400).json({ error: 'order_id is required' });
      return;
    }

    // Look up order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*, pass_types(*), registrations(phone)')
      .eq('id', order_id)
      .single();

    if (orderErr || !order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.payment_status === 'PAID') {
      res.status(400).json({ error: 'Order is already paid.' });
      return;
    }

    // Check if registrations are currently enabled
    const { data: settings } = await supabase
      .from('app_settings')
      .select('registration_enabled')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!settings || !settings.registration_enabled) {
      res.status(403).json({ error: 'Registrations are currently closed.' });
      return;
    }

    // Note: Inventory check is handled in step 1. But ideally, we might re-check it here if desired.
    // For now, we proceed to Cashfree.
    
    const shortId = order.id.split('-')[0];
    const cashfreeOrderId = `SCD-${shortId}-${Date.now()}`;

    let frontendUrl = (process.env.FRONTEND_URL || 'https://aws-scd-2026.vercel.app').replace(/\/+$/, '');
    if (!frontendUrl.startsWith('http')) {
      frontendUrl = `https://${frontendUrl}`;
    }
    const isSandbox = process.env.CASHFREE_APP_ID?.startsWith('TEST');
    const cashfreeBaseUrl = isSandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

    const parsedPlatform = parseFloat(process.env.PLATFORM_FEE_PERCENT || '');
    const platformFeePercent = isNaN(parsedPlatform) ? 1 : parsedPlatform;

    const parsedGateway = parseFloat(process.env.GATEWAY_FEE_PERCENT || '');
    const gatewayFeePercent = isNaN(parsedGateway) ? 1.6 : parsedGateway;
    
    // total_amount is already discounted
    const basePrice = Number(order.total_amount);
    const platformFee = (basePrice * platformFeePercent) / 100;
    const gatewayFee = (basePrice * gatewayFeePercent) / 100;
    const finalAmount = Math.round((basePrice + platformFee + gatewayFee) * 100) / 100;
    const primaryPhone = order.registrations?.[0]?.phone || "0000000000";

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
        order_id: cashfreeOrderId,
        order_amount: finalAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: order.id.slice(0, 50), // Cashfree limit is 50 chars
          customer_name: "Group Buyer",
          customer_email: order.primary_email || "test@example.com",
          customer_phone: primaryPhone,
        },
        order_meta: {
          return_url: `${frontendUrl}/ticket?orderId=${order.id}&verify=true`,
        },
      }),
    });

    const cashfreeData = await cashfreeRes.json();

    if (!cashfreeRes.ok) {
      console.error('[Cashfree Error]', cashfreeData);
      res.status(502).json({ 
        error: 'Payment gateway error', 
        details: cashfreeData,
        message: cashfreeData?.message || 'Unknown Cashfree Error'
      });
      return;
    }

    // Insert payment row
    await supabase.from('payments').insert({
      order_id: order.id,
      cashfree_order_id: cashfreeOrderId,
      amount: finalAmount,
      status: 'initiated',
    });

    res.json({
      payment_session_id: cashfreeData.payment_session_id,
      cashfree_order_id: cashfreeOrderId,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
