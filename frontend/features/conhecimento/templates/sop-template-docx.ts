import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  CheckBox,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  Tab,
  TabStopType,
  TabStopPosition,
} from "docx";
import {
  parseContent,
  sanitizeEmoji,
  type SOPTemplateData,
  type ContentBlock,
} from "./sop-content-parser";

// ─── Brand tokens (same as PDF) ─────────────────────────────────────────────

const brand = {
  orange: "E85102",
  dark: "1A1A1A",
  body: "3A3A3A",
  muted: "7A7A7A",
  subtle: "A0A0A0",
  border: "D8D8D8",
  borderLight: "EBEBEB",
  bg: "F5F3F1",
  white: "FFFFFF",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function heading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 300, after: 120 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 20, // 10pt
        font: "Arial",
        color: brand.dark,
        allCaps: true,
      }),
    ],
  });
}

function bodyText(text: string): Paragraph {
  // Handle inline **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  const runs = parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return new TextRun({
        text: part.replace(/\*\*/g, ""),
        bold: true,
        size: 18,
        font: "Arial",
        color: brand.dark,
      });
    }
    return new TextRun({
      text: part,
      size: 18,
      font: "Arial",
      color: brand.body,
    });
  });

  return new Paragraph({
    spacing: { after: 80 },
    children: runs,
  });
}

function bulletItem(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 360 },
    children: [
      new TextRun({
        text: "\u2014  ",
        bold: true,
        size: 18,
        font: "Arial",
        color: brand.orange,
      }),
      new TextRun({
        text: sanitizeEmoji(text),
        size: 18,
        font: "Arial",
        color: brand.body,
      }),
    ],
  });
}

function numberedItem(num: string, text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 360 },
    children: [
      new TextRun({
        text: `${num}.  `,
        bold: true,
        size: 18,
        font: "Arial",
        color: brand.dark,
      }),
      new TextRun({
        text: sanitizeEmoji(text),
        size: 18,
        font: "Arial",
        color: brand.body,
      }),
    ],
  });
}

function fieldRow(label: string, value: string, alt: boolean): Paragraph {
  const hasBlank = !value || value.includes("___");
  return new Paragraph({
    spacing: { after: 40 },
    shading: alt
      ? { type: ShadingType.SOLID, color: "F9F9F9" }
      : undefined,
    children: [
      new TextRun({
        text: `${label}:  `,
        bold: true,
        size: 16,
        font: "Arial",
        color: brand.dark,
      }),
      new TextRun({
        text: hasBlank ? "________________________________" : value,
        size: 17,
        font: "Arial",
        color: hasBlank ? brand.subtle : brand.body,
      }),
    ],
  });
}

function checklistItem(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 240 },
    children: [
      new CheckBox({ checked: false }),
      new TextRun({
        text: `  ${sanitizeEmoji(text)}`,
        size: 17,
        font: "Arial",
        color: brand.body,
      }),
    ],
  });
}

function divider(): Paragraph {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 4,
        color: brand.borderLight,
      },
    },
    children: [],
  });
}

function buildTable(rows: string[][]): Table {
  if (rows.length === 0) return new Table({ rows: [] });

  const headerRow = rows[0];
  const dataRows = rows.slice(1);
  const colCount = headerRow.length;
  const colWidth = Math.floor(9000 / colCount);

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headerRow.map(
          (cell) =>
            new TableCell({
              shading: { type: ShadingType.SOLID, color: brand.dark },
              width: { size: colWidth, type: WidthType.DXA },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({
                      text: cell.toUpperCase(),
                      bold: true,
                      size: 14,
                      font: "Arial",
                      color: brand.white,
                      allCaps: true,
                    }),
                  ],
                }),
              ],
            })
        ),
      }),
      ...dataRows.map(
        (row, ri) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  shading:
                    ri % 2 === 1
                      ? { type: ShadingType.SOLID, color: "F9F9F9" }
                      : undefined,
                  width: { size: colWidth, type: WidthType.DXA },
                  children: [
                    new Paragraph({
                      spacing: { before: 30, after: 30 },
                      children: [
                        new TextRun({
                          text: sanitizeEmoji(cell),
                          size: 16,
                          font: "Arial",
                          color: brand.body,
                        }),
                      ],
                    }),
                  ],
                })
            ),
          })
      ),
    ],
  });
}

// ─── Multi-field row (pipe-separated fields side by side) ────────────────────

function multiFieldRow(
  fields: { label: string; value: string }[],
  alt: boolean
): Table {
  const colCount = fields.length;
  const colWidth = Math.floor(9000 / colCount);

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: brand.borderLight },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: brand.borderLight },
      insideHorizontal: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: fields.map(
          (f) =>
            new TableCell({
              shading: alt
                ? { type: ShadingType.SOLID, color: "F9F9F9" }
                : undefined,
              width: { size: colWidth, type: WidthType.DXA },
              children: [
                new Paragraph({
                  spacing: { after: 20 },
                  children: [
                    new TextRun({
                      text: f.label,
                      bold: true,
                      size: 16,
                      font: "Arial",
                      color: brand.dark,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: f.value || "________________________________",
                      size: 17,
                      font: "Arial",
                      color: f.value ? brand.body : brand.subtle,
                    }),
                  ],
                }),
              ],
            })
        ),
      }),
    ],
  });
}

