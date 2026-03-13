"use client";

import { useState } from "react";
import {
  useFinanceCashFlowProjection,
  useFounderKPIs,
} from "@/features/financeiro/hooks/use-finance";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { IconAlertCircle, IconTrendingUp } from "@tabler/icons-react";

const fmtCompact = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);

const fmtFull = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

type Days = 30 | 60 | 90;

/** Fluxo de caixa projetado com toggle 30/60/90d e linha de burn rate */
export function CashFlowFullChart() {
  const [days, setDays] = useState<Days>(30);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useFinanceCashFlowProjection(days);

  const { data: kpis } = useFounderKPIs();
  const threshold = kpis?.despesaMTD ?? 0;

  if (isLoading) {
    return <Skeleton className="h-[260px] w-full rounded-lg" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] gap-2 text-red-500">
        <IconAlertCircle className="h-6 w-6" />
        <p className="text-sm">Erro ao carregar projeção</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const hasData = data && data.some((p) => p.inflow > 0 || p.outflow > 0 || p.balance !== 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] gap-2 text-gray-500">
        <IconTrendingUp className="h-8 w-8" />
        <p className="text-sm font-medium">Sem títulos previstos</p>
        <p className="text-xs">Sincronize os dados do Omie para ver projeção</p>
      </div>
    );
  }

  // Thin out dense series: show at most ~20 ticks
  const stride = Math.max(1, Math.floor((data?.length ?? 0) / 20));
  const chartData = (data ?? [])
    .filter((_, i) => i % stride === 0 || i === (data?.length ?? 0) - 1)
    .map((p) => ({
      label: p.label,
      Saldo: p.balance,
      Entradas: p.inflow,
      Saídas: p.outflow,
    }));

  const DAY_OPTIONS: Days[] = [30, 60, 90];

  return (
    <div className="flex flex-col gap-1">
      {/* Toggle */}
      <div className="flex gap-1 justify-end">
        {DAY_OPTIONS.map((d) => (
          <Button
            key={d}
            variant={days === d ? "secondary" : "ghost"}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setDays(d)}
          >
            {d}d
          </Button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="cfSaldoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tickFormatter={fmtCompact} tick={{ fontSize: 10 }} width={72} />

          <Tooltip
            formatter={(v: number | undefined, name: string | undefined) => [fmtFull(v ?? 0), name ?? ""]}
            labelStyle={{ fontWeight: 600 }}
          />

          {/* Zero line */}
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="4 4" />

          {/* Burn rate threshold */}
          {threshold > 0 && (
            <ReferenceLine
              y={threshold}
              stroke="#ef4444"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{
                value: `Burn: ${fmtCompact(threshold)}`,
                position: "insideTopRight",
                fontSize: 10,
                fill: "#ef4444",
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="Saldo"
            stroke="#6366f1"
            fill="url(#cfSaldoGrad)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
