import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../../shared/lib/supabase.js';
import { randomInt, timingSafeEqual } from 'crypto';
import { otpLimiter } from '../../shared/middleware/rateLimiter.js';
import { otpEmailTemplate } from './otpEmailTemplate.js';

const router = Router();

const sendOtpSchema = z.object({
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});



// Helper to send email via Mailtrap REST API
async function sendMailtrapEmail(toEmail: string, otp: string) {
  const mailtrapToken = process.env.MAILTRAP_API_KEY; // Token from .env
  if (!mailtrapToken) {
    console.warn('[OTP] Mailtrap token missing, falling back to console logging');
    console.log(`[OTP] Sent to ${toEmail}: ${otp}`);
    return;
  }

  const emailFrom = process.env.EMAIL_FROM || 'no-reply@aws-scd-dhule.tech';

  try {
    const response = await fetch('https://send.api.mailtrap.io/api/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mailtrapToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { email: emailFrom, name: 'AWS SCD 2026' },
        to: [{ email: toEmail }],
        subject: 'Your Registration OTP - AWS SCD 2026',
        text: `Your OTP for registration is: ${otp}. It is valid for 10 minutes.`,
        html: otpEmailTemplate.replace('{{otp}}', otp).replace('{{name}}', 'Awesome Builder'),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OTP] Mailtrap API Error:', errorText);
      console.warn(`[OTP] Failed to send via Mailtrap. Falling back to console logging.\n[OTP] Sent to ${toEmail}: ${otp}`);
      return;
    }

    console.log('[OTP] Message sent via Mailtrap API successfully.');
  } catch (error) {
    console.error('[OTP] Error sending email:', error);
    console.warn(`[OTP] Network error. Falling back to console logging.\n[OTP] Sent to ${toEmail}: ${otp}`);
  }
}

// GET /api/auth/check-email?email=xxx
router.get('/check-email', async (req, res, next) => {
  try {
    const email = req.query.email as string;
    if (!email || !z.string().email().safeParse(email).success) {
      res.status(400).json({ error: 'INVALID_EMAIL' });
      return;
    }

    const { data: existingRegs } = await supabase
      .from('registrations')
      .select('order_id, payment_status')
      .eq('email', email);

    const { data: existingOrders } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('primary_email', email);

    // 1. Check if they have a PAID registration or PAID order directly
    const hasPaidReg = existingRegs?.some(r => r.payment_status === 'PAID');
    const hasPaidOrder = existingOrders?.some(o => o.payment_status === 'PAID');

    if (hasPaidReg || hasPaidOrder) {
      res.json({ registered: true });
      return;
    }

    // 2. Fallback to check if there are any 'paid' rows in payments table
    const orderIds = Array.from(new Set([
      ...(existingRegs || []).map(r => r.order_id),
      ...(existingOrders || []).map(o => o.id)
    ])).filter(Boolean);

    if (orderIds.length > 0) {
      const { data: successfulPayments } = await supabase
        .from('payments')
        .select('id')
        .in('order_id', orderIds)
        .eq('status', 'paid')
        .limit(1);

      if (successfulPayments && successfulPayments.length > 0) {
        res.json({ registered: true });
        return;
      }
    }

    res.json({ registered: false });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/send-otp
router.post('/send-otp', otpLimiter, async (req, res, next) => {
  try {
    const parsed = sendOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email } = parsed.data;

    // Check if email is already associated with a successful payment (either as primary_email or attendee)
    const { data: existingRegs } = await supabase
      .from('registrations')
      .select('order_id, payment_status')
      .eq('email', email);

    const { data: existingOrders } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('primary_email', email);

    const hasPaidReg = existingRegs?.some(r => r.payment_status === 'PAID');
    const hasPaidOrder = existingOrders?.some(o => o.payment_status === 'PAID');

    if (hasPaidReg || hasPaidOrder) {
      res.status(400).json({ error: 'EMAIL_ALREADY_REGISTERED' });
      return;
    }

    const orderIds = Array.from(new Set([
      ...(existingRegs || []).map(r => r.order_id),
      ...(existingOrders || []).map(o => o.id)
    ])).filter(Boolean);

    if (orderIds.length > 0) {
      const { data: successfulPayments } = await supabase
        .from('payments')
        .select('id')
        .in('order_id', orderIds)
        .eq('status', 'paid')
        .limit(1);

      if (successfulPayments && successfulPayments.length > 0) {
        res.status(400).json({ 
          error: 'EMAIL_ALREADY_REGISTERED', 
          message: 'This email is already associated with a purchased ticket.' 
        });
        return;
      }
    }

    // Rate limiting: Check recent OTP requests (max 3 per 5 mins)
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentRequests } = await supabase
      .from('otp_verifications')
      .select('id')
      .eq('email', email)
      .gt('created_at', fiveMinsAgo);

    if (recentRequests && recentRequests.length >= 3) {
      res.status(429).json({ error: 'RATE_LIMIT_EXCEEDED', message: 'Too many OTP requests. Please try again later.' });
      return;
    }

    // Generate 6-digit OTP
    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    // Save to DB
    const { error: insertError } = await supabase
      .from('otp_verifications')
      .insert({
        email,
        otp,
        expires_at: expiresAt,
      });

    if (insertError) throw insertError;

    // Send via Mailtrap
    await sendMailtrapEmail(email, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', otpLimiter, async (req, res, next) => {
  try {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, otp } = parsed.data;

    // Get the latest unverified OTP for this email
    const { data: otpRecord, error } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !otpRecord) {
      res.status(400).json({ error: 'INVALID_OTP', message: 'No pending OTP found for this email.' });
      return;
    }

    // Check expiry
    if (new Date() > new Date(otpRecord.expires_at)) {
      res.status(400).json({ error: 'OTP_EXPIRED', message: 'This OTP has expired. Please request a new one.' });
      return;
    }

    // Check max attempts
    if (otpRecord.attempts >= 3) {
      res.status(400).json({ error: 'MAX_ATTEMPTS_REACHED', message: 'Too many failed attempts. Please request a new OTP.' });
      return;
    }

    // Verify OTP
    if (!timingSafeEqual(Buffer.from(otpRecord.otp), Buffer.from(otp))) {
      // Increment attempts
      await supabase
        .from('otp_verifications')
        .update({ attempts: otpRecord.attempts + 1 })
        .eq('id', otpRecord.id);

      res.status(400).json({ error: 'INVALID_OTP', message: 'Incorrect OTP.' });
      return;
    }

    // Mark as verified
    await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
