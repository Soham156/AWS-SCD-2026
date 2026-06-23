import { Resend } from 'resend';

// --- Provider Interface ---

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  messageId: string;
  raw?: unknown;
}

export interface EmailProvider {
  name: string;
  send(options: SendEmailOptions): Promise<SendEmailResult>;
}

// --- Resend Provider ---

class ResendProvider implements EmailProvider {
  name = 'resend';
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const from = options.from || process.env.EMAIL_FROM || 'AWS Student Community Day Dhule 2026 <no-reply@aws-scd-dhule.tech>';
    const reply_to = options.replyTo || process.env.EMAIL_REPLY_TO || 'info@aws-scd-dhule.tech';

    const payload: any = {
      from,
      reply_to,
      to: [options.to],
      subject: options.subject,
      html: options.html,
    };

    if (options.text) {
      payload.text = options.text;
    }

    const { data, error } = await this.client.emails.send(payload);

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    return {
      messageId: data?.id || 'unknown',
      raw: data,
    };
  }
}

// --- Factory ---

let cachedProvider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (cachedProvider) return cachedProvider;

  const provider = (process.env.EMAIL_PROVIDER || 'resend').toLowerCase();

  switch (provider) {
    case 'resend': {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error('RESEND_API_KEY is not set');
      }
      cachedProvider = new ResendProvider(apiKey);
      break;
    }
    // Future: case 'ses': { ... }
    default:
      throw new Error(`Unknown email provider: ${provider}`);
  }

  return cachedProvider;
}
