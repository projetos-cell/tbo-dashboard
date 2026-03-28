/**
 * Universal export utilities for CSV, XLSX, and PDF formats.
 * All functions trigger a browser download on completion.
 */

export interface ExportColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "currency" | "date" | "boolean" | "percent";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Formats a cell value for export based on type hint.
 */
export function formatCellValue(value: unknown, type?: string): string {
  if (value === null || value === undefined) return "";

  switch (type) {
    case "currency":
      if (typeof value === "number") {
        return value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
      }
      return String(value);

    case "percent":
      if (typeof value === "number") {
        return `${value.toFixed(2)}%`;
      }
      return String(value);

    case "number":
      if (typeof value === "number") {
        return value.toLocaleString("pt-BR");
      }
      return String(value);

    case "date": {
      const dateStr = String(value);
      if (!dateStr) return "";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("pt-BR");
      } catch {
        return dateStr;
      }
    }

    case "boolean":
      return value ? "Sim" : "Não";

    default:
      if (value instanceof Date) {
        return value.toLocaleDateString("pt-BR");
      }
      if (typeof value === "boolean") {
        return value ? "Sim" : "Não";
      }
      return String(value);
  }
}

/**
 * Creates a temporary anchor element and triggers a file download.
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// ── CSV ───────────────────────────────────────────────────────────────────────

/**
 * Exports data as a CSV file and triggers browser download.
 * If columns is provided, only those keys are exported with given labels.
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  columns?: ExportColumn[]
): void {
  if (!data.length) return;

  const cols =
    columns ??
    Object.keys(data[0]).map((k) => ({ key: k, label: k, type: undefined }));

  const escape = (val: string) => {
    if (/[",\n\r]/.test(val)) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const header = cols.map((c) => escape(c.label)).join(",");
  const rows = data.map((row) =>
    cols
      .map((c) => escape(formatCellValue(row[c.key], c.type)))
      .join(",")
  );

  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

// ── XLSX ──────────────────────────────────────────────────────────────────────

/**
 * Exports data as an XLSX file and triggers browser download.
 * Uses a manual implementation compatible with Google Sheets.
 * For production with complex formatting, replace with the `xlsx` npm package.
 */
export async function exportToXLSX(
  data: Record<string, unknown>[],
  filename: string,
  columns?: ExportColumn[],
  sheetName = "Dados"
): Promise<void> {
  if (!data.length) return;

  // XLSX implementation using SpreadsheetML (no external dependency)
  const cols =
    columns ??
    Object.keys(data[0]).map((k) => ({ key: k, label: k, type: undefined }));

  const xmlRows = [
    `<Row>${cols.map((c) => `<Cell><Data ss:Type="String">${escapeXml(c.label)}</Data></Cell>`).join("")}</Row>`,
    ...data.map(
      (row) =>
        `<Row>${cols
          .map((c) => {
            const raw = row[c.key];
            const isNum =
              (c.type === "number" || c.type === "currency" || c.type === "percent") &&
              typeof raw === "number";
            const val = isNum ? String(raw) : escapeXml(formatCellValue(raw, c.type));
            const type = isNum ? "Number" : "String";
            return `<Cell><Data ss:Type="${type}">${val}</Data></Cell>`;
          })
          .join("")}</Row>`
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="${escapeXml(sheetName.substring(0, 31))}">
    <Table>${xmlRows.join("")}</Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  triggerDownload(blob, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── PDF ───────────────────────────────────────────────────────────────────────

export interface PDFExportOptions {
  orientation?: "portrait" | "landscape";
  logo?: boolean;
  subtitle?: string;
}

/**
 * Generates a simple data table PDF using HTML + print styles.
 * Opens in a new tab and triggers the print dialog for Save as PDF.
 */
export function exportToPDF(
  title: string,
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  options: PDFExportOptions = {}
): void {
  const { orientation = "landscape" } = options;

  const headerRow = columns
    .map((c) => `<th>${escapeHtml(c.label)}</th>`)
    .join("");

  const bodyRows = data
    .map(
      (row) =>
        `<tr>${columns
          .map((c) => `<td>${escapeHtml(formatCellValue(row[c.key], c.type))}</td>`)
          .join("")}</tr>`
    )
    .join("");

  const now = new Date().toLocaleDateString("pt-BR");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<style>
  @page { size: A4 ${orientation}; margin: 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #111; }
  .header { margin-bottom: 16px; border-bottom: 2px solid #18181B; padding-bottom: 12px; }
  .title { font-size: 18px; font-weight: 700; color: #18181B; }
  .meta { font-size: 10px; color: #666; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #18181B; color: #fff; padding: 6px 8px; text-align: left; font-weight: 600; font-size: 10px; }
  td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
  tr:nth-child(even) td { background: #f9fafb; }
  .footer { margin-top: 12px; font-size: 9px; color: #999; }
</style>
</head>
<body>
<div class="header">
  <div class="title">${escapeHtml(title)}</div>
  <div class="meta">Gerado em ${now} · ${data.length} registro${data.length !== 1 ? "s" : ""}</div>
</div>
<table>
  <thead><tr>${headerRow}</tr></thead>
  <tbody>${bodyRows}</tbody>
</table>
<div class="footer">TBO OS · Exportado automaticamente</div>
<script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
