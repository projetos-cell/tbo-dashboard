"use client";

import { useState, useMemo } from "react";
import { useFinanceChartData } from "@/features/financeiro/hooks/use-finance";
import type { FinanceFilters } from "@/features/financeiro/services";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconAlertCircle, IconChartBar, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { AgingChart } from "./aging-chart";
import { CategoryDonut } from "./category-donut";
import { SaldoDiarioChart } from "./cashflow-chart";
import { CashFlowFullChart } from "./cashflow-full-chart";
import { BankStatementCashFlowChart } from "./bank-statement-chart";
import { CostCenterDistribution } from "./cost-center-distribution";

const fmtCompact = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);

const fmtFull = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

// ISO week key: "YYYY-WW"
function isoWeekKey(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-S${String(week).padStart(2, "0")}`;
}

interface WeeklyChartProps {
  filters: Omit<FinanceFilters, "page" | "pageSize" | "search" | "type" | "typeIn">;
}

function WeeklySummaryChart({ filters }: WeeklyChartProps) {
  const chartFilters: Omit<FinanceFilters, "page" | "pageSize" | "search"> = {
    ...filters,
    statusIn: ["pago", "liquidado", "parcial"],
  };

  const { data: transactions, isLoading, isError, refetch } = useFinanceChartData(chartFilters);

  const chartData = useMemo(() => {
    if (!transactions?.length) return [];

    const weekMap = new Map<string, { Entradas: number; Saídas: number }>();
    for (const t of transactions) {
      const key = isoWeekKey(t.date);
      const entry = weekMap.get(key) ?? { Entradas: 0, Saídas: 0 };
      const amt = Math.abs(t.paid_amount || t.amount || 0);
      if (t.type === "receita") entry.Entradas += amt;
      else if (t.type === "despesa") entry.Saídas += amt;
      weekMap.set(key, entry);
    }

    return Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([week, vals]) => ({ semana: week.replace(/^\d{4}-/, ""), ...vals }));
  }, [transactions]);

  if (isLoading) return <Skeleton className="h-[220px] w-full rounded-lg" />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-red-500">
        <IconAlertCircle className="h-6 w-6" />
        <p className="text-sm">Erro ao carregar dados semanais</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] gap-2 text-gray-500">
        <IconChartBar className="h-8 w-8" />
        <p className="text-sm font-medium">Sem movimentações pagas no período</p>
        <p className="text-xs">Ajuste o filtro de data para ver comparativo semanal</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="semana" tick={{ fontSize: 10 }} />
        <YAxis tickFormatter={fmtCompact} tick={{ fontSize: 10 }} width={68} />
        <Tooltip
          formatter={(v: number | undefined, name: string | undefined) => [fmtFull(v ?? 0), name ?? ""]}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Entradas" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface FinanceChartsPanelProps {
  section: "titulos" | "movimentacoes";
  filters: Omit<FinanceFilters, "page" | "pageSize" | "search" | "type" | "typeIn">;
}

export function FinanceChartsPanel({ section, filters }: FinanceChartsPanelProps) {
  const [open, setOpen] = useState(true);

  const titulosCharts = [
    {
      title: "Inadimplência por faixa",
      description: "AR e AP em atraso",
      node: <AgingChart />,
    },
    {
      title: "Receitas por categoria",
      description: "Distribuição no período",
      node: <CategoryDonut transactionType="receita" filters={filters} />,
    },
    {
      title: "Fluxo de caixa projetado",
      description: "Saldo acumulado projetado com burn rate",
      node: <CashFlowFullChart />,
    },
  ];

  const movimentacoesCharts = [
    {
      title: "Extrato bancário real",
      description: "Entradas, saídas e saldo do Omie",
      node: <BankStatementCashFlowChart days={90} />,
    },
    {
      title: "Saldo histórico (snapshots)",
      description: "Últimos 90 dias",
      node: <SaldoDiarioChart days={90} />,
    },
    {
      title: "Despesas por categoria",
      description: "Distribuição no período",
      node: <CategoryDonut transactionType="despesa" filters={filters} />,
    },
    {
      title: "Entradas vs Saídas por semana",
      description: "Movimentações pagas",
      node: <WeeklySummaryChart filters={filters} />,
    },
    {
      title: "Despesas por centro de custo",
      description: "Distribuição no período",
      node: <CostCenterDistribution filters={filters} />,
    },
  ];

  const charts = section === "titulos" ? titulosCharts : movimentacoesCharts;

  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        size="sm"
        className="mb-2 h-8 gap-1.5 text-gray-500 hover:text-gray-900"
        onClick={() => setOpen((p) => !p)}
      >
        <IconChartBar className="h-4 w-4" />
        <span>Análise visual</span>
        {open ? <IconChevronUp className="h-3.5 w-3.5" /> : <IconChevronDown className="h-3.5 w-3.5" />}
      </Button>

      {open && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {charts.map((c) => (
            <Card key={c.title} className="overflow-hidden">
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
                <p className="text-xs text-gray-500">{c.description}</p>
              </CardHeader>
              <CardContent className="px-2 pb-2">{c.node}</CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
