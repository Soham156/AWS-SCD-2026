import { Router } from 'express';
import { supabase } from '../../shared/lib/supabase.js';
import { verifyQRToken } from '../../shared/lib/qrToken.js';

const router = Router();

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

    if (registration.checked_in) {
      res.json({ status: 'ALREADY_CHECKED_IN', checked_in_at: registration.checked_in_at });
      return;
    }

    // Check in
    const now = new Date().toISOString();
    await supabase
      .from('registrations')
      .update({ checked_in: true, checked_in_at: now })
      .eq('id', registration.id);

    const passData = registration.pass_types as any;
    res.json({
      status: 'VALID',
      attendee_name: registration.full_name,
      ticket_number: registration.ticket_number,
      pass_slug: passData?.slug || registration.pass_slug,
      organization: registration.organization,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
