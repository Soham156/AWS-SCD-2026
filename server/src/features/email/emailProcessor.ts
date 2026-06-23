import { supabase } from '../../shared/lib/supabase.js';
import { getEmailProvider } from '../../shared/lib/emailProvider.js';
import { generateTicketPdf } from './ticketPdfGenerator.js';

const POLL_INTERVAL_MS = 10_000; // 10 seconds
const BATCH_SIZE = 5;

let processorInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Starts the background email processor.
 * Polls email_jobs for pending jobs and sends them via the configured provider.
 * No automatic retries — failed jobs stay failed until manually retried via admin.
 */
export function startEmailProcessor(): void {
  if (processorInterval) {
    console.warn('[Email Processor] Already running');
    return;
  }

  // Validate provider is configured before starting
  try {
    getEmailProvider();
    console.log(`[Email Processor] Started (provider: ${getEmailProvider().name}, poll: ${POLL_INTERVAL_MS / 1000}s)`);
  } catch (err) {
    console.warn(`[Email Processor] Provider not configured — processor will not send emails. Error: ${(err as Error).message}`);
    return;
  }

  // Recover any jobs stuck in 'processing' from a previous crash
  recoverStuckJobs().catch(err =>
    console.error('[Email Processor] Failed to recover stuck jobs:', err)
  );

  processorInterval = setInterval(processEmailBatch, POLL_INTERVAL_MS);
}

/**
 * On startup, reset any jobs stuck in 'processing' back to 'pending'.
 * This handles recovery from application restarts.
 */
async function recoverStuckJobs(): Promise<void> {
  const { data, error } = await supabase
    .from('email_jobs')
    .update({ status: 'pending', updated_at: new Date().toISOString() })
    .eq('status', 'processing')
    .select('id');

  if (error) {
    console.error('[Email Processor] Error recovering stuck jobs:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log(`[Email Processor] Recovered ${data.length} stuck job(s) from 'processing' → 'pending'`);
  }
}

/**
 * Process a batch of pending email jobs.
 */
async function processEmailBatch(): Promise<void> {
  try {
    // Fetch pending jobs (oldest first)
    const { data: jobs, error: fetchErr } = await supabase
      .from('email_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchErr) {
      console.error('[Email Processor] Error fetching jobs:', fetchErr);
      return;
    }

    if (!jobs || jobs.length === 0) return;

    const provider = getEmailProvider();

    for (const job of jobs) {
      // Atomically claim the job by setting status to 'processing'
      const { data: claimed, error: claimErr } = await supabase
        .from('email_jobs')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', job.id)
        .eq('status', 'pending') // Only claim if still pending (prevents double-processing)
        .select('id')
        .single();

      if (claimErr || !claimed) {
        // Another instance claimed it first, skip
        continue;
      }

      try {
        const metadata = (job.metadata as any) || {};
        
        const sendOptions: any = {
          to: job.recipient_email,
          subject: job.subject,
          html: job.html_body,
          text: metadata.text_body,
        };

        if (job.email_type === 'registration_confirmation' && metadata.ticket_number) {
          try {
            const pdfBuffer = await generateTicketPdf({
              ticket_number: metadata.ticket_number,
              full_name: metadata.full_name || job.recipient_name,
              pass_name: metadata.pass_name || 'General Pass',
              role: metadata.role || 'Attendee',
              organization: metadata.organization || '-',
              qr_token: metadata.qr_token || metadata.ticket_number,
              badge_color: metadata.badge_color || '#6B7280',
            });
            sendOptions.attachments = [
              {
                filename: `Ticket-${metadata.ticket_number}.pdf`,
                content: pdfBuffer,
              }
            ];
          } catch (pdfErr) {
            console.error('[Email Processor] Failed to generate PDF attachment:', pdfErr);
          }
        }
        
        const result = await provider.send(sendOptions);

        // Success: mark as sent and clear html_body to save space
        await supabase
          .from('email_jobs')
          .update({
            status: 'sent',
            html_body: '', // Free up database storage since we no longer need to send this
            provider_message_id: result.messageId,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        // Log success
        await supabase.from('email_logs').insert({
          email_job_id: job.id,
          provider: provider.name,
          status: 'success',
          provider_message_id: result.messageId,
          response_data: result.raw || null,
        });

        // Mark registration email_status = 'sent'
        if (metadata?.registration_id) {
          await supabase
            .from('registrations')
            .update({ email_sent: true, email_status: 'sent' })
            .eq('id', metadata.registration_id);
        }

        console.log(`[Email Processor] Sent: ${job.email_type} → ${job.recipient_email} (${result.messageId})`);
      } catch (sendErr) {
        const errorMessage = sendErr instanceof Error ? sendErr.message : String(sendErr);
        const newAttempts = (job.attempts || 0) + 1;

        // No auto-retry: mark as failed immediately
        await supabase
          .from('email_jobs')
          .update({
            status: 'failed',
            attempts: newAttempts,
            last_error: errorMessage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        // Log failure
        await supabase.from('email_logs').insert({
          email_job_id: job.id,
          provider: provider.name,
          status: 'failure',
          error_message: errorMessage,
        });

        // Mark registration email_status = 'failed'
        const metadata = (job.metadata as any) || {};
        if (metadata?.registration_id) {
          await supabase
            .from('registrations')
            .update({ email_status: 'failed' })
            .eq('id', metadata.registration_id);
        }

        console.error(`[Email Processor] Failed: ${job.email_type} → ${job.recipient_email}: ${errorMessage}`);
      }
    }
  } catch (err) {
    console.error('[Email Processor] Unexpected error:', err);
  }
}
