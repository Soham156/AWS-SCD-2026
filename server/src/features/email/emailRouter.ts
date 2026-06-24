import { Router } from 'express';
import { supabase } from '../../shared/lib/supabase.js';
import { generateTicketPdf } from './ticketPdfGenerator.js';
import { verifyQRToken } from '../../shared/lib/qrToken.js';

const router = Router();

/**
 * GET /api/email/ticket/:id/download?token=<qr_token>
 *
 * Serves a server-generated ticket PNG image for email download links.
 * Authenticated via the QR token (HMAC-signed, same as check-in QR codes).
 */
router.get('/ticket/:id/download', async (req, res, next) => {
  try {
    const { id } = req.params;
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({ error: 'Missing token parameter' });
      return;
    }

    // Verify the QR token
    const { valid, ticket_number } = verifyQRToken(token);
    if (!valid || !ticket_number) {
      res.status(403).json({ error: 'Invalid or expired download token' });
      return;
    }

    // Fetch registration by ID and verify ticket_number matches
    const { data: reg, error } = await supabase
      .from('registrations')
      .select('id, full_name, role, organization, ticket_number, qr_token, pass_slug, payment_status, pass_types(name, badge_color)')
      .eq('id', id)
      .single();

    if (error || !reg) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    if (reg.payment_status !== 'PAID') {
      res.status(403).json({ error: 'Ticket not yet confirmed' });
      return;
    }

    if (reg.ticket_number !== ticket_number) {
      res.status(403).json({ error: 'Token does not match this ticket' });
      return;
    }

    const passType = reg.pass_types as any;

    const pdfBuffer = await generateTicketPdf({
      ticket_number: reg.ticket_number,
      full_name: reg.full_name,
      pass_name: passType?.name || reg.pass_slug,
      role: reg.role,
      organization: reg.organization,
      qr_token: reg.qr_token,
      badge_color: passType?.badge_color || '#6B7280',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reg.ticket_number}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

export default router;
