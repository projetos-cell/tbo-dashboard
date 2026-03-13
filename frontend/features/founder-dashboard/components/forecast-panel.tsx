"use client";

import { useState, useRef, useEffect } from "react";
import { IconInfoCircle, IconTrendingUp } from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ForecastMonth } from "@/features/founder-dashboard/services/founder-dashboard";

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
  const proposals = d.proposals ?? 0;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md space-y-1">
      <p className="text-xs font-medium text-gray-900">{d.label}</p>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        <span className="text-xs text-gray-500">Confirmado:</span>
        <span className="text-xs font-semibold">{fmt(d.value)}</span>
      </div>
      {proposals > 0 && (
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-xs text-gray-500">Propostas:</span>
          <span className="text-xs font-semibold">{fmt(proposals)}</span>
        </div>
      )}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

interface ForecastPanelProps {
  total: number;
  proposalsTotal?: number;
  months: ForecastMonth[];
  isLoading?: boolean;
}

export function ForecastPanel({ total, proposalsTotal, months, isLoading }: ForecastPanelProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tooltipOpen) return;
    function handleClick(e: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setTooltipOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [tooltipOpen]);

  const hasProposals = (proposalsTotal ?? 0) > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold">Forecast de Receita (90 dias)</h2>
          <p className="text-xs text-gray-500">
            Contas a Receber + Propostas
          </p>
        </div>
        <div className="flex items-center gap-1">
          <div ref={tooltipRef} className="relative">
            <button
              type="button"
              onClick={() => setTooltipOpen((v) => !v)}
              className="flex h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Informações do bloco"
            >
              <IconInfoCircle className="h-3.5 w-3.5" />
            </button>
            {tooltipOpen && (
              <div className="absolute right-0 bottom-full mb-2 z-50 w-72 rounded-xl border border-gray-200 bg-white shadow-lg p-3 space-y-1">
                <p className="text-sm font-medium text-gray-900">Forecast 90 dias</p>
                <p className="text-xs text-gray-500">
                  Baseado em Contas a Receber (vencimentos) no Omie.
                </p>
                <p className="text-xs text-gray-500">
                  Propostas aparecem empilhadas (ponderadas por probabilidade).
                </p>
              </div>
            )}
          </div>
          <IconTrendingUp className="h-4 w-4 text-gray-500" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="animate-pulse bg-gray-100 rounded-lg h-8 w-40" />
          <div className="animate-pulse bg-gray-100 rounded-lg h-40 w-full" />
        </div>
      ) : months.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          Nenhum recebível previsto nos próximos 90 dias.
        </p>
      ) : (
        <>
          {/* Total */}
          <div className="mb-4">
            <p className="text-xs text-gray-500">Total confirmado</p>
            <p className="text-2xl font-bold text-tbo-orange">
              {fmt(total)}
            </p>
            {hasProposals && (
              <p className="text-xs text-amber-600 mt-0.5">
                + {fmt(proposalsTotal ?? 0)} em propostas
              </p>
            )}
          </div>

          {/* Recharts Stacked Bar Chart */}
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
                <Bar dataKey="value" stackId="forecast" fill="#3b82f6" fillOpacity={0.85} maxBarSize={56} />
                <Bar dataKey="proposals" stackId="forecast" fill="#f59e0b" fillOpacity={0.5} radius={[6, 6, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500 opacity-85" />
              <span className="text-xs text-gray-500">Confirmado</span>
            </div>
            {hasProposals && (
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-400 opacity-50" />
                <span className="text-xs text-gray-500">Propostas</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
