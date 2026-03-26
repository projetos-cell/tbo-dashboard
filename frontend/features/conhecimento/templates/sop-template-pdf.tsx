import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ─── Fonts ───────────────────────────────────────────────────────────────────

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
    { src: "Helvetica-Oblique", fontStyle: "italic" },
  ],
});

// ─── Colors ──────────────────────────────────────────────────────────────────

const c = {
  primary: "#1a1a1a",
  secondary: "#4a4a4a",
  muted: "#8a8a8a",
  accent: "#F97316", // TBO orange
  border: "#e5e5e5",
  bgLight: "#f8f8f8",
  white: "#ffffff",
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: c.primary,
    paddingTop: 70,
    paddingBottom: 60,
    paddingHorizontal: 50,
    lineHeight: 1.5,
  },
  // Letterhead header
  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: c.accent,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: c.primary,
  },
  headerBrand: {
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 3,
    color: c.primary,
  },
  headerSub: {
    fontSize: 7,
    color: c.muted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  headerMeta: {
    textAlign: "right",
    fontSize: 7.5,
    color: c.muted,
    lineHeight: 1.6,
  },
  // Document title
  docTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: c.primary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  docSubtitle: {
    fontSize: 9,
    color: c.muted,
    marginBottom: 16,
  },
  // Metadata badge row
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  metaItem: {
    flexDirection: "row",
    gap: 3,
  },
  metaLabel: {
    fontSize: 7,
    color: c.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: c.secondary,
  },
  // Section
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: c.primary,
    marginTop: 16,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  // Content text
  paragraph: {
    fontSize: 9,
    marginBottom: 4,
    color: c.secondary,
    lineHeight: 1.6,
  },
  bold: {
    fontWeight: "bold",
    color: c.primary,
  },
  // Code block (template content)
  codeBlock: {
    backgroundColor: c.bgLight,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 3,
    padding: 10,
    marginVertical: 6,
    fontFamily: "Courier",
    fontSize: 8,
    color: c.secondary,
    lineHeight: 1.5,
  },
  // Checklist
  checkItem: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 3,
    paddingLeft: 4,
  },
  checkBox: {
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: c.secondary,
    borderRadius: 1.5,
    marginTop: 1,
  },
  checkText: {
    fontSize: 9,
    color: c.secondary,
    flex: 1,
  },
  // List item
  listItem: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 3,
    paddingLeft: 4,
  },
  listBullet: {
    fontSize: 9,
    color: c.accent,
    width: 8,
  },
  listText: {
    fontSize: 9,
    color: c.secondary,
    flex: 1,
  },
  // Table
  table: {
    marginVertical: 6,
    borderWidth: 1,
    borderColor: c.border,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: c.primary,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: c.white,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    backgroundColor: c.bgLight,
  },
  tableCell: {
    fontSize: 8,
    color: c.secondary,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 25,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: c.border,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 6.5,
    color: c.muted,
  },
  footerPage: {
    fontSize: 6.5,
    color: c.muted,
  },
  // Accent bar at bottom
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: c.accent,
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
  type: "text" | "code" | "checklist" | "table" | "heading";
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
        // Skip separator rows
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

    // Bold heading (** at start)
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

  return (
    <Document
      title={`${data.sopSlug} — ${cleanStepTitle}`}
      author="TBO — Agencia de Publicidade"
    >
      <Page size="A4" style={s.page}>
        {/* Orange top bar */}
        <View style={s.headerBar} fixed />

        {/* Letterhead header */}
        <View style={s.header} fixed>
          <View>
            <Text style={s.headerBrand}>TBO</Text>
            <Text style={s.headerSub}>AGENCIA DE PUBLICIDADE</Text>
          </View>
          <View style={s.headerMeta}>
            <Text>{data.sopSlug.toUpperCase()}</Text>
            <Text>Versao {data.sopVersion} | {today}</Text>
            <Text>BU: {data.sopBu}</Text>
          </View>
        </View>

        {/* Document title */}
        <Text style={s.docTitle}>{cleanStepTitle}</Text>
        <Text style={s.docSubtitle}>
          Extraido do SOP: {data.sopTitle}
        </Text>

        {/* Metadata badges */}
        <View style={s.metaRow}>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Codigo: </Text>
            <Text style={s.metaValue}>
              {data.sopSlug.split("-").slice(0, 3).join("-").toUpperCase()}
            </Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Area: </Text>
            <Text style={s.metaValue}>{data.sopBu}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Gerado em: </Text>
            <Text style={s.metaValue}>{today}</Text>
          </View>
        </View>

        {/* Content blocks */}
        {blocks.map((block, idx) => {
          switch (block.type) {
            case "heading":
              return (
                <Text key={idx} style={s.sectionTitle}>
                  {block.content}
                </Text>
              );

            case "code":
              return (
                <View key={idx} style={s.codeBlock}>
                  <Text>{block.content}</Text>
                </View>
              );

            case "checklist":
              return (
                <View key={idx} style={s.checkItem}>
                  <View style={s.checkBox} />
                  <Text style={s.checkText}>{block.content}</Text>
                </View>
              );

            case "table":
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

            case "text": {
              const text = block.content;
              // Handle lines starting with - as list items
              if (/^\s*[-—•]\s+/.test(text)) {
                const cleaned = text.replace(/^\s*[-—•]\s+/, "");
                return (
                  <View key={idx} style={s.listItem}>
                    <Text style={s.listBullet}>•</Text>
                    <Text style={s.listText}>{cleaned}</Text>
                  </View>
                );
              }
              // Handle numbered items
              if (/^\s*\d+\.\s+/.test(text)) {
                const num = text.match(/^\s*(\d+)\./)?.[1] ?? "";
                const cleaned = text.replace(/^\s*\d+\.\s+/, "");
                return (
                  <View key={idx} style={s.listItem}>
                    <Text style={[s.listBullet, { color: c.primary }]}>
                      {num}.
                    </Text>
                    <Text style={s.listText}>{cleaned}</Text>
                  </View>
                );
              }
              // Bold inline
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

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            AGENCIA DE PUBLICIDADE TBO LTDA | CNPJ 41.312.686/0001-33
          </Text>
          <Text
            style={s.footerPage}
            render={({ pageNumber, totalPages }) =>
              `Pagina ${pageNumber} de ${totalPages}`
            }
          />
        </View>

        {/* Orange bottom bar */}
        <View style={s.footerBar} fixed />
      </Page>
    </Document>
  );
}
