"use client";

import { useMemo } from "react";
import { useFinanceChartData, useFinanceCategories } from "@/features/financeiro/hooks/use-finance";
import type { FinanceFilters } from "@/features/financeiro/services";
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
import { AlertCircle, Tag } from "lucide-react";

const COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6",
  "#ec4899", "#14b8a6", "#f97316", "#8b5cf6", "#84cc16",
];

const fmtFull = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface CategoryDonutProps {
  transactionType: "receita" | "despesa";
  filters: Omit<FinanceFilters, "page" | "pageSize" | "search" | "type" | "typeIn">;
}

export function CategoryDonut({ transactionType, filters }: CategoryDonutProps) {
  const chartFilters: Omit<FinanceFilters, "page" | "pageSize" | "search"> = {
    ...filters,
    type: transactionType,
  };

  const { data: transactions, isLoading, isError, refetch } = useFinanceChartData(chartFilters);
  const { data: categories } = useFinanceCategories();

  const chartData = useMemo(() => {
    if (!transactions?.length) return [];

    const catMap = new Map<string, number>();
    for (const t of transactions) {
      const key = t.category_id ?? "__sem_categoria__";
      catMap.set(key, (catMap.get(key) ?? 0) + Math.abs(t.paid_amount || t.amount || 0));
    }

    const catLookup = new Map(categories?.map((c) => [c.id, c.name]) ?? []);

    return Array.from(catMap.entries())
      .map(([id, value]) => ({
        name: id === "__sem_categoria__" ? "Sem categoria" : (catLookup.get(id) ?? "Desconhecida"),
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [transactions, categories]);

  if (isLoading) {
    return <Skeleton className="h-[220px] w-full rounded-lg" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-red-500">
        <AlertCircle className="h-6 w-6" />
        <p className="text-sm">Erro ao carregar categorias</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-gray-500">
        <Tag className="h-8 w-8" />
        <p className="text-sm font-medium">Sem transações no período</p>
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
