import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import path from "path";

// ─── Fonts ───────────────────────────────────────────────────────────────────

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
    { src: "Helvetica-Oblique", fontStyle: "italic" },
  ],
});

// ─── TBO Brand tokens ────────────────────────────────────────────────────────

const brand = {
  orange: "#ff6200",
  orangeLight: "#fff4ec",
  orangeMuted: "#ffad66",
  black: "#0a0a0a",
  dark: "#1a1a1a",
  body: "#3a3a3a",
  muted: "#8a8a8a",
  subtle: "#b0b0b0",
  border: "#e0e0e0",
  borderLight: "#f0f0f0",
  bg: "#f7f7f7",
  white: "#ffffff",
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: brand.body,
    paddingTop: 80,
    paddingBottom: 65,
    paddingHorizontal: 56,
    lineHeight: 1.55,
  },

  // ─── Top accent bar ─────────────────────
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: brand.orange,
  },

  // ─── Header / Letterhead ────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 28,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: brand.border,
  },
  logo: {
    width: 72,
    height: 28,
    objectFit: "contain",
  },
  headerRight: {
    textAlign: "right",
    gap: 2,
  },
  headerCode: {
    fontSize: 8,
    fontWeight: "bold",
    color: brand.orange,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  headerDate: {
    fontSize: 7,
    color: brand.muted,
  },
  headerBu: {
    fontSize: 7,
    color: brand.muted,
  },

  // ─── Document title ─────────────────────
  titleBlock: {
    marginBottom: 20,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: brand.dark,
    letterSpacing: 0.3,
    marginBottom: 4,
    lineHeight: 1.3,
  },
  docSubtitle: {
    fontSize: 8.5,
    color: brand.muted,
    lineHeight: 1.4,
  },

  // ─── Metadata strip ─────────────────────
  metaStrip: {
    flexDirection: "row",
    backgroundColor: brand.bg,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
    gap: 24,
  },
  metaItem: {
    gap: 1,
  },
  metaLabel: {
    fontSize: 6.5,
    color: brand.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "bold",
  },
  metaValue: {
    fontSize: 8,
    color: brand.dark,
    fontWeight: "bold",
  },

  // ─── Section heading ────────────────────
  sectionHeading: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: brand.dark,
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 5,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: brand.orange,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // ─── Body text ──────────────────────────
  paragraph: {
    fontSize: 9,
    marginBottom: 5,
    color: brand.body,
    lineHeight: 1.6,
  },
  bold: {
    fontWeight: "bold",
    color: brand.dark,
  },

  // ─── Code block ─────────────────────────
  codeBlock: {
    backgroundColor: brand.bg,
    borderWidth: 1,
    borderColor: brand.border,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  codeLabel: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: brand.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  codeText: {
    fontFamily: "Courier",
    fontSize: 7.5,
    color: brand.dark,
    lineHeight: 1.6,
  },

  // ─── Checklist ──────────────────────────
  checkItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  checkItemAlt: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: brand.bg,
    borderRadius: 2,
  },
  checkBox: {
    width: 10,
    height: 10,
    borderWidth: 1.2,
    borderColor: brand.border,
    borderRadius: 2,
    marginTop: 0.5,
  },
  checkText: {
    fontSize: 8.5,
    color: brand.body,
    flex: 1,
    lineHeight: 1.5,
  },

  // ─── List items ─────────────────────────
  listItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
    paddingLeft: 4,
  },
  listBullet: {
    fontSize: 9,
    color: brand.orange,
    width: 10,
    fontWeight: "bold",
  },
  listText: {
    fontSize: 9,
    color: brand.body,
    flex: 1,
    lineHeight: 1.55,
  },

  // ─── Table ──────────────────────────────
  table: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: brand.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: brand.dark,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: brand.white,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: brand.borderLight,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: brand.borderLight,
    backgroundColor: brand.bg,
  },
  tableCell: {
    fontSize: 8,
    color: brand.body,
    lineHeight: 1.4,
  },

  // ─── Divider ────────────────────────────
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: brand.borderLight,
    marginVertical: 14,
  },

  // ─── Footer ─────────────────────────────
  footer: {
    position: "absolute",
    bottom: 28,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: brand.border,
    paddingTop: 8,
  },
  footerLeft: {
    gap: 1,
  },
  footerCompany: {
    fontSize: 6,
    fontWeight: "bold",
    color: brand.muted,
    letterSpacing: 0.3,
  },
  footerAddress: {
    fontSize: 5.5,
    color: brand.subtle,
  },
  footerPage: {
    fontSize: 7,
    color: brand.muted,
    fontWeight: "bold",
  },

  // ─── Bottom accent bar ──────────────────
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: brand.orange,
  },
});

