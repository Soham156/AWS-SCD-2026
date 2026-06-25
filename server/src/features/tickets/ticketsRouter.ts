import { Router } from 'express';
import { supabase } from '../../shared/lib/supabase.js';

const router = Router();

// GET /api/tickets/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Try to find the registration by ID first
    let { data: reg } = await supabase
      .from('registrations')
      .select('*, pass_types(name, badge_color)')
      .eq('id', id)
      .single();

    // If not found by registration ID, it might be an order ID.
    // Fetch the primary registration for this order.
    if (!reg) {
      const { data: orderRegs } = await supabase
        .from('registrations')
        .select('*, pass_types(name, badge_color)')
        .eq('order_id', id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (orderRegs && orderRegs.length > 0) {
        reg = orderRegs[0];
      }
    }

    if (!reg) {
      // Check if the order exists but has no registrations yet
      const { data: order } = await supabase.from('orders').select('payment_status').eq('id', id).single();
      if (order) {
        res.json({ payment_status: order.payment_status });
        return;
      }
      res.status(404).json({ error: 'TICKET_NOT_FOUND' });
      return;
    }

    // Return the registration details
    res.json({
      ...reg,
      payment_status: reg.payment_status,
      pass_types: reg.pass_types
    });
  } catch (err) {
    next(err);
  }
});

export default router;
