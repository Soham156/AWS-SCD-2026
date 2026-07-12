import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../../shared/lib/supabase.js';
import { fulfillOrder } from '../../shared/lib/fulfillOrder.js';
import { runCleanups } from '../../shared/lib/cleanup.js';
import { enqueueOrderEmails } from '../email/emailQueue.js';

const router = Router();

const createOrderSchema = z.object({
  pass_type_id: z.string().uuid(),
  quantity: z.number().min(1).max(20),
  referred_by: z.string().max(10).optional(),
});

const applyPromoSchema = z.object({
  code: z.string().toUpperCase(),
});

const attendeesSchema = z.object({
  primary_email: z.string().email(),
  attendees: z.array(z.object({
    full_name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().regex(/^[0-9]{10}$/),
    role: z.enum(['student', 'professional']),
    organization: z.string().min(1),
  })).min(1),
});

// POST /api/orders/create
router.post('/create', async (req, res, next) => {
  try {
    runCleanups(); // fire-and-forget, self-throttled

    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { pass_type_id, quantity } = parsed.data;

    // Validate pass type
    const { data: passType, error: ptError } = await supabase
      .from('pass_types')
      .select('id, price, capacity, sold, is_locked')
      .eq('id', pass_type_id)
      .single();

    if (ptError || !passType) {
      res.status(404).json({ error: 'PASS_NOT_FOUND', message: 'Invalid pass type.' });
      return;
    }

    if (passType.is_locked) {
      res.status(403).json({ error: 'PASS_LOCKED', message: 'This pass is not available for purchase yet.' });
      return;
    }

    // Soft check inventory to prevent obviously doomed orders
    if (passType.capacity - passType.sold < quantity) {
      res.status(400).json({ error: 'SOLD_OUT', message: `Not enough tickets remaining.` });
      return;
    }

    const subtotal = passType.price * quantity;

    // Look up referrer order if a referral code was provided
    let referred_by_order_id: string | null = null;
    if (parsed.data.referred_by) {
      const { data: referrerOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('referral_code', parsed.data.referred_by)
        .eq('payment_status', 'PAID')
        .single();
      if (referrerOrder) {
        referred_by_order_id = referrerOrder.id;
      }
      // Silently ignore invalid codes — no error, no discount
    }

    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
        pass_type_id,
        quantity,
        subtotal,
        discount: 0,
        total_amount: subtotal,
        payment_status: 'PENDING',
        referred_by_order_id,
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ order_id: order.id });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/referral/:code — validate a referral code (public, no auth)
router.get('/referral/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { data: order } = await supabase
      .from('orders')
      .select('pass_type_id')
      .eq('referral_code', code.toUpperCase())
      .eq('payment_status', 'PAID')
      .single();

    if (!order) {
      res.json({ valid: false });
      return;
    }

    res.json({ valid: true, pass_type_id: order.pass_type_id });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/public-leaderboard — public leaderboard displaying first names only
router.get('/public-leaderboard', async (_req, res, next) => {
  try {
    const { data: pointsData, error: pointsError } = await supabase
      .from('referral_points')
      .select(`
        referrer_email,
        points,
        referrer_order:orders!referrer_order_id(
          pass_types!pass_type_id(name)
        )
      `);

    if (pointsError) throw pointsError;

    // Aggregate points by referrer email
    const map = new Map<string, { email: string; pass: string; total_points: number; referrals: number }>();
    for (const row of pointsData || []) {
      const existing = map.get(row.referrer_email);
      const passName = (row.referrer_order as any)?.pass_types?.name || 'Access Pass';
      if (existing) {
        existing.total_points += row.points;
        existing.referrals += 1;
      } else {
        map.set(row.referrer_email, {
          email: row.referrer_email,
          pass: passName,
          total_points: row.points,
          referrals: 1
        });
      }
    }

    const aggregated = Array.from(map.values());
    if (aggregated.length === 0) {
      res.json([]);
      return;
    }

    // Fetch names for these emails
    const uniqueEmails = aggregated.map(a => a.email);
    const { data: namesData, error: namesError } = await supabase
      .from('registrations')
      .select('email, full_name')
      .in('email', uniqueEmails);

    const namesMap = new Map<string, string>();
    if (!namesError && namesData) {
      for (const n of namesData) {
        if (n.email && n.full_name) {
          namesMap.set(n.email.toLowerCase(), n.full_name);
        }
      }
    }

    const leaderboard = aggregated.map(entry => {
      const fullName = namesMap.get(entry.email.toLowerCase()) || entry.email.split('@')[0];
      const parts = fullName.trim().split(/\s+/).filter(Boolean);
      let formattedName = 'Enthusiast';
      if (parts.length > 0) {
        if (parts.length === 1) {
          formattedName = parts[0];
        } else if (parts.length === 2) {
          formattedName = `${parts[0]} ${parts[1]}`;
        } else {
          formattedName = `${parts[0]} ${parts[parts.length - 1]}`;
        }
      }
      return {
        name: formattedName,
        pass: entry.pass,
        total_points: entry.total_points,
        referrals: entry.referrals
      };
    }).sort((a, b) => b.total_points - a.total_points);

    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/my-referrals
router.get('/my-referrals', async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'EMAIL_REQUIRED', message: 'Email address is required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Find all paid orders for this user by primary_email or registration email
    const { data: regs, error: regError } = await supabase
      .from('registrations')
      .select('order_id')
      .eq('email', cleanEmail);

    if (regError) throw regError;

    const orderIds = new Set<string>();
    for (const r of regs || []) {
      if (r.order_id) orderIds.add(r.order_id);
    }

    const { data: primaryOrders, error: poError } = await supabase
      .from('orders')
      .select('id')
      .eq('primary_email', cleanEmail)
      .eq('payment_status', 'PAID');

    if (poError) throw poError;

    for (const o of primaryOrders || []) {
      orderIds.add(o.id);
    }

    if (orderIds.size === 0) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'No paddock pass found associated with this email. Check email.' });
      return;
    }

    // 2. Fetch the orders that have a generated referral code (must be paid)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, referral_code, primary_email')
      .in('id', Array.from(orderIds))
      .eq('payment_status', 'PAID');

    if (ordersError) throw ordersError;

    if (!orders || orders.length === 0) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'No paddock pass found associated with this email. Check email.' });
      return;
    }

    let activeOrder = orders.find(o => o.referral_code !== null && o.referral_code !== undefined);
    let referralCode = activeOrder?.referral_code || null;

    if (!activeOrder) {
      // Historical user: generate code now
      const targetOrder = orders[0];
      let generatedCode = '';
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = generateReferralCode();
        // Atomic check/write: only write if referral_code is still null (handles duplicate key violations gracefully)
        const { error: updateError } = await supabase
          .from('orders')
          .update({ referral_code: candidate })
          .eq('id', targetOrder.id)
          .is('referral_code', null);
        if (!updateError) {
          generatedCode = candidate;
          break;
        }
      }

      if (!generatedCode) {
        res.status(500).json({ error: 'CODE_GEN_FAILED', message: 'Failed to generate a unique referral code. Please try again.' });
        return;
      }

      referralCode = generatedCode;
      activeOrder = { ...targetOrder, referral_code: generatedCode };

      // Re-email ticket with new referral code
      enqueueOrderEmails(targetOrder.id, targetOrder.primary_email || cleanEmail, true)
        .catch(err => console.error('[MyReferrals] Failed to send retroactive referral email:', err));
    }

    // 3. Fetch referrals this code generated
    const { data: pointsData, error: pointsError } = await supabase
      .from('referral_points')
      .select(`
        points,
        created_at,
        referred_order:orders!referred_order_id(
          primary_email,
          pass_types!pass_type_id(name)
        )
      `)
      .or(`referrer_order_id.eq.${activeOrder.id},referrer_email.eq.${cleanEmail}`)
      .order('created_at', { ascending: false });

    if (pointsError) throw pointsError;

    let totalPoints = 0;
    const referrals = [];

    for (const row of pointsData || []) {
      totalPoints += row.points;
      const refOrder = row.referred_order as any;
      const rawEmail = refOrder?.primary_email || 'someone@example.com';
      
      const emailParts = rawEmail.split('@');
      let obfuscatedEmail = rawEmail;
      if (emailParts.length === 2) {
        const local = emailParts[0];
        const domain = emailParts[1];
        if (local.length > 2) {
          obfuscatedEmail = `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
        } else {
          obfuscatedEmail = `${local[0]}*@${domain}`;
        }
      }
      referrals.push({
        date: row.created_at,
        points: row.points,
        email: obfuscatedEmail,
        pass_name: refOrder?.pass_types?.name || 'Access Pass'
      });
    }

    res.json({
      found: true,
      referral_code: referralCode,
      total_points: totalPoints,
      referral_count: referrals.length,
      referrals,
    });

  } catch (err) {
    next(err);
  }
});

// Helper to generate referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET /api/orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, pass_types(id, name, slug, price, badge_color), promo_codes(code)')
      .eq('id', id)
      .single();

    if (error || !order) {
      res.status(404).json({ error: 'ORDER_NOT_FOUND' });
      return;
    }

    // Also fetch saved attendees if any
    const { data: attendees } = await supabase
      .from('registrations')
      .select('*')
      .eq('order_id', id);

    let referred_by_code: string | null = null;
    if (order.referred_by_order_id) {
      const { data: referrer } = await supabase
        .from('orders')
        .select('referral_code')
        .eq('id', order.referred_by_order_id)
        .single();
      if (referrer) {
        referred_by_code = referrer.referral_code;
      }
    }

    res.json({ ...order, attendees: attendees || [], referred_by_code });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/:id/verify-payment
// Primary fulfillment path: when the payer returns from Cashfree, confirm the
// payment with the gateway directly instead of waiting for the webhook to arrive.
router.post('/:id/verify-payment', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Latest payment session for this order
    const { data: payment } = await supabase
      .from('payments')
      .select('cashfree_order_id, status')
      .eq('order_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!payment) {
      res.status(404).json({ error: 'NO_PAYMENT', payment_status: 'PENDING' });
      return;
    }

    // Already settled in our DB (the webhook may have beaten us here) —
    // short-circuit so we don't hit the Cashfree API on every poll.
    if (payment.status === 'paid') {
      res.json({ payment_status: 'PAID' });
      return;
    }

    // Ask Cashfree the source of truth.
    const isSandbox = process.env.CASHFREE_APP_ID?.startsWith('TEST');
    const baseUrl = isSandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';
    const cfRes = await fetch(`${baseUrl}/orders/${payment.cashfree_order_id}`, {
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.CASHFREE_APP_ID || '',
        'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
      },
    });
    const cfData = await cfRes.json();

    if (cfRes.ok && cfData?.order_status === 'PAID') {
      await fulfillOrder(payment.cashfree_order_id, { gatewayResponse: cfData });
      res.json({ payment_status: 'PAID' });
      return;
    }

    res.json({ payment_status: 'PENDING' });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/:id/apply-promo
router.post('/:id/apply-promo', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = applyPromoSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { code } = parsed.data;

    // Get order
    const { data: order } = await supabase.from('orders').select('*').eq('id', id).single();
    if (!order) {
      res.status(404).json({ error: 'ORDER_NOT_FOUND' });
      return;
    }

    if (order.payment_status === 'PAID') {
      res.status(400).json({ error: 'ALREADY_PAID', message: 'Order is already paid.' });
      return;
    }

    // Get promo
    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (!promo) {
      res.status(404).json({ error: 'INVALID_PROMO', message: 'Promo code is invalid or expired.' });
      return;
    }

    if (promo.max_uses > 0 && promo.uses >= promo.max_uses) {
      res.status(400).json({ error: 'PROMO_EXHAUSTED', message: 'Promo code usage limit reached.' });
      return;
    }

    if (promo.min_quantity > order.quantity) {
      res.status(400).json({ error: 'PROMO_MIN_QTY', message: `This promo code requires at least ${promo.min_quantity} tickets.` });
      return;
    }

    const discountAmount = Number((order.subtotal * (promo.discount_percentage / 100)).toFixed(2));
    const newTotal = order.subtotal - discountAmount;

    // Update order
    await supabase
      .from('orders')
      .update({
        promo_code_id: promo.id,
        discount: discountAmount,
        total_amount: newTotal,
      })
      .eq('id', id);

    res.json({ message: 'Promo applied successfully', discountAmount, newTotal });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/:id/apply-referral
router.post('/:id/apply-referral', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ error: 'Referral code is required' });
      return;
    }

    // Get order
    const { data: order } = await supabase.from('orders').select('*').eq('id', id).single();
    if (!order) {
      res.status(404).json({ error: 'ORDER_NOT_FOUND' });
      return;
    }

    if (order.payment_status === 'PAID') {
      res.status(400).json({ error: 'ALREADY_PAID', message: 'Order is already paid.' });
      return;
    }

    // Get referrer order with that referral code
    const { data: referrerOrder } = await supabase
      .from('orders')
      .select('id, primary_email')
      .eq('referral_code', code.toUpperCase())
      .eq('payment_status', 'PAID')
      .single();

    if (!referrerOrder) {
      res.status(404).json({ error: 'INVALID_REFERRAL', message: 'Referral code is invalid or expired.' });
      return;
    }

    // Prevent self-referral if emails match
    if (referrerOrder.primary_email && order.primary_email && referrerOrder.primary_email.toLowerCase() === order.primary_email.toLowerCase()) {
      res.status(400).json({ error: 'SELF_REFERRAL', message: 'You cannot refer yourself.' });
      return;
    }

    // Update order
    await supabase
      .from('orders')
      .update({
        referred_by_order_id: referrerOrder.id,
      })
      .eq('id', id);

    res.json({ message: 'Referral code applied successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/orders/:id/referral
router.delete('/:id/referral', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: order } = await supabase.from('orders').select('payment_status').eq('id', id).single();
    if (!order) {
      res.status(404).json({ error: 'ORDER_NOT_FOUND' });
      return;
    }

    if (order.payment_status === 'PAID') {
      res.status(400).json({ error: 'ALREADY_PAID', message: 'Order cannot be modified after payment.' });
      return;
    }

    await supabase
      .from('orders')
      .update({
        referred_by_order_id: null,
      })
      .eq('id', id);

    res.json({ message: 'Referral code removed' });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/:id/attendees
router.post('/:id/attendees', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = attendeesSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { primary_email, attendees } = parsed.data;

    const { data: order } = await supabase.from('orders').select('*, pass_types(slug, price)').eq('id', id).single();
    if (!order) {
      res.status(404).json({ error: 'ORDER_NOT_FOUND' });
      return;
    }

    if (order.payment_status === 'PAID') {
      res.status(400).json({ error: 'ALREADY_PAID', message: 'Order cannot be modified after payment.' });
      return;
    }

    // If a checkout session is live, it holds the OLD quantity of tickets locked.
    // Release them (at the old quantity) and abandon the session before we mutate
    // the order, otherwise inventory leaks or a re-initiate releases the wrong amount.
    const { data: activePayments } = await supabase
      .from('payments')
      .select('id')
      .eq('order_id', id)
      .eq('status', 'initiated');

    if (activePayments && activePayments.length > 0) {
      // Atomic claim: only abandon rows STILL 'initiated'. If one just got paid,
      // the guard skips it so we never release a ticket the customer bought.
      const { data: abandoned } = await supabase
        .from('payments')
        .update({ status: 'abandoned' })
        .in('id', activePayments.map(p => p.id))
        .eq('status', 'initiated')
        .select('id');

      if (abandoned && abandoned.length > 0) {
        await supabase.rpc('release_tickets', {
          p_pass_id: order.pass_type_id,
          p_amount: order.quantity * abandoned.length,
        });
      }
    }

    // Instead of failing on mismatch, we dynamically adjust the order quantity
    // based on how many attendees the user provided in Step 2.
    const newQuantity = attendees.length;
    const newSubtotal = order.pass_types.price * newQuantity;

    // We assume promo code is applied in Step 3, so we just set total_amount to subtotal.
    // If a promo was somehow already applied, it will be recalculated when they re-apply it.
    const { error: updateError } = await supabase.from('orders').update({ 
      primary_email,
      quantity: newQuantity,
      subtotal: newSubtotal,
      total_amount: newSubtotal,
      discount: 0,
      promo_code_id: null
    }).eq('id', id);

    if (updateError) throw updateError;

    // Remove existing attendees for this order to replace them
    await supabase.from('registrations').delete().eq('order_id', id);

    // Insert new attendees into registrations
    const registrationsToInsert = attendees.map(a => ({
      order_id: id,
      pass_type_id: order.pass_type_id,
      pass_slug: order.pass_types.slug,
      full_name: a.full_name,
      email: a.email,
      phone: a.phone || null,
      role: a.role,
      organization: a.organization,
      payment_status: 'PENDING',
    }));

    const { error: insertError } = await supabase.from('registrations').insert(registrationsToInsert);
    if (insertError) throw insertError;

    res.json({ 
      message: 'Attendees saved successfully',
      order: {
        quantity: newQuantity,
        total_amount: newSubtotal
      }
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/orders/:id/promo
router.delete('/:id/promo', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('subtotal, payment_status')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (order.payment_status === 'PAID') {
      res.status(400).json({ error: 'ALREADY_PAID', message: 'Order cannot be modified after payment.' });
      return;
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        promo_code_id: null,
        discount: 0,
        total_amount: order.subtotal
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
});

export default router;
