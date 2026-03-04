"use client";

import { Info, TrendingUp } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import type { ForecastMonth } from "@/services/founder-dashboard";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ── Component ────────────────────────────────────────────────────────────────

interface ForecastPanelProps {
  total: number;
  months: ForecastMonth[];
  isLoading?: boolean;
}

export function ForecastPanel({ total, months, isLoading }: ForecastPanelProps) {
  const maxVal = Math.max(...months.map((m) => m.value), 1);

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold">Forecast de Receita (90 dias)</h2>
          <p className="text-xs text-muted-foreground">
            Baseado em Contas a Receber
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Informacoes do bloco"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 text-sm space-y-1" side="top">
              <p className="font-medium">Forecast 90 dias</p>
              <p className="text-xs text-muted-foreground">
                Baseado em Contas a Receber (vencimentos) no Omie.
              </p>
              <p className="text-xs text-muted-foreground">
                Propostas nao entram neste calculo.
              </p>
            </PopoverContent>
          </Popover>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : months.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Nenhum recebivel previsto nos proximos 90 dias.
        </p>
      ) : (
        <>
          {/* Total */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground">Total previsto</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {fmt(total)}
            </p>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-3 h-32">
            {months.map((m) => {
              const pct = (m.value / maxVal) * 100;
              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs font-semibold">{fmt(m.value)}</span>
                  <div className="w-full flex items-end h-20">
                    <div
                      className="w-full bg-blue-500/60 rounded-t-sm min-h-[4px] transition-all"
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
