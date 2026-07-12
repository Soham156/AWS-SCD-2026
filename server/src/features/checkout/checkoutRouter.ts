import { Router } from 'express';
import { supabase } from '../../shared/lib/supabase.js';
import { checkoutLimiter } from '../../shared/middleware/rateLimiter.js';
import { runCleanups } from '../../shared/lib/cleanup.js';
import { fulfillOrder } from '../../shared/lib/fulfillOrder.js';

const router = Router();

// POST /api/checkout/initiate
router.post('/initiate', checkoutLimiter, async (req, res, next) => {
  try {
    runCleanups(); // fire-and-forget, self-throttled

    const { order_id } = req.body;
    if (!order_id) {
      res.status(400).json({ error: 'order_id is required' });
      return;
    }

    // Look up order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*, pass_types(*), registrations(phone, full_name), promo_codes(*)')
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

    // Verify promo code limits if one is applied
    if (order.promo_codes) {
      const promo = order.promo_codes;
      if (!promo.is_active) {
        res.status(400).json({ error: 'PROMO_EXPIRED', message: 'The applied promo code is no longer active.' });
        return;
      }
      if (promo.max_uses > 0 && promo.uses >= promo.max_uses) {
        res.status(400).json({ error: 'PROMO_EXHAUSTED', message: 'The applied promo code limit has been reached.' });
        return;
      }
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

    // --- TICKET LOCKING (SEMAPHORE) ---
    // 1. Check for any previous 'initiated' payments for this order
    const { data: activePayments } = await supabase
      .from('payments')
      .select('id')
      .eq('order_id', order.id)
      .eq('status', 'initiated');

    if (activePayments && activePayments.length > 0) {
      // 2. Expire old sessions to prevent double-locking inventory
      await supabase
        .from('payments')
        .update({ status: 'abandoned' })
        .in('id', activePayments.map(p => p.id));
        
      // Release tickets from those old sessions
      await supabase.rpc('release_tickets', { 
        p_pass_id: order.pass_type_id, 
        p_amount: order.quantity * activePayments.length 
      });
    }

    // 3. Atomically reserve the tickets for this specific payment session
    const { data: reserved, error: reserveError } = await supabase
      .rpc('reserve_tickets', { p_pass_id: order.pass_type_id, p_amount: order.quantity });

    if (reserveError || !reserved) {
      res.status(400).json({ error: 'SOLD_OUT', message: 'Sorry, these tickets just sold out.' });
      return;
    }
    // ----------------------------------
    const shortId = order.id.split('-')[0];
    const cashfreeOrderId = `SCD-${shortId}-${Date.now()}`;

    let frontendUrl = (process.env.FRONTEND_URL || 'https://aws-scd-2026.vercel.app').replace(/\/+$/, '');
    if (process.env.NODE_ENV === 'production' && frontendUrl.includes('localhost')) {
      frontendUrl = 'https://aws-scd-dhule.tech';
    }
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
    const primaryName = order.registrations?.[0]?.full_name || "Group Buyer";

    if (finalAmount <= 0) {
      // Free ticket checkout: bypass Cashfree entirely
      const shortId = order.id.split('-')[0];
      const freeOrderId = `FREE-${shortId}-${Date.now()}`;

      // Insert payment record as initiated (required for fulfillOrder to process)
      const { error: paymentInsertError } = await supabase.from('payments').insert({
        order_id: order.id,
        cashfree_order_id: freeOrderId,
        amount: 0,
        status: 'initiated',
      });

      if (paymentInsertError) {
        console.error('[Checkout] Failed to record free payment session:', paymentInsertError);
        await supabase.rpc('release_tickets', { p_pass_id: order.pass_type_id, p_amount: order.quantity });
        res.status(500).json({ error: 'Failed to complete free ticket checkout. Please try again.' });
        return;
      }

      // Fulfill order immediately
      await fulfillOrder(freeOrderId, { gatewayResponse: { free: true, note: '100% discount promo code' } });

      res.json({
        free: true,
        order_id: order.id,
      });
      return;
    }

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
          customer_name: primaryName,
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
      // Release the tickets we just reserved since payment session creation failed
      await supabase.rpc('release_tickets', { p_pass_id: order.pass_type_id, p_amount: order.quantity });
      res.status(502).json({ 
        error: 'Payment gateway error', 
        details: cashfreeData,
        message: cashfreeData?.message || 'Unknown Cashfree Error'
      });
      return;
    }

    // Insert payment row. If this fails, the tickets we reserved would be
    // orphaned (no 'initiated' row for the expiry cron to release), so roll back.
    const { error: paymentInsertError } = await supabase.from('payments').insert({
      order_id: order.id,
      cashfree_order_id: cashfreeOrderId,
      amount: finalAmount,
      status: 'initiated',
    });

    if (paymentInsertError) {
      console.error('[Checkout] Failed to record payment session:', paymentInsertError);
      await supabase.rpc('release_tickets', { p_pass_id: order.pass_type_id, p_amount: order.quantity });
      res.status(500).json({ error: 'Failed to start payment session. Please try again.' });
      return;
    }

    res.json({
      payment_session_id: cashfreeData.payment_session_id,
      cashfree_order_id: cashfreeOrderId,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
