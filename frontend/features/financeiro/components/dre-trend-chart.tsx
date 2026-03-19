"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { DRETrend } from "../services/finance-accounting";
import { fmt, fmtPct } from "../lib/formatters";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DRETrendChartProps {
  data: DRETrend[] | undefined;
  isLoading?: boolean;
}

function shortMonth(m: string) {
  const [y, mo] = m.split("-");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[parseInt(mo, 10) - 1]}/${y.slice(2)}`;
}

export function DRETrendChart({ data, isLoading }: DRETrendChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[280px] w-full rounded-xl" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
        Sem histórico disponível.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    month: shortMonth(d.month),
    receita: d.receitaBruta,
    ebitda: d.ebitda,
    lucro: d.lucroLiquido,
    margem: d.ebitdaMargin,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradEbitda" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradLucro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip
          formatter={(value: number | undefined, name: string | undefined) => {
            const v = value ?? 0;
            const n = name ?? "";
            if (n === "margem") return [`${fmtPct(v)}`, "Margem EBITDA"] as [string, string];
            return [fmt(v), n === "receita" ? "Receita Bruta" : n === "ebitda" ? "EBITDA" : "Lucro Líquido"] as [string, string];
          }}
          contentStyle={{
            fontSize: 12,
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--background)",
          }}
        />
        <Legend
          formatter={(v) => v === "receita" ? "Receita Bruta" : v === "ebitda" ? "EBITDA" : "Lucro Líquido"}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Area type="monotone" dataKey="receita" stroke="#10b981" fill="url(#gradReceita)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="ebitda" stroke="#8b5cf6" fill="url(#gradEbitda)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="lucro" stroke="#3b82f6" fill="url(#gradLucro)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
