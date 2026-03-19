"use client";

import { Card, CardContent } from "@/components/ui/card";
import { IconTrendingUp, IconCurrencyDollar, IconTarget, IconChartBar } from "@tabler/icons-react";
import { DEAL_STAGES, type DealStageKey } from "@/lib/constants";

interface DealKPIs {
  total: number;
  active: number;
  won: number;
  lost: number;
  pipelineValue: number;
  wonValue: number;
  forecast: number;
  conversionRate: number;
}

interface StageDistribution {
  stage: DealStageKey;
  count: number;
  value: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Mini horizontal stacked bar showing stage distribution */
function StageBar({ distribution }: { distribution: StageDistribution[] }) {
  const total = distribution.reduce((s, d) => s + d.count, 0);
  if (total === 0) return null;

  return (
    <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-gray-100 mt-2">
      {distribution.map((d) => {
        const pct = (d.count / total) * 100;
        if (pct === 0) return null;
        const cfg = DEAL_STAGES[d.stage];
        return (
          <div
            key={d.stage}
            className="h-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: cfg?.color ?? "#6b7280" }}
            title={`${cfg?.label}: ${d.count} (${pct.toFixed(0)}%)`}
          />
        );
      })}
    </div>
  );
}

/** Mini funnel visualization: vertical bars per stage */
function FunnelMini({ distribution }: { distribution: StageDistribution[] }) {
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);
  const openStages = distribution.filter(
    (d) => d.stage !== "fechado_ganho" && d.stage !== "fechado_perdido",
  );
  if (openStages.length === 0) return null;

  return (
    <div className="flex items-end gap-0.5 h-6 mt-1">
      {openStages.map((d) => {
        const h = Math.max((d.count / maxCount) * 100, 8);
        const cfg = DEAL_STAGES[d.stage];
        return (
          <div
            key={d.stage}
            className="w-2 rounded-t-sm transition-all duration-500"
            style={{
              height: `${h}%`,
              backgroundColor: cfg?.color ?? "#6b7280",
              opacity: 0.7,
            }}
            title={`${cfg?.label}: ${d.count}`}
          />
        );
      })}
    </div>
  );
}

export function DealKPICards({
  kpis,
  distribution,
}: {
  kpis: DealKPIs;
  distribution?: StageDistribution[];
}) {
  const items = [
    {
      label: "Pipeline Ativo",
      value: formatCurrency(kpis.pipelineValue),
      sub: `${kpis.active} deals abertos`,
      icon: IconCurrencyDollar,
      color: "text-blue-600",
      visual: distribution ? <StageBar distribution={distribution} /> : null,
    },
    {
      label: "Forecast Ponderado",
      value: formatCurrency(kpis.forecast),
      sub: "valor × probabilidade",
      icon: IconTrendingUp,
      color: "text-purple-600",
      visual: distribution ? <FunnelMini distribution={distribution} /> : null,
    },
    {
      label: "Ganhos",
      value: formatCurrency(kpis.wonValue),
      sub: `${kpis.won} deals fechados`,
      icon: IconTarget,
      color: "text-green-600",
      visual: null,
    },
    {
      label: "Conversão",
      value: kpis.conversionRate > 0 ? `${kpis.conversionRate.toFixed(1)}%` : "—",
      sub: `${kpis.won + kpis.lost} encerrados`,
      icon: IconChartBar,
      color: "text-amber-600",
      visual: kpis.conversionRate > 0 ? (
        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden mt-2">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-500"
            style={{ width: `${Math.min(kpis.conversionRate, 100)}%` }}
          />
        </div>
      ) : null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 ${item.color}`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold leading-none tabular-nums">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            </div>
            {item.visual}
            <p className="text-[10px] text-gray-400 mt-1">{item.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
