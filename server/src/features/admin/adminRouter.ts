import { Router } from 'express';
import { supabase } from '../../shared/lib/supabase.js';
import { adminKeyGuard } from '../../shared/middleware/adminKeyGuard.js';

const router = Router();
router.use(adminKeyGuard);

// GET /api/admin/stats
router.get('/stats', async (_req, res, next) => {
  try {
    // Get all pass types
    const { data: passTypes } = await supabase
      .from('pass_types')
      .select('id, name, slug, price, capacity, sold')
      .order('sort_order', { ascending: true });

    // Get checked-in counts per pass type
    const { data: checkedInData } = await supabase
      .from('registrations')
      .select('pass_type_id')
      .eq('checked_in', true)
      .eq('payment_status', 'PAID');

    const checkedInMap: Record<string, number> = {};
    (checkedInData || []).forEach((r) => {
      checkedInMap[r.pass_type_id] = (checkedInMap[r.pass_type_id] || 0) + 1;
    });

    // Get true revenue from paid payments
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('amount, registrations!inner(pass_type_id)')
      .eq('status', 'paid');

    const revenueMap: Record<string, number> = {};
    (paymentsData || []).forEach((p) => {
      const pId = (p.registrations as any).pass_type_id;
      revenueMap[pId] = (revenueMap[pId] || 0) + Number(p.amount || 0);
    });

    let total_sold = 0;
    let total_revenue = 0;
    let total_checked_in = 0;

    const by_pass_type = (passTypes || []).map((pt) => {
      const checked_in = checkedInMap[pt.id] || 0;
      const revenue = revenueMap[pt.id] || 0;
      
      total_sold += pt.sold;
      total_revenue += revenue;
      total_checked_in += checked_in;

      return {
        slug: pt.slug,
        name: pt.name,
        sold: pt.sold,
        capacity: pt.capacity,
        revenue,
        checked_in,
      };
    });

    res.json({ total_sold, total_revenue, total_checked_in, by_pass_type });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/passes
router.get('/passes', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('pass_types')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const passes = (data || []).map((p) => ({
      ...p,
      available: p.capacity - p.sold,
    }));

    res.json(passes);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/registrations
router.get('/registrations', async (req, res, next) => {
  try {
    const {
      pass_slug,
      payment_status,
      checked_in,
      search,
      page = '1',
      limit = '50',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from('registrations')
      .select('*, pass_types(name, badge_color)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (pass_slug) query = query.eq('pass_slug', pass_slug);
    if (payment_status) query = query.eq('payment_status', payment_status);
    if (checked_in !== undefined && checked_in !== '') {
      query = query.eq('checked_in', checked_in === 'true');
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({
      registrations: data || [],
      total: count || 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/export-csv
router.get('/export-csv', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('ticket_number, pass_slug, full_name, email, phone, role, organization, payment_status, checked_in, checked_in_at, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const headers = 'ticket_number,pass_type,full_name,email,phone,role,organization,payment_status,checked_in,checked_in_at,created_at';
    const rows = (data || []).map((r) =>
      [r.ticket_number, r.pass_slug, r.full_name, r.email, r.phone || '', r.role, r.organization, r.payment_status, r.checked_in, r.checked_in_at || '', r.created_at]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const date = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=scd-registrations-${date}.csv`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/passes/:id
router.put('/passes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate price and capacity if provided
    if (updates.price !== undefined && updates.price < 1) {
      res.status(400).json({ error: 'Price must be >= 1' });
      return;
    }

    if (updates.capacity !== undefined) {
      const { data: current } = await supabase
        .from('pass_types')
        .select('sold')
        .eq('id', id)
        .single();

      if (current && updates.capacity < current.sold) {
        res.status(400).json({ error: `Capacity cannot be less than current sold count (${current.sold})` });
        return;
      }
    }

    // Only allow safe fields
    const allowedFields = ['name', 'description', 'price', 'capacity', 'perks', 'is_active', 'badge_color', 'sort_order'];
    const safeUpdates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) safeUpdates[key] = updates[key];
    }

    const { data, error } = await supabase
      .from('pass_types')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/passes — create a new pass type
router.post('/passes', async (req, res, next) => {
  try {
    const { name, slug, description, price, capacity, perks, badge_color, sort_order } = req.body;

    if (!name || !slug || price === undefined || !capacity) {
      res.status(400).json({ error: 'name, slug, price, and capacity are required' });
      return;
    }
    if (price < 1) {
      res.status(400).json({ error: 'Price must be >= 1' });
      return;
    }

    const { data, error } = await supabase
      .from('pass_types')
      .insert({
        name,
        slug,
        description: description || '',
        price,
        capacity,
        perks: perks || [],
        badge_color: badge_color || '#6B7280',
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        res.status(409).json({ error: 'A pass type with that slug already exists' });
        return;
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/refund
router.post('/refund', async (req, res, next) => {
  try {
    const { registration_id } = req.body;
    if (!registration_id) {
      res.status(400).json({ error: 'registration_id is required' });
      return;
    }

    const { data: payment, error: pErr } = await supabase
      .from('payments')
      .select('*')
      .eq('registration_id', registration_id)
      .eq('status', 'paid')
      .single();

    if (pErr || !payment) {
      res.status(404).json({ error: 'No paid payment found for this registration' });
      return;
    }

    // Call Cashfree refund API
    const refundRes = await fetch(`https://api.cashfree.com/pg/orders/${payment.cashfree_order_id}/refunds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.CASHFREE_APP_ID!,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
      },
      body: JSON.stringify({
        refund_amount: Number(payment.amount),
        refund_id: `refund-${payment.cashfree_order_id}`,
      }),
    });

    if (!refundRes.ok) {
      const errData = await refundRes.json();
      console.error('[Refund Error]', errData);
      res.status(502).json({ error: 'Refund failed at payment gateway' });
      return;
    }

    // Update statuses
    await supabase
      .from('payments')
      .update({ status: 'refunded' })
      .eq('id', payment.id);

    await supabase
      .from('registrations')
      .update({ payment_status: 'REFUNDED' })
      .eq('id', registration_id);

    res.json({ message: 'Refund initiated' });
  } catch (err) {
    next(err);
  }
});

export default router;
