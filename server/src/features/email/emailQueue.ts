import { supabase } from '../../shared/lib/supabase.js';
import { buildRegistrationConfirmationEmail, buildGroupRegistrationConfirmationEmail } from './emailTemplates.js';

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
 * High-level helper: enqueue registration confirmation emails for an entire order.
 * Called from webhookRouter after payment success + ticket generation.
 */
export async function enqueueOrderEmails(order_id: string, primary_email?: string): Promise<void> {
  // Fetch all registrations for this order
  const { data: regs, error } = await supabase
    .from('registrations')
    .select('id, full_name, email, role, organization, pass_slug, ticket_number, qr_token, pass_types(name, badge_color)')
    .eq('order_id', order_id);

  if (error || !regs || regs.length === 0) {
    console.error('[Email Queue] No registrations found for order:', order_id, error);
    return;
  }

  let frontendUrl = (process.env.FRONTEND_URL || 'https://aws-scd-dhule.tech').replace(/\/+$/, '');
  if (process.env.NODE_ENV === 'production' && frontendUrl.includes('localhost')) {
    frontendUrl = 'https://aws-scd-dhule.tech';
  }
  const serverUrl = (process.env.SERVER_URL || 'https://api.aws-scd-dhule.tech/').replace(/\/+$/, '');

  // Fetch referral code for this order (generated during fulfillment)
  const { data: orderData } = await supabase
    .from('orders')
    .select('referral_code')
    .eq('id', order_id)
    .single();
  const referral_code = orderData?.referral_code || null;
  const referral_url = referral_code ? `${frontendUrl}/ticket?ref=${referral_code}` : null;

  // If there's only 1 ticket, process as a single registration email
  if (regs.length === 1) {
    const reg = regs[0];
    const passType = reg.pass_types as any;
    const ticket_page_url = `${frontendUrl}/ticket/${reg.id}`;
    const download_url = `${serverUrl}/api/email/ticket/${reg.id}/download?token=${encodeURIComponent(reg.qr_token)}`;
    const { subject, html, text } = buildRegistrationConfirmationEmail({
      full_name: reg.full_name,
      email: reg.email,
      ticket_number: reg.ticket_number,
      pass_name: passType?.name || reg.pass_slug,
      download_url,
      ticket_page_url,
      referral_code,
      referral_url,
    });
    
    await enqueueEmail({
      idempotency_key: `${reg.id}:registration_confirmation`,
      email_type: 'registration_confirmation',
      recipient_email: reg.email,
      recipient_name: reg.full_name,
      subject,
      html_body: html,
      metadata: {
        registration_id: reg.id,
        ticket_number: reg.ticket_number,
        full_name: reg.full_name,
        role: reg.role,
        organization: reg.organization,
        pass_name: passType?.name || reg.pass_slug,
        badge_color: passType?.badge_color || '#6B7280',
        qr_token: reg.qr_token,
        text_body: text,
      }
    });
    return;
  }

  // Count > 1, process group tickets
  const groupTickets = regs.map(reg => {
    const ticket_page_url = `${frontendUrl}/ticket/${reg.id}`;
    return {
      name: reg.full_name,
      ticket_number: reg.ticket_number,
      ticket_page_url,
      regId: reg.id,
      qr_token: reg.qr_token,
      pass_name: (reg.pass_types as any)?.name || reg.pass_slug,
      role: reg.role,
      organization: reg.organization,
      badge_color: (reg.pass_types as any)?.badge_color || '#6B7280'
    };
  });

  // Find the primary registration to get details for the group email
  let primaryReg = regs.find(r => r.email === primary_email);
  if (!primaryReg) {
    // If primary buyer didn't buy a ticket for themselves but provided an email, fallback
    primaryReg = {
      ...regs[0], // steal the pass details for the ticket card, they still need to see something
      full_name: "Primary Registrant",
      email: primary_email || regs[0].email,
    };
  }

  const passType = primaryReg.pass_types as any;
  const primaryTicketPageUrl = `${frontendUrl}/ticket/${primaryReg.id}`;
  const primaryDownloadUrl = `${serverUrl}/api/email/ticket/${primaryReg.id}/download?token=${encodeURIComponent(primaryReg.qr_token)}`;

  const { subject, html, text } = buildGroupRegistrationConfirmationEmail({
    full_name: primaryReg.full_name,
    email: primaryReg.email,
    ticket_number: primaryReg.ticket_number,
    pass_name: passType?.name || primaryReg.pass_slug,
    download_url: primaryDownloadUrl,
    ticket_page_url: primaryTicketPageUrl,
    tickets: groupTickets,
    referral_code,
    referral_url,
  });

  // Enqueue the consolidated group email for the primary buyer
  await enqueueEmail({
    idempotency_key: `${order_id}:group_registration_confirmation`,
    email_type: 'group_registration_confirmation',
    recipient_email: primaryReg.email,
    recipient_name: primaryReg.full_name,
    subject,
    html_body: html,
    metadata: {
      order_id,
      group_tickets: groupTickets,
      text_body: text,
    }
  });

  // Now, for everyone else (non-primary), send them standard individual emails
  for (const reg of regs) {
    if (reg.email === primaryReg.email) continue; // Skip primary buyer

    const regPassType = reg.pass_types as any;
    const ticket_page_url = `${frontendUrl}/ticket/${reg.id}`;
    const download_url = `${serverUrl}/api/email/ticket/${reg.id}/download?token=${encodeURIComponent(reg.qr_token)}`;

    const { subject: stdSubject, html: stdHtml, text: stdText } = buildRegistrationConfirmationEmail({
      full_name: reg.full_name,
      email: reg.email,
      ticket_number: reg.ticket_number,
      pass_name: regPassType?.name || reg.pass_slug,
      download_url,
      ticket_page_url,
    });

    await enqueueEmail({
      idempotency_key: `${reg.id}:registration_confirmation`,
      email_type: 'registration_confirmation',
      recipient_email: reg.email,
      recipient_name: reg.full_name,
      subject: stdSubject,
      html_body: stdHtml,
      metadata: {
        registration_id: reg.id,
        ticket_number: reg.ticket_number,
        full_name: reg.full_name,
        role: reg.role,
        organization: reg.organization,
        pass_name: regPassType?.name || reg.pass_slug,
        badge_color: regPassType?.badge_color || '#6B7280',
        qr_token: reg.qr_token,
        text_body: stdText,
      }
    });
  }
}