// ─── Main generator ──────────────────────────────────────────────────────────

export async function generateSOPDocx(data: SOPTemplateData): Promise<Buffer> {
  const blocks = parseContent(data.stepContent);
  const cleanStepTitle = data.stepTitle.replace(/^\d+\.\s*/, "");
  const today = new Date().toLocaleDateString("pt-BR");
  const sopCode = data.sopSlug.split("-").slice(0, 3).join("-").toUpperCase();

  let fieldIdx = 0;

  // Convert blocks to docx elements
  const children: (Paragraph | Table)[] = [];

  // ─── Title block ───
  children.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: cleanStepTitle,
          bold: true,
          size: 36, // 18pt
          font: "Arial",
          color: brand.dark,
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: `SOP: ${data.sopTitle}`,
          size: 17,
          font: "Arial",
          color: brand.muted,
        }),
      ],
    })
  );

  // ─── Orange accent line ───
  children.push(
    new Paragraph({
      spacing: { after: 240 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 12,
          color: brand.orange,
          space: 4,
        },
      },
      children: [new TextRun({ text: "", size: 4 })],
    })
  );

  // ─── Content blocks ───
  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        children.push(heading(block.content));
        break;

      case "divider":
        children.push(divider());
        break;

      case "field": {
        const isAlt = fieldIdx++ % 2 === 1;
        children.push(
          fieldRow(block.label ?? "", block.value ?? "", isAlt)
        );
        break;
      }

      case "multifield": {
        const isAlt = fieldIdx++ % 2 === 1;
        if (block.fields && block.fields.length > 0) {
          children.push(multiFieldRow(block.fields, isAlt));
        }
        break;
      }

      case "checklist":
        children.push(checklistItem(block.content));
        break;

      case "table":
        if (block.rows && block.rows.length > 0) {
          children.push(buildTable(block.rows));
          children.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
        }
        break;

      case "content": {
        const text = block.content;
        if (
          /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(text) &&
          text.length < 60 &&
          !text.includes(":")
        ) {
          children.push(
            new Paragraph({
              spacing: { before: 100, after: 40 },
              children: [
                new TextRun({
                  text: sanitizeEmoji(text),
                  bold: true,
                  size: 18,
                  font: "Arial",
                  color: brand.dark,
                }),
              ],
            })
          );
        } else {
          children.push(bodyText(sanitizeEmoji(text)));
        }
        break;
      }

      case "text": {
        const text = block.content;

        if (/^\s*[-\u2014\u2022]\s+/.test(text)) {
          const cleaned = text.replace(/^\s*[-\u2014\u2022]\s+/, "");
          children.push(bulletItem(cleaned));
        } else if (/^\s*\d+[.)]\s+/.test(text)) {
          const num = text.match(/^\s*(\d+)[.)]/)?.[1] ?? "";
          const cleaned = text.replace(/^\s*\d+[.)]\s+/, "");
          children.push(numberedItem(num, cleaned));
        } else {
          children.push(bodyText(sanitizeEmoji(text)));
        }
        break;
      }
    }
  }

  // ─── Build document ───
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 18,
            color: brand.body,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1080, // 0.75 inch
              right: 1080,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: TabStopPosition.MAX,
                  },
                ],
                spacing: { after: 200 },
                border: {
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 6,
                    color: brand.orange,
                    space: 8,
                  },
                },
                children: [
                  new TextRun({
                    text: sopCode,
                    bold: true,
                    size: 18,
                    font: "Arial",
                    color: brand.orange,
                    allCaps: true,
                  }),
                  new TextRun({
                    text: `  |  ${data.sopBu}`,
                    size: 15,
                    font: "Arial",
                    color: brand.muted,
                  }),
                  new TextRun({
                    children: [new Tab()],
                  }),
                  new TextRun({
                    text: `Versao ${data.sopVersion}  |  ${today}`,
                    size: 15,
                    font: "Arial",
                    color: brand.muted,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: TabStopPosition.MAX,
                  },
                ],
                border: {
                  top: {
                    style: BorderStyle.SINGLE,
                    size: 2,
                    color: brand.borderLight,
                    space: 8,
                  },
                },
                children: [
                  new TextRun({
                    text: "AGENCIA DE PUBLICIDADE TBO LTDA | CNPJ 41.312.686/0001-33",
                    size: 12,
                    font: "Arial",
                    color: brand.subtle,
                  }),
                  new TextRun({
                    children: [new Tab()],
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    bold: true,
                    size: 14,
                    font: "Arial",
                    color: brand.muted,
                  }),
                  new TextRun({
                    text: "/",
                    size: 14,
                    font: "Arial",
                    color: brand.muted,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    bold: true,
                    size: 14,
                    font: "Arial",
                    color: brand.muted,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