// ─── Data types ──────────────────────────────────────────────────────────────

export interface SOPTemplatePdfData {
  sopTitle: string;
  sopSlug: string;
  sopBu: string;
  sopVersion: number;
  stepTitle: string;
  stepContent: string;
}

// ─── Content parser ──────────────────────────────────────────────────────────

interface ContentBlock {
  type: "text" | "code" | "checklist" | "table" | "heading" | "divider";
  content: string;
  rows?: string[][];
}

function parseContent(raw: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = raw.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith("```")) {
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      blocks.push({ type: "code", content: codeLines.join("\n") });
      continue;
    }

    // Horizontal rule
    if (/^[-—_]{3,}\s*$/.test(line.trim())) {
      blocks.push({ type: "divider", content: "" });
      i++;
      continue;
    }

    // Table row
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableRows: string[][] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        const cells = lines[i]
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
        if (!cells.every((c) => /^[-:]+$/.test(c))) {
          tableRows.push(cells);
        }
        i++;
      }
      if (tableRows.length > 0) {
        blocks.push({ type: "table", content: "", rows: tableRows });
      }
      continue;
    }

    // Checklist item
    if (/^\s*-?\s*\[[ x]\]\s*/i.test(line)) {
      blocks.push({
        type: "checklist",
        content: line.replace(/^\s*-?\s*\[[ x]\]\s*/, "").trim(),
      });
      i++;
      continue;
    }

    // Bold heading (**TITLE** on its own line)
    if (/^\*\*[^*]+\*\*\s*$/.test(line.trim())) {
      blocks.push({
        type: "heading",
        content: line.trim().replace(/^\*\*/, "").replace(/\*\*$/, ""),
      });
      i++;
      continue;
    }

    // Regular text
    if (line.trim().length > 0) {
      blocks.push({ type: "text", content: line });
    }
    i++;
  }

  return blocks;
}

// ─── PDF Component ───────────────────────────────────────────────────────────

