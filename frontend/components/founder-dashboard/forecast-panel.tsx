"use client";

import { Info, TrendingUp } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
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

// ── Custom Tooltip ───────────────────────────────────────────────────────────

function ForecastTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ForecastMonth }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{d.label}</p>
      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
        {fmt(d.value)}
      </p>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

interface ForecastPanelProps {
  total: number;
  months: ForecastMonth[];
  isLoading?: boolean;
}

export function ForecastPanel({ total, months, isLoading }: ForecastPanelProps) {
  // Gradient colors per bar (month 1 → 3)
  const barColors = ["#3b82f6", "#6366f1", "#8b5cf6"];

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
          <Skeleton className="h-40 w-full" />
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

          {/* Recharts Bar Chart */}
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={months}
                margin={{ top: 8, right: 4, left: 4, bottom: 4 }}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => fmt(v)}
                  width={80}
                  domain={[0, (dataMax: number) => (dataMax > 0 ? dataMax : 1)]}
                />
                <Tooltip
                  content={<ForecastTooltip />}
                  cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {months.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={barColors[idx % barColors.length]}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
