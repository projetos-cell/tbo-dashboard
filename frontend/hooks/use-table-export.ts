"use client";

import { useCallback } from "react";
import { toast } from "sonner";

// ── CSV Export ────────────────────────────────────────────

interface ExportColumn<T> {
  /** Header label shown in CSV */
  header: string;
  /** Accessor function to get cell value from a row */
  accessor: (row: T) => string | number | boolean | null | undefined;
}

interface UseTableExportOptions<T> {
  /** File name (without extension) */
  filename: string;
  /** Column definitions */
  columns: ExportColumn<T>[];
  /** Data rows */
  data: T[];
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function useTableExport<T>() {
  const exportCSV = useCallback(
    ({ filename, columns, data }: UseTableExportOptions<T>) => {
      try {
        const header = columns.map((c) => escapeCsvValue(c.header)).join(",");
        const rows = data.map((row) =>
          columns.map((c) => escapeCsvValue(c.accessor(row))).join(","),
        );
        const csv = [header, ...rows].join("\n");

        // BOM for Excel UTF-8 compatibility
        const blob = new Blob(["\uFEFF" + csv], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Exportado com sucesso");
      } catch {
        toast.error("Erro ao exportar dados");
      }
    },
    [],
  );

  const exportJSON = useCallback(
    ({ filename, columns, data }: UseTableExportOptions<T>) => {
      try {
        const jsonData = data.map((row) => {
          const obj: Record<string, unknown> = {};
          for (const col of columns) {
            obj[col.header] = col.accessor(row);
          }
          return obj;
        });

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Exportado com sucesso");
      } catch {
        toast.error("Erro ao exportar dados");
      }
    },
    [],
  );

  return { exportCSV, exportJSON };
}

// ── Shared export button component ────────────────────────

export type { ExportColumn, UseTableExportOptions };
