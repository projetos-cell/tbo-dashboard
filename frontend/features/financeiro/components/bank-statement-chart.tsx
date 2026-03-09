"use client";

import {
  useBankStatementCashFlow,
  useLatestBankBalance,
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
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Landmark } from "lucide-react";

const fmtCompact = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);

const fmtFull = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

/** Shows real cash flow from bank statements (Omie extrato) */
export function BankStatementCashFlowChart({ days = 90 }: { days?: number }) {
  const dateFrom = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const dateTo = new Date().toISOString().slice(0, 10);

  const { data, isLoading, isError, refetch } = useBankStatementCashFlow(dateFrom, dateTo);
  const { data: latestBalance } = useLatestBankBalance();

  if (isLoading) {
    return <Skeleton className="h-[260px] w-full rounded-lg" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] gap-2 text-red-500">
        <AlertCircle className="h-6 w-6" />
        <p className="text-sm">Erro ao carregar extrato</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] gap-2 text-gray-500">
        <Landmark className="h-8 w-8" />
        <p className="text-sm font-medium">Sem dados de extrato bancário</p>
        <p className="text-xs">Sincronize o Omie para importar movimentações</p>
      </div>
    );
  }

  // Thin out dense series
  const stride = Math.max(1, Math.floor(data.length / 20));
  const chartData = data
    .filter((_, i) => i % stride === 0 || i === data.length - 1)
    .map((p) => ({
      label: p.label,
      Entradas: p.inflow,
      Saídas: p.outflow,
      Saldo: p.balance,
    }));

  return (
    <div className="flex flex-col gap-1">
      {/* Real balance badge */}
      {latestBalance && (
        <div className="flex items-center justify-end gap-2">
          <Badge variant="outline" className="text-xs font-normal gap-1">
            <Landmark className="h-3 w-3" />
            Saldo real: {fmtCompact(latestBalance.balance)}
          </Badge>
        </div>
      )}

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="bsInGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="bsOutGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="bsBalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
            fill="url(#bsInGrad)"
            strokeWidth={1.5}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="Saídas"
            stroke="#ef4444"
            fill="url(#bsOutGrad)"
            strokeWidth={1.5}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="Saldo"
            stroke="#8b5cf6"
            fill="url(#bsBalGrad)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
