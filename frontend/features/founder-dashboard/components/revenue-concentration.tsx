"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { ClientRevenue } from "@/features/founder-dashboard/services/founder-dashboard";

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);
}

function calcHHI(clients: ClientRevenue[]): number {
  return Math.round(clients.reduce((s, c) => s + c.pctTotal * c.pctTotal, 0));
}

type RiskLevel = "baixo" | "moderado" | "alto";

function getRiskLevel(top3Pct: number): RiskLevel {
  if (top3Pct < 50) return "baixo";
  if (top3Pct < 70) return "moderado";
  return "alto";
}

const PIE_COLORS = [
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#94a3b8", // slate (for "Outros")
];

// ── Chart data ──────────────────────────────────────────────────────────────

interface PieSlice {
  name: string;
  value: number;
  pct: number;
}

function toPieData(
  data: ClientRevenue[],
  topN: number
): PieSlice[] {
  const displayed = data.slice(0, topN);
  const outros = data.slice(topN);
  const outrosReceita = outros.reduce((s, c) => s + c.receita, 0);
  const totalReceita = data.reduce((s, c) => s + c.receita, 0);
  const outrosPct = totalReceita > 0 ? (outrosReceita / totalReceita) * 100 : 0;

  const slices: PieSlice[] = displayed.map((c) => ({
    name: c.client,
    value: c.receita,
    pct: c.pctTotal,
  }));

  if (outros.length > 0) {
    slices.push({
      name: `Outros (${outros.length})`,
      value: outrosReceita,
      pct: outrosPct,
    });
  }

  return slices;
}

// ── Custom Tooltip ──────────────────────────────────────────────────────────

function ConcentrationTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PieSlice; color: string }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = payload[0].color;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md space-y-1">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-medium text-gray-900 truncate max-w-[180px]">
          {d.name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Receita:</span>
        <span className="text-xs font-semibold">{fmt(d.value)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Participação:</span>
        <span className="text-xs font-semibold">{d.pct.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: RiskLevel }) {
  const config: Record<RiskLevel, { label: string; className: string }> = {
    baixo: {
      label: "Risco Baixo",
      className:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    },
    moderado: {
      label: "Risco Moderado",
      className:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    },
    alto: {
      label: "Risco Alto",
      className:
        "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    },
  };

  const { label, className } = config[level];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function PieLegend({
  slices,
}: {
  slices: PieSlice[];
}) {
  return (
    <div className="space-y-1.5 mt-2">
      {slices.map((s, i) => (
        <div key={s.name} className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="h-2.5 w-2.5 rounded-sm shrink-0"
              style={{
                backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
              }}
            />
            <span
              className="text-xs text-gray-900 truncate"
              title={s.name}
            >
              {s.name}
            </span>
          </div>
          <span className={`text-xs shrink-0 ${s.pct > 30 ? "text-red-600 font-semibold" : "text-gray-500"}`}>
            {fmt(s.value)}&nbsp;·&nbsp;{s.pct.toFixed(1)}%{s.pct > 30 ? " ⚠" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-40 bg-gray-100 rounded" />
        <div className="h-5 w-24 bg-gray-100 rounded-full" />
      </div>
      <div className="flex justify-center">
        <div className="h-44 w-44 rounded-full bg-gray-100" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between">
            <div className="h-3 w-32 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
      <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-3 w-full bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

interface RevenueConcentrationProps {
  /** Full sorted client list (all clients, descending by receita). */
  data: ClientRevenue[];
  isLoading?: boolean;
  /** How many named slices to show before collapsing the rest into "Outros". */
  topN?: number;
  className?: string;
}

export function RevenueConcentration({
  data,
  isLoading = false,
  topN = 7,
  className = "",
}: RevenueConcentrationProps) {
  if (isLoading) return <LoadingSkeleton />;

  const isEmpty = data.length === 0;

  // Derived metrics
  const top1Pct = data[0]?.pctTotal ?? 0;
  const top3Pct = data.slice(0, 3).reduce((s, c) => s + c.pctTotal, 0);
  const top5Pct = data.slice(0, 5).reduce((s, c) => s + c.pctTotal, 0);
  const hhi = calcHHI(data);
  const riskLevel = getRiskLevel(top3Pct);

  const pieData = toPieData(data, topN);
  const totalReceita = data.reduce((s, c) => s + c.receita, 0);

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-4 space-y-4 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-gray-900">
          Concentração de Receita
        </h3>
        {!isEmpty && <RiskBadge level={riskLevel} />}
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <p className="text-sm text-gray-500 py-6 text-center">
          Nenhuma receita registrada no período.
        </p>
      ) : (
        <>
          {/* Donut chart */}
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="85%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {pieData.map((slice, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                      fillOpacity={slice.pct > 30 ? 1 : 0.85}
                      stroke={slice.pct > 30 ? "#dc2626" : "none"}
                      strokeWidth={slice.pct > 30 ? 3 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ConcentrationTooltip />} />
                {/* Center label */}
                <text
                  x="50%"
                  y="46%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-gray-900 text-sm font-bold"
                >
                  {fmt(totalReceita)}
                </text>
                <text
                  x="50%"
                  y="56%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-muted-foreground text-[10px]"
                >
                  Total
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend below chart */}
          <PieLegend slices={pieData} />

          {/* Footer metrics */}
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {/* Top 1 */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Top&nbsp;1</span>
                <span className="text-xs font-medium text-gray-900">
                  {top1Pct.toFixed(1)}%
                </span>
              </div>

              {/* Top 3 — colored by risk */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Top&nbsp;3</span>
                <span
                  className={`text-xs font-medium ${
                    riskLevel === "alto"
                      ? "text-red-600 dark:text-red-400"
                      : riskLevel === "moderado"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {top3Pct.toFixed(1)}%
                </span>
              </div>

              {/* Top 5 */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Top&nbsp;5</span>
                <span className="text-xs font-medium text-gray-900">
                  {top5Pct.toFixed(1)}%
                </span>
              </div>

              {/* HHI — colored by concentration */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">HHI</span>
                <span
                  className={`text-xs font-medium ${
                    hhi > 2500
                      ? "text-red-600 dark:text-red-400"
                      : hhi > 1500
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {hhi.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              {data.length} cliente{data.length !== 1 ? "s" : ""} com receita no período
            </p>
          </div>
        </>
      )}
    </div>
  );
}
