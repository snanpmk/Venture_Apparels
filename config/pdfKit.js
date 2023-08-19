const PDFDocument = require('pdfkit');

async function generateSalesReport(reportData, res) {
  const doc = new PDFDocument();

  generateHeader(doc);
  generateReportTable(doc, reportData);

  const subtotal = reportData.reduce((acc, entry) => acc + entry.quantity * parseFloat(entry.price), 0);
  
  const lastRowPosition = doc.y + 40;
  generateTableRow(doc, lastRowPosition, 'SUBTOTAL', '', '', '', subtotal.toFixed(2));
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');

  doc.pipe(res);
  doc.end();
}

function generateHeader(doc) {
  doc.fontSize(20).text('Monthly Sales Report', { align: 'center' }).moveDown(0.5);
}

function generateReportTable(doc, report) {
  const tableTop = 150;
  let position = tableTop;
  let currentPage = 1;

  doc.font('Helvetica-Bold');
  generateTableRow(doc, position, 'Date', 'Product', 'Quantity', 'Price', 'Total');
  position = position + 40;
  doc.font('Helvetica');

  for (let i = 0; i < report.length; i++) {
    const entry = report[i];

    if (position + 40 > doc.page.height - 50) {
      doc.addPage();
      currentPage++;
      position = tableTop;
    }

    generateTableRow(
      doc,
      position,
      formatDate(entry.date),
      entry.product,
      entry.quantity,
      parseFloat(entry.price),
      entry.quantity * parseFloat(entry.price)
    );
    
    position += 40;
  }
}

function generateTableRow(doc, y, date, product, quantity, price, total) {
  doc
    .fontSize(10)
    .text(date, 50, y)
    .text(product, 150, y, { width: 170, align: 'left' })
    .text(quantity.toString(), 280, y, { width: 90, align: 'right' })
    .text(price, 370, y, { width: 90, align: 'right' })
    .text(total, 460, y, { width: 90, align: 'right' });
}

function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

module.exports = { generateSalesReport };
