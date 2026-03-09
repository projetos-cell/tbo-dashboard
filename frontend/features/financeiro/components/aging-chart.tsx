"use client";

import { useFinanceAging } from "@/features/financeiro/hooks/use-finance";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock } from "lucide-react";

const fmtCompact = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);

const fmtFull = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export function AgingChart() {
  const { data, isLoading, isError, refetch } = useFinanceAging();

  if (isLoading) {
    return <Skeleton className="h-[220px] w-full rounded-lg" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-red-500">
        <AlertCircle className="h-6 w-6" />
        <p className="text-sm">Erro ao carregar inadimplência</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const hasBuckets = data?.buckets.some((b) => b.ar > 0 || b.ap > 0);

  if (!hasBuckets) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-gray-500">
        <Clock className="h-8 w-8" />
        <p className="text-sm font-medium">Nenhum título em atraso</p>
        <p className="text-xs">Todos os títulos estão em dia</p>
      </div>
    );
  }

  const chartData = data!.buckets
    .filter((b) => b.ar > 0 || b.ap > 0)
    .map((b) => ({
      bucket: b.label,
      "A Receber": b.ar,
      "A Pagar": b.ap,
    }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={fmtCompact} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="bucket" width={84} tick={{ fontSize: 11 }} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any, name: any) => [fmtFull(v ?? 0), name]}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="A Receber" fill="#22c55e" radius={[0, 4, 4, 0]} maxBarSize={20} />
        <Bar dataKey="A Pagar" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
