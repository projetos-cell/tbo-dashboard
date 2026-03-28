// ─── Shared content parser for SOP templates (PDF + DOCX) ───────────────────

export interface SOPTemplateData {
  sopTitle: string;
  sopSlug: string;
  sopBu: string;
  sopVersion: number;
  stepTitle: string;
  stepContent: string;
}

export interface ContentBlock {
  type:
    | "text"
    | "content"
    | "checklist"
    | "table"
    | "heading"
    | "divider"
    | "field"
    | "multifield";
  content: string;
  label?: string;
  value?: string;
  fields?: { label: string; value: string }[];
  rows?: string[][];
}

/**
 * Replace emoji characters that Helvetica/Arial can't render with text equivalents
 */
export function sanitizeEmoji(text: string): string {
  return text
    .replace(/🟢/g, "SIM")
    .replace(/🟡/g, "PARCIAL")
    .replace(/🔴/g, "NAO")
    .replace(/✅/g, "[OK]")
    .replace(/❌/g, "[X]")
    .replace(/⚠️/g, "[!]")
    .replace(/✓/g, "SIM")
    .replace(/✗/g, "NAO")
    .replace(/→/g, ">")
    .replace(/←/g, "<")
    .replace(/🎯/g, "-")
    .replace(/🚧/g, "-")
    .replace(/📋/g, "")
    .replace(/📌/g, "")
    .replace(/📎/g, "")
    .replace(/💡/g, "")
    .replace(/🔗/g, "");
}

function hasPipeSeparatedFields(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.startsWith("|") && trimmed.endsWith("|")) return false;
  return trimmed.includes(" | ") && trimmed.includes(":");
}

function parsePipeFields(line: string): { label: string; value: string }[] {
  const segments = line
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  return segments.map((seg) => {
    if (seg.includes(":")) {
      const colonIdx = seg.indexOf(":");
      return {
        label: seg.substring(0, colonIdx).trim(),
        value: seg.substring(colonIdx + 1).trim(),
      };
    }
    return { label: seg, value: "" };
  });
}

function isFieldLine(line: string): boolean {
  return (
    /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ@\s/()[\]#.0-9]{2,}:\s*.*/i.test(line.trim()) &&
    !line.trim().startsWith("**") &&
    line.includes(":")
  );
}

function parseFieldLine(line: string): { label: string; value: string } {
  const colonIdx = line.indexOf(":");
  return {
    label: line.substring(0, colonIdx).trim(),
    value: line.substring(colonIdx + 1).trim(),
  };
}

function parseStructuredLine(line: string): ContentBlock {
  const trimmed = sanitizeEmoji(line.trim());

  if (hasPipeSeparatedFields(trimmed)) {
    const fields = parsePipeFields(trimmed);
    return { type: "multifield", content: trimmed, fields };
  }

  if (isFieldLine(trimmed)) {
    const { label, value } = parseFieldLine(trimmed);
    return { type: "field", content: trimmed, label, value };
  }

  if (/^\s*\[[ x]\]\s*/i.test(trimmed)) {
    return {
      type: "checklist",
      content: trimmed.replace(/^\s*\[[ x]\]\s*/, "").trim(),
    };
  }

  if (
    /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]{3,}$/.test(trimmed) &&
    trimmed === trimmed.toUpperCase()
  ) {
    return { type: "heading", content: trimmed };
  }

  return { type: "content", content: trimmed };
}

export function parseContent(raw: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const input = sanitizeEmoji(raw);
  const lines = input.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block → parse as structured content (NO code styling)
    if (line.trim().startsWith("```")) {
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        const trimmed = lines[i].trim();
        if (trimmed) {
          blocks.push(parseStructuredLine(trimmed));
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

    // Table row (markdown format: |col|col|)
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
