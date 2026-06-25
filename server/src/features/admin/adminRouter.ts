import { Router } from 'express';
import { supabase } from '../../shared/lib/supabase.js';
import { adminKeyGuard } from '../../shared/middleware/adminKeyGuard.js';
import { authLimiter } from '../../shared/middleware/rateLimiter.js';

const router = Router();

// GET /api/admin/verify
router.get('/verify', authLimiter, adminKeyGuard, (_req, res) => {
  res.json({ success: true });
});

router.use(adminKeyGuard);

// GET /api/admin/settings
router.get('/settings', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || { registration_enabled: false });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/settings
router.put('/settings', async (req, res, next) => {
  try {
    const { registration_enabled } = req.body;
    
    // Upsert the single row (we can just update the first row or delete all and insert one)
    // Since we know there's one row, we can just update without a specific ID if we use a trick, 
    // or we can delete all and insert one. Let's delete all and insert one to be safe.
    await supabase.from('app_settings').delete().not('id', 'is', null);
    
    const { data, error } = await supabase
      .from('app_settings')
      .insert({ registration_enabled })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});
// Promo Codes Management

router.get('/promo-codes', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/promo-codes', async (req, res, next) => {
  try {
    const { code, discount_percentage, min_quantity, max_uses, is_active } = req.body;
    if (!code || discount_percentage === undefined || min_quantity === undefined || max_uses === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        code: code.toUpperCase(),
        discount_percentage,
        min_quantity,
        max_uses,
        is_active: is_active ?? true,
        uses: 0
      })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'Promo code already exists' });
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/promo-codes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, discount_percentage, min_quantity, max_uses, is_active } = req.body;
    
    // We do NOT update `uses` to preserve history, only `max_uses` can be increased
    const updateData: any = {};
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (discount_percentage !== undefined) updateData.discount_percentage = discount_percentage;
    if (min_quantity !== undefined) updateData.min_quantity = min_quantity;
    if (max_uses !== undefined) updateData.max_uses = max_uses;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('promo_codes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'Promo code already exists' });
      throw error;
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/promo-codes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/promo-codes/:id/orders
router.get('/promo-codes/:id/orders', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, primary_email, total_amount, payment_status, quantity, discount')
      .eq('promo_code_id', id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats
router.get('/stats', async (_req, res, next) => {
  try {
    // Get all pass types
    const { data: passTypes } = await supabase
      .from('pass_types')
      .select('id, name, slug, price, capacity, sold')
      .order('sort_order', { ascending: true });

    // Get checked-in counts per pass type
    const { data: paidRegs } = await supabase
      .from('registrations')
      .select('pass_type_id, checked_in')
      .eq('payment_status', 'PAID');

    const checkedInMap: Record<string, number> = {};
    const actualSoldMap: Record<string, number> = {};
    
    (paidRegs || []).forEach((r) => {
      actualSoldMap[r.pass_type_id] = (actualSoldMap[r.pass_type_id] || 0) + 1;
      if (r.checked_in) {
        checkedInMap[r.pass_type_id] = (checkedInMap[r.pass_type_id] || 0) + 1;
      }
    });

    // Get true revenue from paid payments
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('amount, registrations(pass_type_id)')
      .eq('status', 'paid');

    const revenueMap: Record<string, number> = {};
    (paymentsData || []).forEach((p) => {
      const pId = (p.registrations as any)?.pass_type_id;
      if (pId) {
        revenueMap[pId] = (revenueMap[pId] || 0) + Number(p.amount || 0);
      }
    });

    let total_sold = 0;
    let total_revenue = 0;
    let total_checked_in = 0;

    const by_pass_type = (passTypes || []).map((pt) => {
      const checked_in = checkedInMap[pt.id] || 0;
      const revenue = revenueMap[pt.id] || 0;
      const sold = actualSoldMap[pt.id] || 0;
      
      total_sold += sold;
      total_revenue += revenue;
      total_checked_in += checked_in;

      return {
        slug: pt.slug,
        name: pt.name,
        sold,
        capacity: pt.capacity || 0,
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

    const { data: paidRegs } = await supabase
      .from('registrations')
      .select('pass_type_id')
      .eq('payment_status', 'PAID');

    const actualSoldMap: Record<string, number> = {};
    (paidRegs || []).forEach((r) => {
      actualSoldMap[r.pass_type_id] = (actualSoldMap[r.pass_type_id] || 0) + 1;
    });

    const passes = (data || []).map((p) => {
      const sold = actualSoldMap[p.id] || 0;
      return {
        ...p,
        sold,
        available: p.capacity - sold,
      };
    });

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
      email_status,
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
    if (email_status) query = query.eq('email_status', email_status);
    if (checked_in !== undefined && checked_in !== '') {
      query = query.eq('checked_in', checked_in === 'true');
    }
    if (search) {
      // Escape commas to prevent PostgREST from splitting the .or() conditions incorrectly
      const safeSearch = search.replace(/,/g, '');
      query = query.or(`full_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`);
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

      if (current && updates.capacity < (current.sold || 0)) {
        res.status(400).json({ error: `Capacity cannot be less than current sold count (${current.sold || 0})` });
        return;
      }
    }

    // Only allow safe fields
    const allowedFields = ['name', 'description', 'price', 'capacity', 'perks', 'is_active', 'badge_color', 'sort_order', 'label'];
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
        label: req.body.label || null,
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

// POST /api/admin/shoutout
router.post('/shoutout', async (req, res, next) => {
  try {
    const { mimeMessage } = req.body;
    
    if (!mimeMessage) {
      res.status(400).json({ error: 'mimeMessage is required' });
      return;
    }

    // Since SES is pending, we'll just log the intent to the server console.
    // In the future, we will fetch all emails and use AWS SES SendRawEmailCommand.
    console.log('[Admin Shoutout] Mock sending broadcast. Received MIME payload:');
    console.log('----------------------------------------------------');
    console.log(mimeMessage);
    console.log('----------------------------------------------------');
    console.log('[Admin Shoutout] Note: Email dispatch is stubbed out for now.');

    res.status(200).json({ success: true, message: 'Shoutout queued successfully (stubbed)' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/speakers
router.get('/speakers', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('speaker_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/partners
router.get('/partners', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('community_partners')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/sponsors
router.get('/sponsors', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('sponsor_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/applications/:type/:id/status
router.put('/applications/:type/:id/status', async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { status } = req.body;

    let table = '';
    if (type === 'speaker') table = 'speaker_applications';
    else if (type === 'partner') table = 'community_partners';
    else if (type === 'sponsor') table = 'sponsor_applications';
    else {
      res.status(400).json({ error: 'Invalid application type' });
      return;
    }

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const { data, error } = await supabase
      .from(table)
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// --- Email Monitoring Endpoints ---

// GET /api/admin/email-stats — email delivery dashboard
router.get('/email-stats', async (_req, res, next) => {
  try {
    const { data: jobs, error } = await supabase
      .from('email_jobs')
      .select('status');

    if (error) throw error;

    const counts = { pending: 0, processing: 0, sent: 0, failed: 0, cancelled: 0, total: 0 };
    (jobs || []).forEach((j) => {
      counts[j.status as keyof typeof counts] = (counts[j.status as keyof typeof counts] || 0) + 1;
      counts.total++;
    });

    res.json(counts);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/email-jobs — list email jobs with filtering
router.get('/email-jobs', async (req, res, next) => {
  try {
    const {
      status,
      email_type,
      page = '1',
      limit = '50',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from('email_jobs')
      .select('id, idempotency_key, email_type, recipient_email, recipient_name, subject, status, attempts, last_error, provider_message_id, created_at, updated_at, sent_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('status', status);
    if (email_type) query = query.eq('email_type', email_type);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({
      jobs: data || [],
      total: count || 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/email-retry — manually retry a failed email job
router.post('/email-retry', async (req, res, next) => {
  try {
    const { job_id } = req.body;
    if (!job_id) {
      res.status(400).json({ error: 'job_id is required' });
      return;
    }

    const { data: job, error: fetchErr } = await supabase
      .from('email_jobs')
      .select('id, status')
      .eq('id', job_id)
      .single();

    if (fetchErr || !job) {
      res.status(404).json({ error: 'Email job not found' });
      return;
    }

    if (job.status === 'sent') {
      res.status(400).json({ error: 'Job already sent successfully' });
      return;
    }

    if (job.status === 'processing') {
      res.status(400).json({ error: 'Job is currently being processed' });
      return;
    }

    const { error: updateErr } = await supabase
      .from('email_jobs')
      .update({
        status: 'pending',
        last_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job_id);

    if (updateErr) throw updateErr;

    res.json({ message: 'Job queued for retry' });
  } catch (err) {
    next(err);
  }
});

export default router;

