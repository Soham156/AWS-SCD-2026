import { supabase } from '../../shared/lib/supabase.js';
import { buildRegistrationConfirmationEmail } from './emailTemplates.js';

/**
 * Enqueues an email job with idempotency protection.
 * If a job with the same idempotency_key already exists (and is sent/processing),
 * it silently returns without creating a duplicate.
 */
export async function enqueueEmail(params: {
  idempotency_key: string;
  email_type: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  html_body: string;
  metadata?: Record<string, unknown>;
}): Promise<{ enqueued: boolean; job_id?: string }> {
  // Check if a job with this key already exists and is sent or processing
  const { data: existing } = await supabase
    .from('email_jobs')
    .select('id, status')
    .eq('idempotency_key', params.idempotency_key)
    .single();

  if (existing) {
    if (existing.status === 'sent' || existing.status === 'processing') {
      console.log(`[Email Queue] Skipping duplicate: ${params.idempotency_key} (status: ${existing.status})`);
      return { enqueued: false, job_id: existing.id };
    }

    // If it previously failed or was cancelled, reset it to pending
    const { error } = await supabase
      .from('email_jobs')
      .update({
        status: 'pending',
        attempts: 0,
        last_error: null,
        subject: params.subject,
        html_body: params.html_body,
        metadata: params.metadata || {},
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) {
      console.error('[Email Queue] Failed to reset job:', error);
      return { enqueued: false };
    }

    console.log(`[Email Queue] Reset existing job to pending: ${params.idempotency_key}`);
    return { enqueued: true, job_id: existing.id };
  }

  // Insert new job
  const { data, error } = await supabase
    .from('email_jobs')
    .insert({
      idempotency_key: params.idempotency_key,
      email_type: params.email_type,
      recipient_email: params.recipient_email,
      recipient_name: params.recipient_name,
      subject: params.subject,
      html_body: params.html_body,
      metadata: params.metadata || {},
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    // Handle race condition: unique constraint violation means another request created it
    if (error.code === '23505') {
      console.log(`[Email Queue] Duplicate caught by constraint: ${params.idempotency_key}`);
      return { enqueued: false };
    }
    console.error('[Email Queue] Failed to enqueue:', error);
    throw error;
  }

  console.log(`[Email Queue] Enqueued: ${params.email_type} → ${params.recipient_email} (${data.id})`);
  return { enqueued: true, job_id: data.id };
}

/**
 * High-level helper: enqueue a registration confirmation email.
 * Called from webhookRouter after payment success + ticket generation.
 */
export async function enqueueRegistrationConfirmation(
  registration_id: string,
  ticket_number: string,
  qr_token: string,
  primary_email?: string
): Promise<void> {
  // Fetch registration + pass type details
  const { data: reg, error } = await supabase
    .from('registrations')
    .select('id, full_name, email, role, organization, pass_slug, pass_types(name, badge_color)')
    .eq('id', registration_id)
    .single();

  if (error || !reg) {
    console.error('[Email Queue] Registration not found for email:', registration_id, error);
    return;
  }

  const passType = reg.pass_types as any;
  const frontendUrl = (process.env.FRONTEND_URL || 'https://aws-scd-dhule.tech').replace(/\/+$/, '');
  const serverUrl = (process.env.SERVER_URL || 'https://api.aws-scd-dhule.tech/').replace(/\/+$/, '');

  const ticket_page_url = `${frontendUrl}/ticket/${registration_id}`;
  const download_url = `${serverUrl}/api/email/ticket/${registration_id}/download?token=${encodeURIComponent(qr_token)}`;

  const { subject, html, text } = buildRegistrationConfirmationEmail({
    full_name: reg.full_name,
    email: reg.email,
    ticket_number,
    pass_name: passType?.name || reg.pass_slug,
    download_url,
    ticket_page_url,
  });

  const metadata = {
    registration_id,
    ticket_number,
    full_name: reg.full_name,
    role: reg.role,
    organization: reg.organization,
    pass_name: passType?.name || reg.pass_slug,
    badge_color: passType?.badge_color || '#6B7280',
    qr_token,
    text_body: text,
  };

  // 1. Send to the actual attendee
  await enqueueEmail({
    idempotency_key: `${registration_id}:registration_confirmation`,
    email_type: 'registration_confirmation',
    recipient_email: reg.email,
    recipient_name: reg.full_name,
    subject,
    html_body: html,
    metadata,
  });

  // 2. If part of a group registration, send a copy to the primary buyer
  if (primary_email && primary_email !== reg.email) {
    await enqueueEmail({
      idempotency_key: `${registration_id}:registration_confirmation_group_copy`,
      email_type: 'registration_confirmation',
      recipient_email: primary_email,
      recipient_name: "Group Buyer",
      subject: `[Group Copy] ${subject}`,
      html_body: html,
      metadata,
    });
  }
}
