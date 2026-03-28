"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconCurrencyDollar,
  IconChartBar,
  IconClock,
  IconTarget,
  IconBriefcase,
} from "@tabler/icons-react";
import { useUnitEconomics } from "../hooks/use-reports";
import type { UnitEconomics } from "../services/unit-economics";

// ── Benchmarks ────────────────────────────────────────────────────────────────

const BENCHMARKS = {
  ltv_cac_ratio: { good: 3, excellent: 5 },
  payback_period_months: { good: 12, excellent: 6 },
  revenue_per_employee: { good: 200000, excellent: 400000 },
};

function getBenchmarkStatus(
  key: keyof typeof BENCHMARKS,
  value: number
): "excellent" | "good" | "warning" | "unknown" {
  const b = BENCHMARKS[key];
  if (!b) return "unknown";
  const isLowerBetter = key === "payback_period_months";
  if (isLowerBetter) {
    if (value <= b.excellent) return "excellent";
    if (value <= b.good) return "good";
    return "warning";
  }
  if (value >= b.excellent) return "excellent";
  if (value >= b.good) return "good";
  return "warning";
}

const STATUS_COLORS = {
  excellent: "text-emerald-600",
  good: "text-blue-600",
  warning: "text-amber-600",
  unknown: "text-muted-foreground",
};

const STATUS_LABELS = {
  excellent: "Excelente",
  good: "Bom",
  warning: "Atenção",
  unknown: "—",
};

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ color = "#18181B" }: { color?: string }) {
  // Simulated sparkline data — in production, pass real time series
  const data = [40, 45, 38, 52, 60, 55, 65, 70, 68, 75, 72, 80].map((v) => ({ v }));
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          fill={`${color}20`}
          strokeWidth={1.5}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Metric Card ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  benchmarkKey?: keyof typeof BENCHMARKS;
  benchmarkValue?: number;
  trend?: "up" | "down" | "neutral";
  sparklineColor?: string;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  benchmarkKey,
  benchmarkValue,
  trend,
  sparklineColor = "#18181B",
}: MetricCardProps) {
  const benchStatus =
    benchmarkKey !== undefined && benchmarkValue !== undefined
      ? getBenchmarkStatus(benchmarkKey, benchmarkValue)
      : null;

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-muted p-1.5">{icon}</div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          {benchStatus && (
            <Badge
              variant="outline"
              className={`text-xs ${STATUS_COLORS[benchStatus]}`}
            >
              {STATUS_LABELS[benchStatus]}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {trend && (
            <div
              className={
                trend === "up"
                  ? "text-emerald-600"
                  : trend === "down"
                  ? "text-red-500"
                  : "text-muted-foreground"
              }
            >
              {trend === "up" ? (
                <IconTrendingUp className="h-5 w-5" />
              ) : trend === "down" ? (
                <IconTrendingDown className="h-5 w-5" />
              ) : null}
            </div>
          )}
        </div>
        <Sparkline color={sparklineColor} />
      </CardContent>
    </Card>
  );
}

// ── Summary Strip ─────────────────────────────────────────────────────────────

function SummaryStrip({ data }: { data: UnitEconomics }) {
  const margin_pct =
    data.total_revenue > 0
      ? (data.gross_profit / data.total_revenue) * 100
      : 0;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Receita Total</p>
            <p className="text-sm font-semibold">
              {data.total_revenue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <p className="text-xs text-muted-foreground">Lucro Bruto</p>
            <p className="text-sm font-semibold">
              {data.gross_profit.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <p className="text-xs text-muted-foreground">Margem</p>
            <p className="text-sm font-semibold">{margin_pct.toFixed(1)}%</p>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <p className="text-xs text-muted-foreground">Headcount</p>
            <p className="text-sm font-semibold">{data.headcount} pessoas</p>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <p className="text-xs text-muted-foreground">Novos Clientes</p>
            <p className="text-sm font-semibold">{data.new_clients_period}</p>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <p className="text-xs text-muted-foreground">Gasto Marketing</p>
            <p className="text-sm font-semibold">
              {data.marketing_spend.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function UnitEconomicsDashboard() {
  const { data, isLoading, error, refetch } = useUnitEconomics();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Erro ao calcular unit economics.
        </CardContent>
      </Card>
    );
  }

  const fmt = (n: number, currency = false) =>
    n.toLocaleString("pt-BR", currency ? { style: "currency", currency: "BRL", maximumFractionDigits: 0 } : { maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <SummaryStrip data={data} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="CAC"
          value={fmt(data.cac, true)}
          subtitle="Custo de Aquisição por Cliente"
          icon={<IconCurrencyDollar className="h-4 w-4" />}
          trend={data.cac < 5000 ? "up" : "down"}
          sparklineColor="#3b82f6"
        />

        <MetricCard
          title="LTV"
          value={fmt(data.ltv, true)}
          subtitle="Lifetime Value estimado"
          icon={<IconTarget className="h-4 w-4" />}
          trend="up"
          sparklineColor="#10b981"
        />

        <MetricCard
          title="LTV / CAC"
          value={`${data.ltv_cac_ratio.toFixed(2)}x`}
          subtitle={`Meta: ≥ 3x`}
          icon={<IconChartBar className="h-4 w-4" />}
          benchmarkKey="ltv_cac_ratio"
          benchmarkValue={data.ltv_cac_ratio}
          trend={data.ltv_cac_ratio >= 3 ? "up" : "down"}
          sparklineColor={data.ltv_cac_ratio >= 3 ? "#10b981" : "#f59e0b"}
        />

        <MetricCard
          title="Payback"
          value={`${data.payback_period_months.toFixed(1)} meses`}
          subtitle="Tempo para recuperar CAC"
          icon={<IconClock className="h-4 w-4" />}
          benchmarkKey="payback_period_months"
          benchmarkValue={data.payback_period_months}
          trend={data.payback_period_months <= 12 ? "up" : "down"}
          sparklineColor={data.payback_period_months <= 12 ? "#10b981" : "#ef4444"}
        />

        <MetricCard
          title="Receita / Pessoa"
          value={fmt(data.revenue_per_employee, true)}
          subtitle="Receita por colaborador ativo"
          icon={<IconUsers className="h-4 w-4" />}
          benchmarkKey="revenue_per_employee"
          benchmarkValue={data.revenue_per_employee}
          trend={data.revenue_per_employee >= 200000 ? "up" : "down"}
          sparklineColor="#8b5cf6"
        />

        <MetricCard
          title="Lucro / Pessoa"
          value={fmt(data.profit_per_employee, true)}
          subtitle="Resultado por colaborador ativo"
          icon={<IconBriefcase className="h-4 w-4" />}
          trend={data.profit_per_employee > 0 ? "up" : "down"}
          sparklineColor={data.profit_per_employee > 0 ? "#10b981" : "#ef4444"}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Calculado em {new Date(data.computed_at).toLocaleString("pt-BR")} com dados do ano corrente.
      </p>
    </div>
  );
}
