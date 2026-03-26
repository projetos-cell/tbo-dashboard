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

// ─── TBO Brand tokens (from letterhead) ──────────────────────────────────────

const brand = {
  orange: "#e85102",
  dark: "#1a1a1a",
  body: "#3a3a3a",
  muted: "#7a7a7a",
  subtle: "#a0a0a0",
  border: "#d8d8d8",
  borderLight: "#ebebeb",
  bg: "#f5f3f1",
  white: "#ffffff",
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: brand.body,
    paddingTop: 90,
    paddingBottom: 90,
    paddingHorizontal: 60,
    lineHeight: 1.55,
  },

  // ─── Full page background (letterhead) ──
  bgImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },

  // ─── Header area ────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  headerLeft: {
    gap: 2,
  },
  headerCode: {
    fontSize: 9,
    fontWeight: "bold",
    color: brand.orange,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerBu: {
    fontSize: 7.5,
    color: brand.muted,
  },
  headerRight: {
    textAlign: "right",
    gap: 2,
  },
  headerVersion: {
    fontSize: 7.5,
    color: brand.muted,
  },
  headerDate: {
    fontSize: 7.5,
    color: brand.muted,
  },

  // ─── Title ──────────────────────────────
  titleBlock: {
    marginBottom: 24,
  },
  docTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: brand.dark,
    letterSpacing: 0.2,
    marginBottom: 6,
    lineHeight: 1.25,
  },
  docSubtitle: {
    fontSize: 8.5,
    color: brand.muted,
    lineHeight: 1.4,
  },

  // ─── Divider line ───────────────────────
  dividerOrange: {
    borderBottomWidth: 2,
    borderBottomColor: brand.orange,
    marginBottom: 20,
    width: 40,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: brand.borderLight,
    marginVertical: 14,
  },

  // ─── Section heading ────────────────────
  sectionHeading: {
    fontSize: 10,
    fontWeight: "bold",
    color: brand.dark,
    marginTop: 18,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // ─── Body text ──────────────────────────
  paragraph: {
    fontSize: 9,
    marginBottom: 5,
    color: brand.body,
    lineHeight: 1.65,
  },
  bold: {
    fontWeight: "bold",
    color: brand.dark,
  },

  // ─── Content line (from former code blocks) ──
  contentLine: {
    fontSize: 9,
    color: brand.body,
    lineHeight: 1.65,
    marginBottom: 3,
  },
  contentLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: brand.dark,
    lineHeight: 1.65,
    marginBottom: 3,
    marginTop: 6,
  },

  // ─── Field row (KEY: value) ─────────────
  fieldRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: brand.borderLight,
  },
  fieldRowAlt: {
    flexDirection: "row",
    marginBottom: 2,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: brand.borderLight,
  },
  fieldLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: brand.dark,
    width: "35%",
    letterSpacing: 0.2,
  },
  fieldValue: {
    fontSize: 8.5,
    color: brand.body,
    width: "65%",
  },
  fieldBlank: {
    fontSize: 8.5,
    color: brand.subtle,
    width: "65%",
    borderBottomWidth: 0.5,
    borderBottomColor: brand.muted,
    paddingBottom: 2,
  },

  // ─── Checklist ──────────────────────────
  checkItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  checkItemAlt: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 2,
  },
  checkBox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: brand.border,
    borderRadius: 2,
    marginTop: 1,
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
    lineHeight: 1.6,
  },

  // ─── Table ──────────────────────────────
  table: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: brand.border,
    borderRadius: 2,
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
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  tableCell: {
    fontSize: 8,
    color: brand.body,
    lineHeight: 1.4,
  },

  // ─── Footer info (above the logo area) ──
  footerInfo: {
    position: "absolute",
    bottom: 70,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 6,
    color: brand.subtle,
  },
  footerPage: {
    fontSize: 7,
    color: brand.muted,
    fontWeight: "bold",
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
  type: "text" | "content" | "checklist" | "table" | "heading" | "divider" | "field";
  content: string;
  label?: string;
  value?: string;
  rows?: string[][];
}

