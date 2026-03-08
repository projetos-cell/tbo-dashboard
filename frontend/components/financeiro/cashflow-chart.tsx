"use client";

import { useFinanceCashFlowProjection, useFinanceSnapshots } from "@/hooks/use-finance";
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
import { AlertCircle, TrendingUp } from "lucide-react";

const fmtCompact = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);

const fmtFull = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

/** Shows projected cash flow for next 30d (used in Títulos section) */
export function CashflowProjectionChart() {
  const { data, isLoading, isError, refetch } = useFinanceCashFlowProjection(30);

  if (isLoading) {
    return <Skeleton className="h-[220px] w-full rounded-lg" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <p className="text-sm">Erro ao carregar projeção</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const hasData = data && data.some((p) => p.inflow > 0 || p.outflow > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-muted-foreground">
        <TrendingUp className="h-8 w-8" />
        <p className="text-sm font-medium">Sem títulos previstos</p>
        <p className="text-xs">Sincronize os dados do Omie para ver projeção</p>
      </div>
    );
  }

  const chartData = (data ?? [])
    .filter((_, i) => i % 2 === 0 || (data?.length ?? 0) <= 15)
    .map((p) => ({
      label: p.label,
      Entradas: p.inflow,
      Saídas: p.outflow,
      Saldo: p.balance,
    }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="cfIn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cfOut" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis tickFormatter={fmtCompact} tick={{ fontSize: 10 }} width={72} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any, name: any) => [fmtFull(v ?? 0), name]}
          labelStyle={{ fontWeight: 600 }}
        />
        <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="4 4" />
        <Area
          type="monotone"
          dataKey="Entradas"
          stroke="#22c55e"
          fill="url(#cfIn)"
          strokeWidth={2}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="Saídas"
          stroke="#ef4444"
          fill="url(#cfOut)"
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Shows historical daily balance from snapshots (used in Movimentações section) */
export function SaldoDiarioChart({ days = 90 }: { days?: number }) {
  const { data, isLoading, isError, refetch } = useFinanceSnapshots(days);

  if (isLoading) {
    return <Skeleton className="h-[220px] w-full rounded-lg" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <p className="text-sm">Erro ao carregar histórico</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-muted-foreground">
        <TrendingUp className="h-8 w-8" />
        <p className="text-sm font-medium">Histórico indisponível</p>
        <p className="text-xs">Sincronize para acumular snapshots diários</p>
      </div>
    );
  }

  const chartData = data.map((s) => {
    const d = new Date(s.snapshot_date + "T00:00:00");
    return {
      label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      Saldo: s.saldo_acumulado,
      Receitas: s.total_receitas,
      Despesas: s.total_despesas,
    };
  });

  const stride = Math.max(1, Math.floor(chartData.length / 12));
  const filtered = chartData.filter((_, i) => i % stride === 0 || i === chartData.length - 1);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={filtered} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="saldoGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis tickFormatter={fmtCompact} tick={{ fontSize: 10 }} width={72} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any, name: any) => [fmtFull(v ?? 0), name]}
          labelStyle={{ fontWeight: 600 }}
        />
        <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="4 4" />
        <Area
          type="monotone"
          dataKey="Saldo"
          stroke="#6366f1"
          fill="url(#saldoGrad)"
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