export function SOPTemplatePdf({ data }: { data: SOPTemplatePdfData }) {
  const blocks = parseContent(data.stepContent);
  const cleanStepTitle = data.stepTitle.replace(/^\d+\.\s*/, "");
  const today = new Date().toLocaleDateString("pt-BR");
  const sopCode = data.sopSlug.split("-").slice(0, 3).join("-").toUpperCase();

  // Resolve logo path for server-side rendering
  const logoPath = path.join(process.cwd(), "public", "logo-tbo.png");

  let checklistIdx = 0;

  return (
    <Document
      title={`${data.sopSlug} — ${cleanStepTitle}`}
      author="TBO — Agencia de Publicidade"
    >
      <Page size="A4" style={s.page}>
        {/* ─── Top orange bar ─── */}
        <View style={s.topBar} fixed />

        {/* ─── Letterhead header ─── */}
        <View style={s.header} fixed>
          <Image style={s.logo} src={logoPath} />
          <View style={s.headerRight}>
            <Text style={s.headerCode}>{sopCode}</Text>
            <Text style={s.headerDate}>v{data.sopVersion} | {today}</Text>
            <Text style={s.headerBu}>{data.sopBu}</Text>
          </View>
        </View>

        {/* ─── Title block ─── */}
        <View style={s.titleBlock}>
          <Text style={s.docTitle}>{cleanStepTitle}</Text>
          <Text style={s.docSubtitle}>
            Extraido do SOP: {data.sopTitle}
          </Text>
        </View>

        {/* ─── Metadata strip ─── */}
        <View style={s.metaStrip}>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Codigo</Text>
            <Text style={s.metaValue}>{sopCode}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Area</Text>
            <Text style={s.metaValue}>{data.sopBu}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Versao</Text>
            <Text style={s.metaValue}>{data.sopVersion}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Gerado em</Text>
            <Text style={s.metaValue}>{today}</Text>
          </View>
        </View>

        {/* ─── Content blocks ─── */}
        {blocks.map((block, idx) => {
          switch (block.type) {
            case "heading":
              return (
                <Text key={idx} style={s.sectionHeading}>
                  {block.content}
                </Text>
              );

            case "divider":
              return <View key={idx} style={s.divider} />;

            case "code":
              return (
                <View key={idx} style={s.codeBlock}>
                  <Text style={s.codeLabel}>Referencia</Text>
                  <Text style={s.codeText}>{block.content}</Text>
                </View>
              );

            case "checklist": {
              const isAlt = checklistIdx++ % 2 === 1;
              return (
                <View key={idx} style={isAlt ? s.checkItemAlt : s.checkItem}>
                  <View style={s.checkBox} />
                  <Text style={s.checkText}>{block.content}</Text>
                </View>
              );
            }

            case "table": {
              if (!block.rows || block.rows.length === 0) return null;
              const headerRow = block.rows[0];
              const dataRows = block.rows.slice(1);
              const colWidth = `${100 / headerRow.length}%`;
              return (
                <View key={idx} style={s.table}>
                  <View style={s.tableHeaderRow}>
                    {headerRow.map((cell, ci) => (
                      <Text
                        key={ci}
                        style={[s.tableHeaderCell, { width: colWidth }]}
                      >
                        {cell}
                      </Text>
                    ))}
                  </View>
                  {dataRows.map((row, ri) => (
                    <View
                      key={ri}
                      style={ri % 2 === 0 ? s.tableRow : s.tableRowAlt}
                    >
                      {row.map((cell, ci) => (
                        <Text
                          key={ci}
                          style={[s.tableCell, { width: colWidth }]}
                        >
                          {cell}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              );
            }

            case "text": {
              const text = block.content;

              // List items with dash/bullet
              if (/^\s*[-—•]\s+/.test(text)) {
                const cleaned = text.replace(/^\s*[-—•]\s+/, "");
                return (
                  <View key={idx} style={s.listItem}>
                    <Text style={s.listBullet}>—</Text>
                    <Text style={s.listText}>{cleaned}</Text>
                  </View>
                );
              }

              // Numbered items
              if (/^\s*\d+[.)]\s+/.test(text)) {
                const num = text.match(/^\s*(\d+)[.)]/)?.[1] ?? "";
                const cleaned = text.replace(/^\s*\d+[.)]\s+/, "");
                return (
                  <View key={idx} style={s.listItem}>
                    <Text style={[s.listBullet, { color: brand.dark }]}>
                      {num}.
                    </Text>
                    <Text style={s.listText}>{cleaned}</Text>
                  </View>
                );
              }

              // Inline bold
              if (/\*\*.+\*\*/.test(text)) {
                const parts = text.split(/(\*\*[^*]+\*\*)/);
                return (
                  <Text key={idx} style={s.paragraph}>
                    {parts.map((part, pi) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <Text key={pi} style={s.bold}>
                          {part.replace(/\*\*/g, "")}
                        </Text>
                      ) : (
                        <Text key={pi}>{part}</Text>
                      )
                    )}
                  </Text>
                );
              }

              return (
                <Text key={idx} style={s.paragraph}>
                  {text}
                </Text>
              );
            }

            default:
              return null;
          }
        })}

        {/* ─── Footer ─── */}
        <View style={s.footer} fixed>
          <View style={s.footerLeft}>
            <Text style={s.footerCompany}>
              AGENCIA DE PUBLICIDADE TBO LTDA
            </Text>
            <Text style={s.footerAddress}>
              CNPJ 41.312.686/0001-33 | Rua dos Cedros, 39 — Alphaville
              Graciosa, Pinhais/PR
            </Text>
          </View>
          <Text
            style={s.footerPage}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber}/${totalPages}`
            }
          />
        </View>

        {/* ─── Bottom orange bar ─── */}
        <View style={s.bottomBar} fixed />
      </Page>
    </Document>
  );
}
