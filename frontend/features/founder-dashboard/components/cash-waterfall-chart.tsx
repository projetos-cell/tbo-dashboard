"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Waterfall data builder ────────────────────────────────────────────────────

/**
 * Recharts waterfall trick:
 * Each bar has two segments stacked: an invisible "base" (transparent) + the
 * visible bar. The base pushes the visible segment to the correct Y position.
 *
 * Steps: Caixa Atual → +AR (receivable) → −AP (payable) → Caixa Previsto
 */
interface WaterfallRow {
  label: string;
  base: number;     // invisible offset — makes bar float
  value: number;    // visible bar height (positive or negative)
  total: number;    // running total shown in tooltip
  kind: "start" | "positive" | "negative" | "end";
}

function buildWaterfall(
  caixaAtual: number,
  arNext30: number,
  apNext30: number,
): WaterfallRow[] {
  const caixaPrevisto = caixaAtual + arNext30 - apNext30;

  return [
    {
      label: "Caixa Atual",
      base: Math.min(caixaAtual, 0),
      value: Math.abs(caixaAtual),
      total: caixaAtual,
      kind: "start",
    },
    {
      label: "+AR 30d",
      base: caixaAtual < 0 ? caixaAtual : caixaAtual,
      value: arNext30,
      total: caixaAtual + arNext30,
      kind: "positive",
    },
    {
      label: "−AP 30d",
      base: caixaAtual + arNext30 - apNext30,
      value: apNext30,
      total: caixaAtual + arNext30 - apNext30,
      kind: "negative",
    },
    {
      label: "Caixa Prev.",
      base: Math.min(caixaPrevisto, 0),
      value: Math.abs(caixaPrevisto),
      total: caixaPrevisto,
      kind: "end",
    },
  ];
}

// ── Colors ────────────────────────────────────────────────────────────────────

const COLOR: Record<WaterfallRow["kind"], string> = {
  start:    "hsl(213 70% 55%)",   // blue
  positive: "hsl(160 60% 45%)",   // green
  negative: "hsl(0 70% 58%)",     // red
  end:      "hsl(270 60% 55%)",   // purple
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: WaterfallRow }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const sign =
    row.kind === "positive" ? "+" :
    row.kind === "negative" ? "−" : "";

  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold mb-1">{label ?? row.label}</p>
      <p>
        {sign}
        {fmtBRLFull(row.kind === "negative" ? row.value : row.value)}
      </p>
      {(row.kind === "positive" || row.kind === "negative") && (
        <p className="text-gray-500">
          Saldo: {fmtBRLFull(row.total)}
        </p>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  caixaAtual: number;
  arNext30: number;
  apNext30: number;
}

export function CashWaterfallChart({ caixaAtual, arNext30, apNext30 }: Props) {
  const data = buildWaterfall(caixaAtual, arNext30, apNext30);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={fmtBRL}
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
        <ReferenceLine y={0} stroke="hsl(var(--border))" />

        {/* Invisible base — pushes visible bar to correct position */}
        <Bar dataKey="base" stackId="wf" fill="transparent" isAnimationActive={false} />

        {/* Visible bar — colored by kind */}
        <Bar dataKey="value" stackId="wf" radius={[3, 3, 0, 0]} maxBarSize={56}>
          {data.map((row, i) => (
            <Cell key={i} fill={COLOR[row.kind]} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
