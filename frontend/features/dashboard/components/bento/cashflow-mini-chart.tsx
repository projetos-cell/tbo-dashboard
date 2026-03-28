"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { CashFlowPoint } from "@/features/financeiro/services/finance-types";

function fmtCompact(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return v.toFixed(0);
}

interface CashFlowMiniChartProps {
  data: CashFlowPoint[];
}

export function CashFlowMiniChart({ data }: CashFlowMiniChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        Sem dados de projecao
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Cash Flow — 30 dias</p>
          <p className="text-xs text-muted-foreground">Projecao de saldo</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">
            R$ {fmtCompact(data[data.length - 1]?.balance ?? 0)}
          </p>
          <p className="text-[10px] text-muted-foreground">saldo final</p>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              className="fill-muted-foreground"
            />
            <YAxis
              tickFormatter={(v) => fmtCompact(v)}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={40}
              className="fill-muted-foreground"
            />
            <Tooltip
              formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Saldo"]}
              contentStyle={{
                borderRadius: 8,
                fontSize: 12,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#balanceGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
