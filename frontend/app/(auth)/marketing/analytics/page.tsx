"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconChartBar,
  IconFilter,
  IconTargetArrow,
  IconFileText,
  IconArrowRight,
  IconTrendingUp,
  IconUsers,
  IconCurrencyDollar,
  IconArrowUpRight,
  IconArrowDownRight,
  IconMinus,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useMarketingKPIs } from "@/features/marketing/hooks/use-marketing-analytics";
import type { MarketingKPI } from "@/features/marketing/types/marketing";

// ─── Types ─────────────────────────────────────────────────────────

type Period = "mes_atual" | "30d" | "trimestre" | "custom";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "mes_atual", label: "Mês atual" },
  { value: "30d", label: "Últimos 30d" },
  { value: "trimestre", label: "Trimestre" },
  { value: "custom", label: "Personalizado" },
];

// ─── KPI Card ──────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  change_pct,
  icon: Icon,
  color,
  isLoading,
}: {
  label: string;
  value: string;
  change_pct: number | null;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-14" />
      </div>
    );
  }

  const TrendIcon =
    change_pct == null
      ? null
      : change_pct > 0
        ? IconArrowUpRight
        : change_pct < 0
          ? IconArrowDownRight
          : IconMinus;

  const trendColor =
    change_pct == null
      ? "text-muted-foreground"
      : change_pct > 0
        ? "text-green-500"
        : change_pct < 0
          ? "text-red-500"
          : "text-muted-foreground";

  return (
    <div className="rounded-lg border bg-card p-4 space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="size-4" style={{ color }} />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {TrendIcon && change_pct !== null && (
        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
          <TrendIcon className="size-3" />
          <span>{Math.abs(change_pct).toFixed(1)}% vs período anterior</span>
        </div>
      )}
      {change_pct == null && (
        <p className="text-xs text-muted-foreground">Sem dados anteriores</p>
      )}
    </div>
  );
}

// ─── KPI Config ────────────────────────────────────────────────────

const KPI_CONFIG: {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  format: (v: number) => string;
}[] = [
  {
    key: "leads",
    label: "Leads gerados",
    icon: IconUsers,
    color: "#3b82f6",
    format: (v) => v.toLocaleString("pt-BR"),
  },
  {
    key: "opportunities",
    label: "Oportunidades",
    icon: IconTrendingUp,
    color: "#8b5cf6",
    format: (v) => v.toLocaleString("pt-BR"),
  },
  {
    key: "revenue",
    label: "Receita gerada",
    icon: IconCurrencyDollar,
    color: "#22c55e",
    format: (v) => `R$ ${(v / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`,
  },
  {
    key: "cac",
    label: "CAC",
    icon: IconCurrencyDollar,
    color: "#f59e0b",
    format: (v) => `R$ ${(v / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`,
  },
  {
    key: "roi",
    label: "ROI",
    icon: IconChartBar,
    color: "#ec4899",
    format: (v) => `${v.toFixed(1)}x`,
  },
];

const SECTIONS = [
  {
    href: "/marketing/analytics/funil",
    label: "Funil",
    description: "CRM → Comercial: conversão por etapa",
    icon: IconFilter,
    color: "#8b5cf6",
    bgClass: "bg-purple-500/10",
  },
  {
    href: "/marketing/analytics/attribution",
    label: "Atribuição",
    description: "Canal → Lead → Venda: atribuição de receita",
    icon: IconTargetArrow,
    color: "#3b82f6",
    bgClass: "bg-blue-500/10",
  },
  {
    href: "/marketing/analytics/relatorios",
    label: "Relatórios",
    description: "Relatórios comparativos e exportação",
    icon: IconFileText,
    color: "#f59e0b",
    bgClass: "bg-amber-500/10",
  },
] as const;

// ─── Main Content ──────────────────────────────────────────────────

function findKpi(kpis: MarketingKPI[] | undefined, key: string): MarketingKPI | undefined {
  return kpis?.find((k) => k.label === key);
}

function AnalyticsContent() {
  const [period, setPeriod] = useState<Period>("mes_atual");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const apiPeriod =
    period === "custom" ? `custom:${customStart}:${customEnd}` : period;

  const { data: kpis, isLoading, error, refetch } = useMarketingKPIs(apiPeriod);

  return (
    <div className="space-y-6">
      {/* Header + Period Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics de Marketing</h1>
          <p className="text-sm text-muted-foreground">
            Dashboard consolidado com métricas de marketing, funil e atribuição.
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PERIOD_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={period === opt.value ? "default" : "outline"}
              onClick={() => setPeriod(opt.value)}
              className="h-7 text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom date range */}
      {period === "custom" && (
        <div className="flex items-end gap-3 p-3 rounded-lg border bg-muted/20">
          <div className="space-y-1">
            <Label className="text-xs">De</Label>
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-7 text-xs w-36"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Até</Label>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-7 text-xs w-36"
            />
          </div>
        </div>
      )}

      {/* Feature #72 — Error state */}
      {error && (
        <ErrorState message="Erro ao carregar métricas de analytics." onRetry={() => refetch()} />
      )}

      {/* KPI Cards — #51 */}
      {!error && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {KPI_CONFIG.map((cfg) => {
            const kpi = findKpi(kpis, cfg.key);
            return (
              <KPICard
                key={cfg.key}
                label={cfg.label}
                value={cfg.format(kpi?.value ?? 0)}
                change_pct={kpi?.change_pct ?? null}
                icon={cfg.icon}
                color={cfg.color}
                isLoading={isLoading}
              />
            );
          })}
        </div>
      )}

      {/* Feature #72 — Empty state: sem dados após load */}
      {!isLoading && !error && kpis?.length === 0 && (
        <EmptyState
          icon={IconChartBar}
          title="Sem dados de analytics"
          description="Nenhuma métrica encontrada para o período selecionado."
        />
      )}

      {/* Sub-module navigation */}
      <div className="grid gap-4 sm:grid-cols-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="group">
              <Card className="h-full transition-colors group-hover:border-indigo-400/40">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2.5 ${s.bgClass}`}>
                      <Icon className="size-5" style={{ color: s.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{s.label}</p>
                    </div>
                    <IconArrowRight className="size-4 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <RequireRole module="marketing" minRole="diretoria">
      <AnalyticsContent />
    </RequireRole>
  );
}
