import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../../shared/lib/supabase.js';

const router = Router();

const registerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit number'),
  role: z.enum(['student', 'professional'], { message: 'Role must be student or professional' }),
  organization: z.string().min(1, 'Organization is required'),
  pass_type_id: z.string().uuid('Invalid pass type'),
});
import { registrationLimiter } from '../../shared/middleware/rateLimiter.js';

// POST /api/tickets/register
router.post('/register', registrationLimiter, async (req, res, next) => {
  try {
    const { data: settings } = await supabase
      .from('app_settings')
      .select('registration_enabled')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!settings || !settings.registration_enabled) {
      res.status(403).json({ error: 'REGISTRATION_CLOSED', message: 'Ticket registrations are currently closed.' });
      return;
    }

    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
      return;
    }
    const { full_name, email, phone, role, organization, pass_type_id } = parsed.data;

    // Check existing registration by email
    const { data: existing } = await supabase
      .from('registrations')
      .select('id, payment_status, ticket_number')
      .eq('email', email)
      .single();

    if (existing) {
      if (existing.payment_status === 'PAID') {
        res.status(409).json({ error: 'ALREADY_REGISTERED', message: 'You are already registered for this event.' });
        return;
      } else {
        // For PENDING, FAILED, EXPIRED -> reuse the registration
        // Update the details in case they changed pass type or name
        
        // Need pass slug first
        const { data: passType, error: ptError } = await supabase
          .from('pass_types')
          .select('slug, capacity, sold')
          .eq('id', pass_type_id)
          .single();

        if (ptError || !passType) {
          res.status(400).json({ error: 'Invalid pass type' });
          return;
        }

        if (passType.capacity - passType.sold <= 0) {
          res.status(400).json({ error: 'SOLD_OUT' });
          return;
        }

        const { error: updateErr } = await supabase
          .from('registrations')
          .update({
            full_name,
            phone,
            role,
            organization,
            pass_type_id,
            pass_slug: passType.slug,
            payment_status: 'PENDING',
          })
          .eq('id', existing.id);

        if (updateErr) throw updateErr;

        // Invalidate old payment sessions to prevent price spoofing and release their reserved tickets
        const { data: initiatedPayments } = await supabase
          .from('payments')
          .select('id, registrations(pass_type_id)')
          .eq('registration_id', existing.id)
          .eq('status', 'initiated');

        if (initiatedPayments && initiatedPayments.length > 0) {
          await supabase
            .from('payments')
            .update({ status: 'expired' })
            .in('id', initiatedPayments.map(p => p.id));
            
          for (const p of initiatedPayments) {
            const passId = (p.registrations as any)?.pass_type_id;
            if (passId) {
              await supabase.rpc('decrement_sold', { pass_id: passId });
            }
          }
        }

        res.status(200).json({ ticket_id: existing.id, ticket_number: existing.ticket_number || '' });
        return;
      }
    }

    // Look up pass type to get slug
    const { data: passType, error: ptError } = await supabase
      .from('pass_types')
      .select('slug, capacity, sold')
      .eq('id', pass_type_id)
      .single();

    if (ptError || !passType) {
      res.status(400).json({ error: 'Invalid pass type' });
      return;
    }

    if (passType.capacity - passType.sold <= 0) {
      res.status(400).json({ error: 'SOLD_OUT' });
      return;
    }

    const { data: registration, error: insertError } = await supabase
      .from('registrations')
      .insert({
        pass_type_id,
        pass_slug: passType.slug,
        full_name,
        email,
        phone,
        role,
        organization,
        payment_status: 'PENDING',
        // ticket_number and qr_token are now NULL until PAID
      })
      .select('id')
      .single();

    if (insertError) {
      // Handle unique constraint on email race condition
      if (insertError.code === '23505' && insertError.message.includes('email')) {
        const { data: dup } = await supabase
          .from('registrations')
          .select('id, payment_status')
          .eq('email', email)
          .single();
          
        if (dup?.payment_status === 'PAID') {
          res.status(409).json({ error: 'ALREADY_REGISTERED', message: 'You are already registered for this event.' });
        } else {
          res.status(200).json({ ticket_id: dup?.id, ticket_number: '' });
        }
        return;
      }
      throw insertError;
    }

    res.status(201).json({ ticket_id: registration.id, ticket_number: '' });
  } catch (err) {
    next(err);
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('id, full_name, role, organization, pass_slug, payment_status, ticket_number, qr_token, checked_in, checked_in_at, created_at, pass_types(name, price, badge_color, perks)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
