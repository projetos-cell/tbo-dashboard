"use client";

import React from "react";

/**
 * Renderiza texto com markdown básico para SOPs:
 * - **bold**, *italic*, `code` (inline)
 * - Tabelas markdown (| col | col |)
 * - Listas (— item, - item, * item, 1. item)
 */
export function MarkdownText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const blocks = parseBlocks(children);

  return (
    <div className={className}>
      {blocks.map((block, idx) => (
        <React.Fragment key={idx}>
          {block.type === "table" ? (
            <MarkdownTable rows={block.rows} />
          ) : (
            <span>
              {idx > 0 && block.type === "text" && <br />}
              <InlineParts parts={block.parts} />
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Table component ─────────────────────────────────────────────

function MarkdownTable({ rows }: { rows: string[][] }) {
  if (rows.length === 0) return null;

  const header = rows[0];
  // Skip separator row (|---|---|)
  const dataRows = rows.slice(1).filter(
    (row) => !row.every((cell) => /^[-:]+$/.test(cell.trim()))
  );

  return (
    <div className="my-2 overflow-x-auto rounded-lg border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/50">
            {header.map((cell, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left font-semibold text-foreground border-b"
              >
                <InlineParts parts={parseInline(cell.trim())} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={rowIdx % 2 === 1 ? "bg-muted/20" : ""}
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="px-3 py-2 border-b border-border/50"
                >
                  <InlineParts parts={parseInline(cell.trim())} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Inline rendering ────────────────────────────────────────────

interface TextPart {
  type: "text" | "bold" | "italic" | "code";
  text: string;
}

function InlineParts({ parts }: { parts: TextPart[] }) {
  return (
    <>
      {parts.map((part, idx) => {
        switch (part.type) {
          case "bold":
            return (
              <strong key={idx} className="font-semibold text-foreground">
                {part.text}
              </strong>
            );
          case "italic":
            return (
              <em key={idx} className="italic">
                {part.text}
              </em>
            );
          case "code":
            return (
              <code
                key={idx}
                className="px-1 py-0.5 rounded bg-muted font-mono text-[11px]"
              >
                {part.text}
              </code>
            );
          default:
            return <span key={idx}>{part.text}</span>;
        }
      })}
    </>
  );
}

// ─── Parsing ─────────────────────────────────────────────────────

type Block =
  | { type: "text"; parts: TextPart[] }
  | { type: "table"; rows: string[][] };

function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.includes("|");
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseBlocks(input: string): Block[] {
  const lines = input.split("\n");
  const blocks: Block[] = [];
  let tableBuffer: string[][] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isTableRow(line)) {
      if (!inTable) inTable = true;
      tableBuffer.push(parseTableRow(line));
    } else {
      // Flush table if we were in one
      if (inTable && tableBuffer.length > 0) {
        blocks.push({ type: "table", rows: tableBuffer });
        tableBuffer = [];
        inTable = false;
      }

      // Regular text line
      if (line.trim().length > 0 || blocks.length > 0) {
        blocks.push({ type: "text", parts: parseInline(line) });
      }
    }
  }

  // Flush remaining table
  if (inTable && tableBuffer.length > 0) {
    blocks.push({ type: "table", rows: tableBuffer });
  }

  return blocks;
}

function parseInline(input: string): TextPart[] {
  const parts: TextPart[] = [];
  let remaining = input;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/);
    if (boldMatch) {
      if (boldMatch[1]) parts.push({ type: "text", text: boldMatch[1] });
      parts.push({ type: "bold", text: boldMatch[2] });
      remaining = boldMatch[3];
      continue;
    }

    // Code: `text`
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)/);
    if (codeMatch) {
      if (codeMatch[1]) parts.push({ type: "text", text: codeMatch[1] });
      parts.push({ type: "code", text: codeMatch[2] });
      remaining = codeMatch[3];
      continue;
    }

    // Italic: *text* (single, not inside a word like file*name)
    const italicMatch = remaining.match(/^(.*?)(?<!\w)\*([^*]+?)\*(?!\w)(.*)/);
    if (italicMatch) {
      if (italicMatch[1]) parts.push({ type: "text", text: italicMatch[1] });
      parts.push({ type: "italic", text: italicMatch[2] });
      remaining = italicMatch[3];
      continue;
    }

    // Plain text
    parts.push({ type: "text", text: remaining });
    break;
  }

  if (parts.length === 0) {
    parts.push({ type: "text", text: "" });
  }

  return parts;
}
