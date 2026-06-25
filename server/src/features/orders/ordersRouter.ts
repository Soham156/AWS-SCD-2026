import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../../shared/lib/supabase.js';

const router = Router();

const createOrderSchema = z.object({
  pass_type_id: z.string().uuid(),
  quantity: z.number().min(1).max(20),
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
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { pass_type_id, quantity } = parsed.data;

    // Validate pass type
    const { data: passType, error: ptError } = await supabase
      .from('pass_types')
      .select('id, price, capacity, sold')
      .eq('id', pass_type_id)
      .single();

    if (ptError || !passType) {
      res.status(404).json({ error: 'PASS_NOT_FOUND', message: 'Invalid pass type.' });
      return;
    }

    // Atomically reserve tickets
    const { data: reserved, error: reserveError } = await supabase
      .rpc('reserve_tickets', { p_pass_id: pass_type_id, p_amount: quantity });

    if (reserveError || !reserved) {
      res.status(400).json({ error: 'SOLD_OUT', message: `Not enough tickets remaining.` });
      return;
    }

    const subtotal = passType.price * quantity;

    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
        pass_type_id,
        quantity,
        subtotal,
        discount: 0,
        total_amount: subtotal,
        payment_status: 'PENDING',
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ order_id: order.id });
  } catch (err) {
    next(err);
  }
});

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

    res.json({ ...order, attendees: attendees || [] });
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
