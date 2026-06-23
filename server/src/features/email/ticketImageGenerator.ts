import QRCode from 'qrcode';
import sharp from 'sharp';

const TICKET_WIDTH = 800;
const TICKET_HEIGHT = 1000;

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
      <stop offset="100%" stop-color="#111111"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${esc(badge_color)}"/>
      <stop offset="100%" stop-color="#FF9900"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${TICKET_WIDTH}" height="${TICKET_HEIGHT}" fill="url(#bg)" rx="24"/>

  <!-- Border -->
  <rect x="2" y="2" width="${TICKET_WIDTH - 4}" height="${TICKET_HEIGHT - 4}" fill="none"
        stroke="${esc(badge_color)}" stroke-width="2" rx="22" opacity="0.4"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="${TICKET_WIDTH}" height="6" fill="url(#accent)" rx="3"/>

  <!-- Event branding -->
  <text x="400" y="70" text-anchor="middle" font-family="monospace" font-size="14"
        fill="#FF9900" letter-spacing="6" font-weight="bold">AWS COMMUNITY DAY</text>
  <text x="400" y="100" text-anchor="middle" font-family="monospace" font-size="12"
        fill="rgba(255,255,255,0.4)" letter-spacing="4">DHULE 2026</text>

  <!-- Divider -->
  <line x1="60" y1="130" x2="740" y2="130" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

  <!-- Pass type badge -->
  <rect x="260" y="155" width="280" height="36" rx="18" fill="${esc(badge_color)}" opacity="0.2"/>
  <rect x="260" y="155" width="280" height="36" rx="18" fill="none"
        stroke="${esc(badge_color)}" stroke-width="1" opacity="0.6"/>
  <text x="400" y="179" text-anchor="middle" font-family="monospace" font-size="14"
        fill="${esc(badge_color)}" font-weight="bold" letter-spacing="3">${esc(pass_name.toUpperCase())}</text>

  <!-- Attendee name -->
  <text x="400" y="250" text-anchor="middle" font-family="sans-serif" font-size="36"
        fill="white" font-weight="bold">${esc(full_name)}</text>

  <!-- Role & Organization -->
  <text x="400" y="290" text-anchor="middle" font-family="monospace" font-size="14"
        fill="rgba(255,255,255,0.5)" letter-spacing="2">${esc(role.toUpperCase())} · ${esc(organization.toUpperCase())}</text>

  <!-- QR Code -->
  <image x="275" y="340" width="250" height="250"
         xlink:href="data:image/png;base64,${qrBase64}"/>

  <!-- QR instruction -->
  <text x="400" y="625" text-anchor="middle" font-family="monospace" font-size="11"
        fill="rgba(255,255,255,0.3)" letter-spacing="2">SCAN TO CHECK IN</text>

  <!-- Divider -->
  <line x1="60" y1="660" x2="740" y2="660" stroke="rgba(255,255,255,0.1)" stroke-width="1"
        stroke-dasharray="6,4"/>

  <!-- Ticket number -->
  <text x="400" y="720" text-anchor="middle" font-family="monospace" font-size="32"
        fill="#FF9900" font-weight="bold" letter-spacing="4">${esc(ticket_number)}</text>

  <!-- Labels row -->
  <text x="120" y="790" text-anchor="middle" font-family="monospace" font-size="10"
        fill="rgba(255,255,255,0.3)" letter-spacing="2">TICKET ID</text>
  <text x="400" y="790" text-anchor="middle" font-family="monospace" font-size="10"
        fill="rgba(255,255,255,0.3)" letter-spacing="2">TYPE</text>
  <text x="680" y="790" text-anchor="middle" font-family="monospace" font-size="10"
        fill="rgba(255,255,255,0.3)" letter-spacing="2">STATUS</text>

  <!-- Values row -->
  <text x="120" y="815" text-anchor="middle" font-family="monospace" font-size="13"
        fill="rgba(255,255,255,0.7)">${esc(ticket_number)}</text>
  <text x="400" y="815" text-anchor="middle" font-family="monospace" font-size="13"
        fill="rgba(255,255,255,0.7)">${esc(pass_name)}</text>
  <text x="680" y="815" text-anchor="middle" font-family="monospace" font-size="13"
        fill="#22C55E">CONFIRMED</text>

  <!-- Footer -->
  <text x="400" y="900" text-anchor="middle" font-family="monospace" font-size="10"
        fill="rgba(255,255,255,0.2)" letter-spacing="3">POWERED BY AWS · BUILT FOR THE COMMUNITY</text>

  <!-- Subtle grid pattern overlay -->
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="0.5"/>
  </pattern>
  <rect width="${TICKET_WIDTH}" height="${TICKET_HEIGHT}" fill="url(#grid)" rx="24"/>
</svg>`;

  // Convert SVG to PNG using sharp
  const pngBuffer = await sharp(Buffer.from(svg))
    .png({ quality: 90 })
    .toBuffer();

  return pngBuffer;
}
