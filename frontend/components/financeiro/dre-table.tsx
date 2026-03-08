"use client";

import { cn } from "@/lib/utils";
import type { DreData, DreRow, DreMonthColumn } from "@/services/finance";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ── Variation badge ───────────────────────────────────────────────────────────

function VarBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-muted-foreground text-[10px]">—</span>;
  const positive = pct >= 0;
  return (
    <span
      className={cn(
        "inline-block text-[10px] font-medium rounded px-1",
        positive
          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
      )}
    >
      {positive ? "+" : ""}
      {pct}%
    </span>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function DreTableRow({
  row,
  colCount,
}: {
  row: DreRow;
  colCount: number;
}) {
  return (
    <tr
      className={cn(
        "border-b border-border",
        row.isSubtotal
          ? "bg-muted/40 font-semibold"
          : "hover:bg-muted/20 transition-colors"
      )}
    >
      <td
        className={cn(
          "py-2 px-3 text-xs whitespace-nowrap",
          row.isSubtotal ? "text-foreground font-semibold" : "text-muted-foreground",
          row.isNegative && !row.isSubtotal && "pl-6"
        )}
      >
        {row.label}
      </td>
      {row.values.map((val, i) => {
        const isLast = i === colCount - 1;
        const negative = val < 0;
        return (
          <td
            key={i}
            className={cn(
              "py-2 px-3 text-right text-xs tabular-nums",
              isLast && "bg-card font-medium border-l border-border",
              row.isSubtotal && (val >= 0 ? "text-foreground" : "text-red-600 dark:text-red-400"),
              !row.isSubtotal && row.isNegative && "text-red-600 dark:text-red-400",
              !row.isSubtotal && !row.isNegative && !negative && "text-foreground",
              !row.isSubtotal && !row.isNegative && negative && "text-red-600 dark:text-red-400"
            )}
          >
            <div className="flex items-center justify-end gap-1.5">
              <span>{fmt(Math.abs(val))}</span>
              <VarBadge pct={row.variations[i]} />
            </div>
          </td>
        );
      })}
    </tr>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton({ cols }: { cols: number }) {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-8 bg-muted rounded w-full" />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <div className="h-6 bg-muted rounded w-32 shrink-0" />
          {Array.from({ length: cols }).map((__, j) => (
            <div key={j} className="h-6 bg-muted rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface DreTableProps {
  data?: DreData;
  isLoading?: boolean;
  onConfigureClick?: () => void;
}

export function DreTable({ data, isLoading = false, onConfigureClick }: DreTableProps) {
  if (isLoading) return <LoadingSkeleton cols={7} />;
  if (!data || data.columns.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhum dado disponível para o DRE. Sincronize com o Omie.
      </p>
    );
  }

  const colCount = data.columns.length;

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-muted-foreground">
          Alíquota de impostos configurada:{" "}
          <span className="font-medium text-foreground">{data.taxRate}%</span>
        </p>
        {onConfigureClick && (
          <button
            onClick={onConfigureClick}
            className="text-[10px] text-primary underline-offset-2 hover:underline"
          >
            Configurar alíquota
          </button>
        )}
      </div>
      <table className="w-full text-xs border-collapse min-w-[640px]">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="py-2 px-3 text-left font-semibold text-muted-foreground whitespace-nowrap">
              Linha
            </th>
            {data.columns.map((col: DreMonthColumn, i: number) => (
              <th
                key={col.yearMonth}
                className={cn(
                  "py-2 px-3 text-right font-semibold text-muted-foreground whitespace-nowrap",
                  i === colCount - 1 && "bg-card border-l border-border text-foreground"
                )}
              >
                {col.label}
                {i === colCount - 1 && (
                  <span className="ml-1 text-[9px] font-normal text-muted-foreground">(MTD)</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row: DreRow) => (
            <DreTableRow key={row.key} row={row} colCount={colCount} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
