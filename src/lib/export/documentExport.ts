import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";

export interface DocumentExportData {
  title: string;
  content: string;
  documentType?: string;
  author?: string;
  date?: string;
}

/**
 * Sanitize filename for operating systems
 */
function sanitizeFilename(title: string): string {
  return (title || "Untitled_Document")
    .trim()
    .replace(/[^\w\s-]/gi, "")
    .replace(/\s+/g, "_")
    .slice(0, 50);
}

/**
 * Trigger browser file download from Blob
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Export document as plain-text (.txt)
 */
export function exportToTxt({ title, content, documentType, author, date }: DocumentExportData): void {
  const header = [
    title || "Untitled",
    author ? `By ${author}` : null,
    date ? `Date: ${date}` : null,
    documentType ? `Format: ${documentType.replace(/_/g, " ")}` : null,
    "=".repeat(40),
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const fullText = `${header}\n${content || ""}\n\n— Inkling Sanctuary Export`;
  const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `${sanitizeFilename(title)}.txt`);
}

/**
 * Export document as real Microsoft Word DOCX (.docx)
 */
export async function exportToDocx({
  title,
  content,
  documentType,
  author,
  date,
}: DocumentExportData): Promise<void> {
  const docParagraphs: Paragraph[] = [];

  // Title
  docParagraphs.push(
    new Paragraph({
      text: title || "Untitled Document",
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    })
  );

  // Metadata subtitle
  const metaParts = [
    author ? `By ${author}` : null,
    date ? date : new Date().toLocaleDateString(),
    documentType ? `(${documentType.replace(/_/g, " ")})` : null,
  ].filter(Boolean);

  if (metaParts.length > 0) {
    docParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: metaParts.join(" • "),
            italics: true,
            color: "666666",
            size: 20, // 10pt
          }),
        ],
        spacing: { after: 400 },
      })
    );
  }

  // Parse lines for markdown-style headings, lists, and paragraphs
  const lines = (content || "").split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      docParagraphs.push(new Paragraph({ text: "", spacing: { after: 120 } }));
      continue;
    }

    if (line.startsWith("# ")) {
      docParagraphs.push(
        new Paragraph({
          text: line.slice(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (line.startsWith("## ")) {
      docParagraphs.push(
        new Paragraph({
          text: line.slice(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (line.startsWith("### ")) {
      docParagraphs.push(
        new Paragraph({
          text: line.slice(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
        })
      );
    } else if (line.startsWith("> ")) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.slice(2),
              italics: true,
              color: "444444",
            }),
          ],
          indent: { left: 720 }, // 0.5 in
          spacing: { after: 140 },
        })
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      docParagraphs.push(
        new Paragraph({
          text: line.slice(2),
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    } else {
      // Standard body paragraph
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 24, // 12pt
              font: "Georgia",
            }),
          ],
          spacing: { line: 360, after: 180 }, // 1.5 line spacing
        })
      );
    }
  }

  // Footer text
  docParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "\n— Composed in Inkling Sanctuary",
          italics: true,
          color: "888888",
          size: 18,
        }),
      ],
      spacing: { before: 400 },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: docParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(
    blob,
    `${sanitizeFilename(title)}.docx`
  );
}

/**
 * Open print-ready formatted window for printing or direct Save to PDF
 */
export function exportToPrintOrPdf({
  title,
  content,
  documentType,
  author,
  date,
}: DocumentExportData): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Popup blocked. Please allow popups to generate PDF/Print preview.");
    return;
  }

  // Escape HTML helper
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const formattedContent = (content || "")
    .split("\n\n")
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title || "Untitled Document")}</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm 2cm;
    }
    body {
      font-family: "Georgia", "Times New Roman", serif;
      font-size: 11pt;
      line-height: 1.8;
      color: #222;
      background: #fff;
      max-width: 750px;
      margin: 0 auto;
      padding: 2cm 1cm;
    }
    h1.doc-title {
      font-size: 26pt;
      font-weight: 600;
      margin-bottom: 4pt;
      line-height: 1.2;
      color: #111;
    }
    .meta {
      font-size: 9pt;
      color: #666;
      font-style: italic;
      border-bottom: 1px solid #ddd;
      padding-bottom: 12pt;
      margin-bottom: 24pt;
    }
    p {
      margin-bottom: 14pt;
      text-align: justify;
      text-justify: inter-word;
    }
    .footer {
      margin-top: 40pt;
      font-size: 9pt;
      font-style: italic;
      color: #888;
      border-top: 1px solid #eee;
      padding-top: 10pt;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; padding: 12px; background: #f0f4ee; border: 1px solid #cddac6; border-radius: 6px; font-family: sans-serif; font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
    <span>Ready to print or save as PDF. Click "Print / Save as PDF" below.</span>
    <button onclick="window.print()" style="padding: 6px 14px; background: #556b4f; color: #fff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Print / Save as PDF</button>
  </div>

  <h1 class="doc-title">${escapeHtml(title || "Untitled Document")}</h1>
  <div class="meta">
    ${author ? `By ${escapeHtml(author)} &bull; ` : ""}
    ${date || new Date().toLocaleDateString()}
    ${documentType ? ` &bull; ${escapeHtml(documentType.replace(/_/g, " "))}` : ""}
  </div>

  <div class="content">
    ${formattedContent}
  </div>

  <div class="footer">
    Composed in Inkling Sanctuary &mdash; ${new Date().getFullYear()}
  </div>

  <script>
    // Auto-trigger print dialog after load
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
