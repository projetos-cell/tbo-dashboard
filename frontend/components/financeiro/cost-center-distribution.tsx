"use client";

import { useMemo } from "react";
import { useFinanceChartData, useFinanceCostCenters } from "@/hooks/use-finance";
import type { FinanceFilters } from "@/services/finance";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, Layers } from "lucide-react";

const COLORS = [
  "#6366f1", "#f59e0b", "#ef4444", "#3b82f6", "#22c55e",
  "#ec4899", "#14b8a6", "#f97316", "#8b5cf6", "#84cc16",
];

const fmtFull = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface CostCenterDistributionProps {
  filters: Omit<FinanceFilters, "page" | "pageSize" | "search" | "type" | "typeIn">;
}

export function CostCenterDistribution({ filters }: CostCenterDistributionProps) {
  // Show only despesas to reflect cost allocation
  const chartFilters: Omit<FinanceFilters, "page" | "pageSize" | "search"> = {
    ...filters,
    type: "despesa",
  };

  const { data: transactions, isLoading, isError, refetch } = useFinanceChartData(chartFilters);
  const { data: costCenters } = useFinanceCostCenters();

  const chartData = useMemo(() => {
    if (!transactions?.length) return [];

    const ccMap = new Map<string, number>();
    for (const t of transactions) {
      const key = t.cost_center_id ?? "__sem_cc__";
      ccMap.set(key, (ccMap.get(key) ?? 0) + Math.abs(t.paid_amount || t.amount || 0));
    }

    const ccLookup = new Map(costCenters?.map((cc) => [cc.id, cc.name]) ?? []);

    return Array.from(ccMap.entries())
      .map(([id, value]) => ({
        name: id === "__sem_cc__" ? "Sem centro" : (ccLookup.get(id) ?? "Desconhecido"),
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions, costCenters]);

  if (isLoading) {
    return <Skeleton className="h-[220px] w-full rounded-lg" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <p className="text-sm">Erro ao carregar centros de custo</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-muted-foreground">
        <Layers className="h-8 w-8" />
        <p className="text-sm font-medium">Sem despesas no período</p>
        <p className="text-xs">Ajuste o filtro de data para ver distribuição</p>
      </div>
    );
  }

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={52}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number | undefined) => [
            `${fmtFull(v ?? 0)} (${(((v ?? 0) / total) * 100).toFixed(1)}%)`,
          ]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, lineHeight: "18px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
