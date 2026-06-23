import QRCode from 'qrcode';
import sharp from 'sharp';

const TICKET_WIDTH = 680;
const TICKET_HEIGHT = 1100;

/**
 * Generates a ticket PNG image server-side for email download links.
 * Uses SVG template rendered to PNG via sharp.
 */
export async function generateTicketImage(params: {
  ticket_number: string;
  full_name: string;
  pass_name: string;
  role: string;
  organization: string;
  qr_token: string;
  badge_color: string;
}): Promise<Buffer> {
  const { ticket_number, full_name, pass_name, role, organization, qr_token, badge_color } = params;

  // Generate QR code as data URI
  const qrDataUrl = await QRCode.toDataURL(qr_token, {
    width: 200,
    margin: 1,
    color: { dark: '#FFFFFF', light: '#00000000' },
  });

  // Extract base64 from data URI
  const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');

  // Escape XML special characters
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${TICKET_WIDTH}" height="${TICKET_HEIGHT}" viewBox="0 0 ${TICKET_WIDTH} ${TICKET_HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${esc(badge_color)}"/>
      <stop offset="100%" stop-color="#FF9900"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${TICKET_WIDTH}" height="${TICKET_HEIGHT}" fill="url(#bg)"/>
  <rect width="${TICKET_WIDTH}" height="${TICKET_HEIGHT}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>

  <!-- Header bar -->
  <rect x="0" y="0" width="${TICKET_WIDTH}" height="16" fill="url(#accent)"/>

  <!-- Event branding -->
  <text x="48" y="70" font-family="monospace" font-size="18" fill="rgba(255,255,255,0.4)" letter-spacing="2">AWS STUDENT COMMUNITY DAY</text>
  <text x="48" y="100" font-family="monospace" font-size="18" fill="rgba(255,255,255,0.3)" letter-spacing="2">DHULE 2026</text>

  <!-- Pass Type -->
  <rect x="480" y="45" width="152" height="40" fill="${esc(badge_color)}"/>
  <text x="556" y="71" text-anchor="middle" font-family="monospace" font-size="18" fill="white" font-weight="bold" letter-spacing="2">${esc(pass_name.toUpperCase())}</text>

  <!-- Divider -->
  <line x1="48" y1="140" x2="632" y2="140" stroke="rgba(255,255,255,0.1)" stroke-width="2" stroke-dasharray="10,10"/>

  <!-- Attendee info -->
  <text x="48" y="210" font-family="sans-serif" font-size="44" fill="white" font-weight="900" font-style="italic">${esc(full_name.toUpperCase())}</text>
  ${organization ? `<text x="48" y="250" font-family="monospace" font-size="20" fill="rgba(255,255,255,0.4)">${esc(organization.toUpperCase())}</text>` : ''}
  <text x="48" y="290" font-family="monospace" font-size="20" fill="#FF9900" letter-spacing="4">${esc(role.toUpperCase())}</text>

  <!-- QR Code Background -->
  <rect x="140" y="340" width="400" height="400" fill="white"/>
  <!-- QR Code -->
  ${qr_token ? `
  <image x="140" y="340" width="400" height="400" xlink:href="data:image/png;base64,${qrBase64}"/>
  ` : `
  <rect x="140" y="340" width="400" height="400" fill="#f3f4f6"/>
  <text x="340" y="540" text-anchor="middle" font-family="monospace" font-size="20" fill="#9ca3af" letter-spacing="2">QR Code pending</text>
  `}

  <!-- Ticket number -->
  <text x="340" y="820" text-anchor="middle" font-family="monospace" font-size="18" fill="rgba(255,255,255,0.3)" letter-spacing="4" text-transform="uppercase">TICKET</text>
  <text x="340" y="870" text-anchor="middle" font-family="monospace" font-size="36" fill="white" font-weight="bold" letter-spacing="2">${esc(ticket_number || 'PENDING CONFIRMATION')}</text>

  <!-- Footer Divider -->
  <line x1="48" y1="940" x2="632" y2="940" stroke="rgba(255,255,255,0.1)" stroke-width="2" stroke-dasharray="10,10"/>

  <!-- Footer Text -->
  <text x="48" y="1000" font-family="monospace" font-size="16" fill="rgba(255,255,255,0.3)">14 August 2026</text>
  <text x="48" y="1030" font-family="monospace" font-size="16" fill="rgba(255,255,255,0.3)">SVKM's IoT, Dhule</text>
  <text x="632" y="1015" text-anchor="end" font-family="monospace" font-size="16" fill="rgba(255,255,255,0.2)">Show QR at gate</text>

</svg>`;

  // Convert SVG to PNG using sharp
  const pngBuffer = await sharp(Buffer.from(svg))
    .png({ quality: 90 })
    .toBuffer();

  return pngBuffer;
}
