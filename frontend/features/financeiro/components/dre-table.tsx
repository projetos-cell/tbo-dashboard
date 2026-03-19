"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fmt, fmtPct } from "../lib/formatters";
import { buildDRELines } from "../services/finance-accounting";
import type { DRESnapshot } from "../services/finance-accounting";
import { cn } from "@/lib/utils";

interface DRETableProps {
  snapshot: DRESnapshot | null | undefined;
  isLoading?: boolean;
}

export function DRETable({ snapshot, isLoading }: DRETableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 17 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center py-1.5 border-b border-border/40">
            <Skeleton className="h-3.5 w-64" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
        <p className="text-sm font-medium">Sem dados para o período selecionado</p>
        <p className="text-xs">Clique em &quot;Calcular DRE&quot; para gerar os dados do mês.</p>
      </div>
    );
  }

  const lines = buildDRELines(snapshot);
  const receitaBruta = snapshot.receita_bruta;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="text-left py-2 font-medium w-[55%]">Conta</th>
            <th className="text-right py-2 font-medium w-[20%]">Valor (R$)</th>
            <th className="text-right py-2 font-medium w-[15%]">% Receita</th>
            <th className="text-right py-2 font-medium w-[10%]">Sinal</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const pct = receitaBruta > 0 ? (Math.abs(line.value) / receitaBruta) * 100 : 0;
            const isNegative = line.value < 0;
            const isZero = line.value === 0;

            return (
              <tr
                key={line.key}
                className={cn(
                  "border-b border-border/40 transition-colors hover:bg-muted/30",
                  line.isTotal && "border-t-2 border-border bg-muted/20",
                  line.isSubtotal && "bg-muted/10"
                )}
              >
                <td
                  className={cn(
                    "py-2 pr-2",
                    line.indent === 1 && "pl-6",
                    line.isTotal && "font-bold",
                    line.isSubtotal && "font-semibold",
                    !line.isTotal && !line.isSubtotal && "text-muted-foreground"
                  )}
                >
                  {line.label}
                </td>
                <td
                  className={cn(
                    "text-right py-2 tabular-nums font-medium",
                    line.isTotal && "font-bold text-base",
                    !isZero && line.isPositive === true && "text-emerald-600 dark:text-emerald-400",
                    !isZero && line.isPositive === false && "text-red-600 dark:text-red-400",
                    isNegative && "text-red-600 dark:text-red-400"
                  )}
                >
                  {isZero ? (
                    <span className="text-muted-foreground/50">—</span>
                  ) : (
                    fmt(line.value)
                  )}
                </td>
                <td className="text-right py-2 tabular-nums text-muted-foreground text-xs">
                  {isZero ? "—" : fmtPct(pct)}
                </td>
                <td className="text-right py-2">
                  {line.sign === 1 ? (
                    <span className="text-xs text-emerald-600/60">+</span>
                  ) : (
                    <span className="text-xs text-red-600/60">−</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
