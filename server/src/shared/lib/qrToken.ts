import { createHmac, timingSafeEqual } from 'crypto';

export function generateQRToken(ticket_number: string): string {
  const sig = createHmac('sha256', process.env.QR_HMAC_SECRET!)
    .update(ticket_number)
    .digest('hex')
    .slice(0, 24);
  return Buffer.from(ticket_number + ':' + sig).toString('base64url');
}

export function verifyQRToken(token: string): { valid: boolean; ticket_number?: string } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [ticket_number, sig] = decoded.split(':');
    const expected = createHmac('sha256', process.env.QR_HMAC_SECRET!)
      .update(ticket_number).digest('hex').slice(0, 24);
    const valid = timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    return { valid, ticket_number: valid ? ticket_number : undefined };
  } catch {
    return { valid: false };
  }
}
