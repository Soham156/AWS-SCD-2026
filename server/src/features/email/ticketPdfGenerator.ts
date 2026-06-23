import PDFDocument from 'pdfkit';
import { generateTicketImage } from './ticketImageGenerator.js';

/**
 * Generates a PDF buffer containing the PNG ticket image.
 * This ensures the exact identical visual design from the gorgeous PNG, 
 * but delivered in a standard PDF format as an attachment.
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
  // 1. Generate the high-quality PNG ticket
  const pngBuffer = await generateTicketImage(params);

  // 2. Wrap it inside a PDF that exactly matches the PNG dimensions (800x1000)
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [340, 550],
        margin: 0,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Embed the PNG into the PDF
      doc.image(pngBuffer, 0, 0, { width: 340, height: 550 });
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
