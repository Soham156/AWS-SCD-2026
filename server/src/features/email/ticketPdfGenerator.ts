import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

/**
 * Generates a perfectly crisp vector PDF directly using pdfkit.
 * Eliminates blurriness and missing QR codes caused by Sharp/SVG parsing.
 */
export async function generateTicketPdf(params: {
  ticket_number: string;
  full_name: string;
  pass_name: string;
  role: string;
  organization: string;
  qr_token: string;
  badge_color: string;
}): Promise<Buffer> {
  const { ticket_number, full_name, pass_name, role, organization, qr_token, badge_color } = params;

  // Generate QR code as raw Buffer
  const qrBuffer = await QRCode.toBuffer(qr_token, {
    width: 200,
    margin: 1,
    color: { dark: '#000000', light: '#FFFFFF' },
  });

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [340, 550],
        margin: 0,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Background
      doc.rect(0, 0, 340, 550).fill('#0a0a0a');
      doc.rect(1, 1, 338, 548).lineWidth(1).strokeOpacity(0.1).stroke('#ffffff');
      
      // Top Gradient Bar
      const grad = doc.linearGradient(0, 0, 340, 0);
      grad.stop(0, badge_color);
      grad.stop(1, '#FF9900');
      doc.rect(0, 0, 340, 8).fill(grad);

      // Event Branding
      doc.font('Courier-Bold').fontSize(10).fillColor('#9ca3af').text('AWS STUDENT COMMUNITY DAY', 24, 35, { characterSpacing: 1 });
      doc.font('Courier').fontSize(10).fillColor('#6b7280').text('DHULE 2026', 24, 50, { characterSpacing: 1 });

      // Pass Type Badge
      doc.rect(230, 24, 86, 20).fill(badge_color);
      doc.font('Courier-Bold').fontSize(10).fillColor('#ffffff').text(pass_name.toUpperCase(), 230, 30, { width: 86, align: 'center' });

      // Divider
      doc.lineWidth(1).strokeOpacity(0.2).strokeColor('#ffffff').dash(5, { space: 5 });
      doc.moveTo(24, 80).lineTo(316, 80).stroke();

      // Attendee info
      doc.undash();
      let currentY = 105;
      
      // Name
      doc.font('Helvetica-BoldOblique').fontSize(20).fillColor('#ffffff').text(full_name.toUpperCase(), 24, currentY, { width: 292 });
      currentY = doc.y + 4;
      
      // Organization
      if (organization) {
        doc.font('Courier').fontSize(10).fillColor('#9ca3af').text(organization, 24, currentY, { width: 292 });
        currentY = doc.y + 4;
      }
      
      // Role
      doc.font('Courier-Bold').fontSize(10).fillColor('#FF9900').text(role.toUpperCase(), 24, currentY, { width: 292, characterSpacing: 1 });
      currentY = doc.y + 20;

      // QR Code Container (White box with 16px padding)
      const qrBoxSize = 232;
      const qrX = (340 - qrBoxSize) / 2;
      doc.rect(qrX, currentY, qrBoxSize, qrBoxSize).fill('#ffffff');
      doc.image(qrBuffer, qrX + 16, currentY + 16, { width: 200, height: 200 });
      currentY += qrBoxSize + 20;

      // Ticket number
      doc.font('Courier').fontSize(9).fillColor('#6b7280').text('TICKET', 24, currentY, { width: 292, align: 'center', characterSpacing: 2 });
      currentY = doc.y + 4;
      doc.font('Courier-Bold').fontSize(18).fillColor('#ffffff').text(ticket_number || 'PENDING CONFIRMATION', 24, currentY, { width: 292, align: 'center', characterSpacing: 1 });
      currentY = doc.y + 20;

      // Footer Divider
      doc.lineWidth(1).strokeOpacity(0.2).strokeColor('#ffffff').dash(5, { space: 5 });
      doc.moveTo(24, currentY).lineTo(316, currentY).stroke();
      currentY += 16;

      // Footer Text
      doc.undash();
      doc.font('Courier').fontSize(8).fillColor('#6b7280').text('14 August 2026', 24, currentY);
      doc.text("SVKM's IoT, Dhule", 24, currentY + 12);
      doc.text('Show QR at gate', 24, currentY, { width: 292, align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
