/**
 * utils/pdf.js
 *
 * Generates a styled, printable PDF receipt (returns a Promise<Buffer>)
 *
 * Uses PDFKit to create a simple, elegant receipt.
 */

const PDFDocument = require('pdfkit');

function formatCurrency(n) {
  return `Rs ${Number(n).toFixed(0)}`;
}

function generatePdfBuffer(order = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header - logo placeholder and title
      doc
        .image && typeof doc.image === 'function' && false; // placeholder: use doc.image('/path/to/logo.png', 40, 40, { width: 80 })
      doc.fontSize(20).font('Helvetica-Bold').text("Fatima's Kitchen", { align: 'center' });
      doc.moveDown(0.2);
      doc.fontSize(10).font('Helvetica').text('Home-style meals | 423 Street 2, Block D, Lahore', { align: 'center' });
      doc.moveDown(1);

      // Order meta
      doc.fontSize(12).font('Helvetica-Bold').text(`Receipt`, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Order ID: ${order.id || ''}`);
      doc.text(`Date: ${order.createdAt || new Date().toISOString()}`);
      doc.text(`Customer: ${order.customer?.name || 'Guest'}`);
      doc.text(`Phone: ${order.customer?.phone || ''}`);
      doc.moveDown(0.6);

      // Table header
      doc.font('Helvetica-Bold');
      doc.text('Item', 40, doc.y, { continued: true });
      doc.text('Qty', 320, doc.y, { width: 50, align: 'right', continued: true });
      doc.text('Price', 400, doc.y, { width: 100, align: 'right' });
      doc.moveDown(0.4);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();

      // Items
      doc.font('Helvetica');
      const items = order.items || [];
      items.forEach(it => {
        const name = it.name + (it.variation ? ` (${it.variation})` : '');
        doc.text(name, 40, doc.y, { continued: true });
        doc.text(String(it.qty || 1), 320, doc.y, { width: 50, align: 'right', continued: true });
        doc.text(formatCurrency((it.price || 0) * (it.qty || 1)), 400, doc.y, { width: 100, align: 'right' });
        doc.moveDown(0.3);
      });

      doc.moveDown(0.6);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();

      // Totals
      const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
      const discountPercent = order.customer?.discountPercent || 0;
      const discount = Math.round(subtotal * (discountPercent / 100));
      const total = order.total != null ? order.total : (subtotal - discount);

      doc.moveDown(0.6);
      doc.text('Subtotal', 320, doc.y, { width: 150, align: 'right', continued: true });
      doc.text(formatCurrency(subtotal), 480, doc.y, { width: 100, align: 'right' });
      doc.moveDown(0.2);
      doc.text(`Discount (${discountPercent}%)`, 320, doc.y, { width: 150, align: 'right', continued: true });
      doc.text(formatCurrency(discount), 480, doc.y, { width: 100, align: 'right' });
      doc.moveDown(0.2);
      doc.font('Helvetica-Bold');
      doc.text('Total', 320, doc.y, { width: 150, align: 'right', continued: true });
      doc.text(formatCurrency(total), 480, doc.y, { width: 100, align: 'right' });
      doc.font('Helvetica');

      // Footer notes
      doc.moveDown(1.2);
      doc.fontSize(9).text('Thank you for ordering from Fatima\'s Kitchen!', { align: 'center' });
      doc.moveDown(0.2);
      doc.text('This is a system-generated receipt. Please keep it for your records.', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generatePdfBuffer };
