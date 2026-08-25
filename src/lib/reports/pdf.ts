import "server-only";
import PDFDocument from "pdfkit";

export type PdfStat = { label: string; value: string | number };
export type PdfTable = { headers: string[]; rows: Array<Array<string | number>> };

export function buildSummaryPdf(opts: {
  title: string;
  subtitle?: string;
  stats?: PdfStat[];
  table?: PdfTable;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text(opts.title, { align: "left" });
    if (opts.subtitle) {
      doc.moveDown(0.2);
      doc.fontSize(11).fillColor("#555555").text(opts.subtitle);
      doc.fillColor("#000000");
    }
    doc.moveDown(1);

    if (opts.stats?.length) {
      const colWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / 2;
      let x = doc.page.margins.left;
      let y = doc.y;
      opts.stats.forEach((stat, i) => {
        doc.fontSize(9).fillColor("#666666").text(stat.label.toUpperCase(), x, y, { width: colWidth - 10 });
        doc.fontSize(16).fillColor("#000000").text(String(stat.value), x, y + 12, { width: colWidth - 10 });
        if (i % 2 === 1) {
          x = doc.page.margins.left;
          y += 50;
        } else {
          x += colWidth;
        }
      });
      doc.y = y + 60;
    }

    if (opts.table) {
      doc.moveDown(0.5);
      const { headers, rows } = opts.table;
      const startX = doc.page.margins.left;
      const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const colWidth = usableWidth / headers.length;
      let y = doc.y;

      doc.fontSize(9).fillColor("#ffffff");
      doc.rect(startX, y, usableWidth, 18).fill("#101A2C");
      headers.forEach((h, i) => {
        doc.fillColor("#ffffff").text(h, startX + i * colWidth + 4, y + 5, { width: colWidth - 8 });
      });
      y += 18;

      doc.fontSize(8.5);
      rows.forEach((row, rowIdx) => {
        if (y > doc.page.height - doc.page.margins.bottom - 20) {
          doc.addPage();
          y = doc.page.margins.top;
        }
        if (rowIdx % 2 === 0) {
          doc.rect(startX, y, usableWidth, 16).fill("#F5F7FA");
        }
        row.forEach((cell, i) => {
          doc.fillColor("#1a1a1a").text(String(cell), startX + i * colWidth + 4, y + 4, {
            width: colWidth - 8,
            ellipsis: true,
          });
        });
        y += 16;
      });
      doc.y = y;
    }

    doc.end();
  });
}
