"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { fmt, PIE_COLORS } from "./revenue-concentration-helpers";
import type { RiskLevel, PieSlice } from "./revenue-concentration-helpers";

// ── Custom Tooltip ───────────────────────────────────────────────────────────

export function ConcentrationTooltip({
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
        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs font-medium text-gray-900 truncate max-w-[180px]">{d.name}</span>
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

// ── Risk Badge ───────────────────────────────────────────────────────────────

export function RiskBadge({ level }: { level: RiskLevel }) {
  const config: Record<RiskLevel, { label: string; className: string }> = {
    baixo: { label: "Risco Baixo", className: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
    moderado: { label: "Risco Moderado", className: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
    alto: { label: "Risco Alto", className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" },
  };
  const { label, className } = config[level];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

// ── Pie Legend ───────────────────────────────────────────────────────────────

export function PieLegend({ slices }: { slices: PieSlice[] }) {
  return (
    <div className="space-y-1.5 mt-2">
      {slices.map((s, i) => (
        <div key={s.name} className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="text-xs text-gray-900 truncate" title={s.name}>{s.name}</span>
          </div>
          <span className={`text-xs shrink-0 ${s.pct > 30 ? "text-red-600 font-semibold" : "text-gray-500"}`}>
            {fmt(s.value)}&nbsp;·&nbsp;{s.pct.toFixed(1)}%{s.pct > 30 ? " ⚠" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────

export function ConcentrationLoadingSkeleton() {
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

// ── Donut Chart ──────────────────────────────────────────────────────────────

interface ConcentrationDonutProps {
  pieData: PieSlice[];
  totalReceita: number;
}

export function ConcentrationDonut({ pieData, totalReceita }: ConcentrationDonutProps) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="50%" outerRadius="85%" paddingAngle={2} strokeWidth={0}>
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
          <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" className="fill-gray-900 text-sm font-bold">
            {fmt(totalReceita)}
          </text>
          <text x="50%" y="56%" textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground text-[10px]">
            Total
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