function isFieldLine(line: string): boolean {
  return /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s/()[\]]{2,}:\s*.*/i.test(line.trim()) &&
    !line.trim().startsWith("**") &&
    line.includes(":");
}

function parseFieldLine(line: string): { label: string; value: string } {
  const colonIdx = line.indexOf(":");
  return {
    label: line.substring(0, colonIdx).trim(),
    value: line.substring(colonIdx + 1).trim(),
  };
}

function parseContent(raw: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = raw.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block → parse as structured content (NO code styling)
    if (line.trim().startsWith("```")) {
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        const trimmed = lines[i].trim();
        if (trimmed) {
          if (isFieldLine(trimmed)) {
            const { label, value } = parseFieldLine(trimmed);
            blocks.push({ type: "field", content: trimmed, label, value });
          } else if (/^\s*\[[ x]\]\s*/i.test(trimmed)) {
            blocks.push({
              type: "checklist",
              content: trimmed.replace(/^\s*\[[ x]\]\s*/, "").trim(),
            });
          } else if (/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]{3,}$/.test(trimmed) && trimmed === trimmed.toUpperCase()) {
            blocks.push({ type: "heading", content: trimmed });
          } else {
            blocks.push({ type: "content", content: trimmed });
          }
        }
        i++;
      }
      if (i < lines.length) i++;
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

    // Bold heading (**TITLE**)
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

  const bgPath = path.join(process.cwd(), "public", "tbo-letterhead-bg.jpg");

  let checklistIdx = 0;
  let fieldIdx = 0;

  return (
    <Document
      title={`${data.sopSlug} — ${cleanStepTitle}`}
      author="TBO — Agencia de Publicidade"
    >
      <Page size="A4" style={s.page}>
        {/* ─── Full-page letterhead background ─── */}
        <Image style={s.bgImage} src={bgPath} fixed />

        {/* ─── Header ─── */}
        <View style={s.header} fixed>
          <View style={s.headerLeft}>
            <Text style={s.headerCode}>{sopCode}</Text>
            <Text style={s.headerBu}>{data.sopBu}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerVersion}>Versao {data.sopVersion}</Text>
            <Text style={s.headerDate}>{today}</Text>
          </View>
        </View>

        {/* ─── Title ─── */}
        <View style={s.titleBlock}>
          <Text style={s.docTitle}>{cleanStepTitle}</Text>
          <Text style={s.docSubtitle}>
            SOP: {data.sopTitle}
          </Text>
        </View>

        {/* ─── Orange accent line ─── */}
        <View style={s.dividerOrange} />

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

            case "content": {
              const text = block.content;
              if (/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(text) && text.length < 60 && !text.includes(":")) {
                return <Text key={idx} style={s.contentLabel}>{text}</Text>;
              }
              return <Text key={idx} style={s.contentLine}>{text}</Text>;
            }

            case "field": {
              const isAlt = fieldIdx++ % 2 === 1;
              const hasBlank = !block.value || block.value.includes("___");
              return (
                <View key={idx} style={isAlt ? s.fieldRowAlt : s.fieldRow}>
                  <Text style={s.fieldLabel}>{block.label}</Text>
                  {hasBlank ? (
                    <Text style={s.fieldBlank}>{block.value || ""}</Text>
                  ) : (
                    <Text style={s.fieldValue}>{block.value}</Text>
                  )}
                </View>
              );
            }

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

              if (/^\s*[-—•]\s+/.test(text)) {
                const cleaned = text.replace(/^\s*[-—•]\s+/, "");
                return (
                  <View key={idx} style={s.listItem}>
                    <Text style={s.listBullet}>—</Text>
                    <Text style={s.listText}>{cleaned}</Text>
                  </View>
                );
              }

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

        {/* ─── Footer info ─── */}
        <View style={s.footerInfo} fixed>
          <Text style={s.footerText}>
            AGENCIA DE PUBLICIDADE TBO LTDA | CNPJ 41.312.686/0001-33
          </Text>
          <Text
            style={s.footerPage}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber}/${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
