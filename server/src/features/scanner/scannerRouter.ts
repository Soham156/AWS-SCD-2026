import { Router } from 'express';
import { supabase } from '../../shared/lib/supabase.js';
import { verifyQRToken } from '../../shared/lib/qrToken.js';
import { scannerKeyGuard } from '../../shared/middleware/scannerKeyGuard.js';
import { authLimiter } from '../../shared/middleware/rateLimiter.js';

const router = Router();

// GET /api/scan/verify-auth
router.get('/verify-auth', authLimiter, scannerKeyGuard, (_req, res) => {
  res.json({ success: true });
});

router.use(scannerKeyGuard);

// GET /api/scan/stats
router.get('/stats', async (_req, res, next) => {
  try {
    const { count: total_sold } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'PAID');

    const { count: total_checked_in } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('checked_in', true)
      .eq('payment_status', 'PAID');

    res.json({ total_sold, total_checked_in: total_checked_in || 0 });
  } catch (err) {
    next(err);
  }
});

// POST /api/scan/verify
router.post('/verify', async (req, res, next) => {
  try {
    const { qr_token } = req.body;
    if (!qr_token) {
      res.status(400).json({ status: 'INVALID', message: 'No QR token provided' });
      return;
    }

    const { valid, ticket_number } = verifyQRToken(qr_token);
    if (!valid || !ticket_number) {
      res.json({ status: 'INVALID' });
      return;
    }

    const { data: registration, error } = await supabase
      .from('registrations')
      .select('*, pass_types(name, slug)')
      .eq('ticket_number', ticket_number)
      .single();

    if (error || !registration) {
      res.json({ status: 'INVALID' });
      return;
    }

    if (registration.payment_status !== 'PAID') {
      res.json({ status: 'NOT_PAID' });
      return;
    }

    const passData = registration.pass_types as any;

    if (registration.checked_in) {
      res.json({
        status: 'ALREADY_CHECKED_IN',
        id: registration.id,
        attendee_name: registration.full_name,
        ticket_number: registration.ticket_number,
        pass_slug: passData?.slug || registration.pass_slug,
        organization: registration.organization,
        checked_in_at: registration.checked_in_at
      });
      return;
    }

    res.json({
      status: 'VALID',
      id: registration.id,
      attendee_name: registration.full_name,
      ticket_number: registration.ticket_number,
      pass_slug: passData?.slug || registration.pass_slug,
      organization: registration.organization,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/scan/checkin
router.post('/checkin', async (req, res, next) => {
  try {
    const { registration_id } = req.body;
    if (!registration_id) {
      res.status(400).json({ error: 'registration_id is required' });
      return;
    }

    const { data: registration, error } = await supabase
      .from('registrations')
      .select('*, pass_types(name, slug)')
      .eq('id', registration_id)
      .single();

    if (error || !registration) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    if (registration.payment_status !== 'PAID') {
      res.status(400).json({ error: 'Ticket is not paid' });
      return;
    }

    if (registration.checked_in) {
      res.status(400).json({ error: 'Attendee is already checked in' });
      return;
    }

    const now = new Date().toISOString();
    // Guard against a check-in race: only the update that flips checked_in
    // false→true matches. A concurrent scan finds 0 rows and is rejected.
    const { data: updated, error: updateError } = await supabase
      .from('registrations')
      .update({ checked_in: true, checked_in_at: now })
      .eq('id', registration.id)
      .eq('checked_in', false)
      .select('id');

    if (updateError) throw updateError;

    if (!updated || updated.length === 0) {
      res.status(400).json({ error: 'Attendee is already checked in' });
      return;
    }

    const passData = registration.pass_types as any;
    res.json({
      success: true,
      attendee_name: registration.full_name,
      ticket_number: registration.ticket_number,
      pass_slug: passData?.slug || registration.pass_slug,
      organization: registration.organization,
      checked_in_at: now
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/scan/search
router.post('/search', async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    // Strip PostgREST filter metacharacters before interpolating into .or()
    const cleanQuery = query.trim().replace(/[%_.,()\/\[\]]/g, '');

    const { data: registrations, error } = await supabase
      .from('registrations')
      .select('*, pass_types(name, slug)')
      .eq('payment_status', 'PAID')
      .or(`ticket_number.ilike.%${cleanQuery}%,email.ilike.%${cleanQuery}%,full_name.ilike.%${cleanQuery}%`)
      .order('full_name', { ascending: true })
      .limit(20);

    if (error) throw error;

    res.json(registrations);
  } catch (err) {
    next(err);
  }
});

// GET /api/scan/attendees
router.get('/attendees', async (_req, res, next) => {
  try {
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select('id, full_name, ticket_number, checked_in, checked_in_at, pass_slug, pass_types(name, slug), organization')
      .eq('checked_in', true)
      .eq('payment_status', 'PAID')
      .order('checked_in_at', { ascending: false });

    if (error) throw error;

    res.json(registrations);
  } catch (err) {
    next(err);
  }
});

export default router;
