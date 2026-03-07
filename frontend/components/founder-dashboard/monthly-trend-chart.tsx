"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import type { MonthlyTrendPoint } from "@/services/founder-dashboard";

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtBRL(v: number): string {
  if (Math.abs(v) >= 1_000_000)
    return `R$\u00a0${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000)
    return `R$\u00a0${(v / 1_000).toFixed(0)}k`;
  return `R$\u00a0${v.toFixed(0)}`;
}

function fmtBRLFull(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const rec  = payload.find((p) => p.name === "Receita")?.value ?? 0;
  const desp = payload.find((p) => p.name === "Despesa")?.value ?? 0;
  const marg = payload.find((p) => p.name === "Margem")?.value ?? 0;
  const margPct = rec > 0 ? (marg / rec) * 100 : 0;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-xs">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-emerald-500">Receita: {fmtBRLFull(rec)}</p>
      <p className="text-rose-500">Despesa: {fmtBRLFull(desp)}</p>
      <p className={marg >= 0 ? "text-blue-500" : "text-amber-500"}>
        Margem: {fmtBRLFull(marg)} ({margPct.toFixed(1)}%)
      </p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  data: MonthlyTrendPoint[];
}

export function MonthlyTrendChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sem dados de tendência disponíveis.
      </div>
    );
  }

  // The last bar (current partial month) is visually distinct
  const currentMonth = data[data.length - 1]?.month;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart
        data={data}
        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="brl"
          tickFormatter={fmtBRL}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <YAxis
          yAxisId="margem"
          orientation="right"
          tickFormatter={fmtBRL}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11 }}
        />
        <ReferenceLine yAxisId="brl" y={0} stroke="hsl(var(--border))" />

        {/* Receita bars — current month semi-transparent (partial data) */}
        <Bar
          yAxisId="brl"
          dataKey="receita"
          name="Receita"
          radius={[3, 3, 0, 0]}
          maxBarSize={32}
        >
          {data.map((point, i) => (
            <Cell
              key={i}
              fill="hsl(160 60% 45%)"
              fillOpacity={point.month === currentMonth ? 0.5 : 0.9}
            />
          ))}
        </Bar>

        {/* Despesa bars */}
        <Bar
          yAxisId="brl"
          dataKey="despesa"
          name="Despesa"
          radius={[3, 3, 0, 0]}
          maxBarSize={32}
        >
          {data.map((point, i) => (
            <Cell
              key={i}
              fill="hsl(0 70% 58%)"
              fillOpacity={point.month === currentMonth ? 0.5 : 0.85}
            />
          ))}
        </Bar>

        {/* Margem line */}
        <Line
          yAxisId="margem"
          type="monotone"
          dataKey="margem"
          name="Margem"
          stroke="hsl(213 90% 60%)"
          strokeWidth={2}
          dot={{ r: 3, fill: "hsl(213 90% 60%)" }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
