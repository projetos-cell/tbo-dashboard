"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import { useFounderDashboard } from "@/hooks/use-founder-dashboard";
import { PeriodFilter, type PeriodValue } from "@/components/founder-dashboard/period-filter";
import {
  TrendingUp,
  BarChart3,
  ShieldAlert,
  Wallet,
  Flame,
  Scale,
  Calculator,
} from "lucide-react";

import { KpiCard } from "@/components/founder-dashboard/kpi-card";
import { KpiGrid } from "@/components/founder-dashboard/kpi-grid";
import { UnitRevenueTable } from "@/components/founder-dashboard/unit-revenue-table";
import { TopProjectsTable } from "@/components/founder-dashboard/top-projects-table";
import { RevenueConcentration } from "@/components/founder-dashboard/revenue-concentration";
import { FounderAlerts } from "@/components/founder-dashboard/founder-alerts";
import { ForecastPanel } from "@/components/founder-dashboard/forecast-panel";
import type { KpiTooltipContent } from "@/components/founder-dashboard/kpi-card";
import { CashBalanceInput } from "@/components/founder-dashboard/cash-balance-input";
import dynamic from "next/dynamic";

const MonthlyTrendChart = dynamic(
  () =>
    import("@/components/founder-dashboard/monthly-trend-chart").then((m) => ({
      default: m.MonthlyTrendChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] animate-pulse rounded-xl bg-muted" />
    ),
  }
);

const CashWaterfallChart = dynamic(
  () =>
    import("@/components/founder-dashboard/cash-waterfall-chart").then(
      (m) => ({ default: m.CashWaterfallChart })
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] animate-pulse rounded-xl bg-muted" />
    ),
  }
);

const DreTable = dynamic(
  () =>
    import("@/components/financeiro/dre-table").then((m) => ({
      default: m.DreTable,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
    ),
  }
);

const DreSettingsModal = dynamic(
  () =>
    import("@/components/financeiro/dre-settings-modal").then((m) => ({
      default: m.DreSettingsModal,
    })),
  { ssr: false }
);

const RevenueConcentrationChart = dynamic(
  () =>
    import("@/components/financeiro/revenue-concentration-chart").then(
      (m) => ({ default: m.RevenueConcentrationChart })
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] animate-pulse rounded-xl bg-muted" />
    ),
  }
);
import { useFinanceDRE, useRevenueConcentrationByClient, useDreSettings } from "@/hooks/use-finance";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

function fmtMonths(value: number): string {
  return `${value.toFixed(1)} meses`;
}

// ── Tooltip content (from spec) ──────────────────────────────────────────────

const TOOLTIP_RECEITA: KpiTooltipContent = {
  description: "Soma de todas as receitas recebidas (baixadas) no mês atual.",
  formula: undefined,
  enters: "Títulos baixados no período (status pago).",
  notEnters: "Faturado sem recebimento, propostas em aberto.",
  source: "Omie — Contas a Receber (baixados)",
};

const TOOLTIP_MARGEM: KpiTooltipContent = {
  description: "Lucro real após custos diretos de projetos/produção.",
  formula: "Receita Realizada - Custos Diretos Pagos",
  enters: "Despesas de projetos e produção (pagos).",
  notEnters: "Custo fixo (folha, softwares, infra).",
  source: "Omie — AP + classificação de custos",
};

const TOOLTIP_RUNWAY: KpiTooltipContent = {
  description: "Quantos meses a empresa sobrevive com o caixa atual, sem novas receitas.",
  formula: "Caixa Atual / Burn Rate",
  enters: undefined,
  notEnters: undefined,
  source: "Caixa Real (manual) / Burn Rate (Omie)",
};

const TOOLTIP_CAIXA: KpiTooltipContent = {
  description: "Saldo consolidado de todas as contas bancárias hoje.",
  formula: undefined,
  enters: "Contas bancárias cadastradas no Omie.",
  notEnters: undefined,
  source: "Caixa Real (entrada manual) · Omie (fallback automático)",
};

const TOOLTIP_BURN: KpiTooltipContent = {
  description: "Média mensal de gastos totais nos últimos 3 meses.",
  formula: "Média de despesas pagas (últimos 3 meses)",
  enters: undefined,
  notEnters: undefined,
  source: "Omie — Contas a Pagar (baixadas)",
};

const TOOLTIP_BREAKEVEN: KpiTooltipContent = {
  description: "Receita mínima mensal para cobrir todos os custos (fixos + variáveis).",
  formula: "Custos Fixos + Custos Variáveis médios",
  enters: "Folha, softwares, infra, custos variáveis.",
  notEnters: undefined,
  source: "Omie — AP + centros de custo",
};

const TOOLTIP_CAIXA_PREVISTO: KpiTooltipContent = {
  description: "Projeção de caixa para os próximos 30 dias.",
  formula: "Caixa Atual + A Receber(30d) - A Pagar(30d)",
  enters: undefined,
  notEnters: undefined,
  source: "Caixa Real (manual) + AR/AP Omie (30d)",
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FinanceiroFounderPage() {
  const role = useAuthStore((s) => s.role);
  const router = useRouter();
  const [period, setPeriod] = useState<PeriodValue>({ preset: "mtd" });
  const [manualCaixa, setManualCaixa] = useState<number | null>(null);
  const [dreSettingsOpen, setDreSettingsOpen] = useState(false);

  // ── Melhorias #8 e #9 ────────────────────────────────────────────────────
  const { data: dreData, isLoading: dreLoading } = useFinanceDRE(7);
  const { data: dreSettings } = useDreSettings();
  const { data: concentrationData, isLoading: concentrationLoading } =
    useRevenueConcentrationByClient();

  useEffect(() => {
    if (role && !hasMinRole(role, "diretoria")) {
      router.replace("/financeiro");
    }
  }, [role, router]);

  const { data, isLoading, error, refetch } = useFounderDashboard(period);

  if (!role || !hasMinRole(role, "diretoria")) {
    return null;
  }

  const d = data;
  const errMsg = error ? (error as Error).message : null;

  // ── Effective values — manual cash overrides Omie when available ──────────
  const effectiveCaixa = manualCaixa !== null ? manualCaixa : (d?.caixaAtual ?? 0);
  const effectiveRunway =
    d && d.burnRate > 0 ? effectiveCaixa / d.burnRate : (d?.runway ?? 0);
  const effectiveCaixaPrevisto30d =
    effectiveCaixa + (d?.arNext30 ?? 0) - (d?.apNext30 ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visão Estratégica</h1>
          <p className="text-muted-foreground">
            Dashboard financeiro executivo — dados consolidados do Omie.
          </p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Row 1 — Founder Metrics: Receita MTD | Margem | Caixa Atual | Runway + Caixa Real widget */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Founder Metrics
          </h2>
          {manualCaixa !== null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-300">
              <Wallet className="h-3 w-3" />
              Caixa manual ativo
            </span>
          )}
        </div>
        <div className="flex flex-col xl:flex-row gap-4">
          {/* KPI cards */}
          <div className="flex-1 min-w-0">
            <KpiGrid columns={4}>
              <KpiCard
                title="Receita MTD"
                value={d ? fmt(d.receitaRealizada) : "—"}
                sublabel={d?.periodLabel ? `${d.periodLabel} (pagas)` : "MTD (pagas)"}
                icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
                colorClass="text-emerald-600 dark:text-emerald-400"
                tooltip={TOOLTIP_RECEITA}
                isLoading={isLoading}
                isEmpty={!isLoading && !!d && d.receitaRealizada === 0}
                emptyMessage="Nenhuma receita paga neste período. Verifique a sincronização com o Omie."
                error={errMsg}
                onRetry={() => refetch()}
              />
              <KpiCard
                title="Margem"
                value={d ? `${fmt(d.margemReal)} (${fmtPct(d.margemPct)})` : "—"}
                sublabel="Receita - Custos diretos"
                icon={<BarChart3 className="h-4 w-4 text-blue-500" />}
                colorClass={
                  d && d.margemPct >= 30
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }
                tooltip={TOOLTIP_MARGEM}
                isLoading={isLoading}
                isEmpty={!isLoading && !!d && d.receitaRealizada === 0}
                emptyMessage="Nenhuma receita paga neste período."
                error={errMsg}
                onRetry={() => refetch()}
              />
              <KpiCard
                title="Caixa Atual"
                value={effectiveCaixa}
                sublabel={manualCaixa !== null ? "Entrada manual (Caixa Real)" : "Saldo consolidado"}
                icon={<Wallet className="h-4 w-4 text-violet-500" />}
                colorClass={
                  effectiveCaixa >= 0
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-red-600 dark:text-red-400"
                }
                tooltip={TOOLTIP_CAIXA}
                isLoading={isLoading}
                error={errMsg}
                onRetry={() => refetch()}
              />
              <KpiCard
                title="Runway"
                value={d ? fmtMonths(effectiveRunway) : "—"}
                sublabel="Meses de sobrevivência"
                icon={<ShieldAlert className="h-4 w-4 text-orange-500" />}
                colorClass={
                  effectiveRunway >= 6
                    ? "text-emerald-600 dark:text-emerald-400"
                    : effectiveRunway >= 3
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                }
                tooltip={TOOLTIP_RUNWAY}
                isLoading={isLoading}
                isEmpty={!isLoading && !!d && effectiveCaixa === 0 && d.burnRate === 0}
                emptyMessage="Registre o saldo bancário (Caixa Real) para calcular o runway."
                error={errMsg}
                onRetry={() => refetch()}
              />
            </KpiGrid>
          </div>
          {/* Caixa Real manual input widget */}
          <CashBalanceInput
            onBalanceChange={setManualCaixa}
            className="xl:w-72 shrink-0"
          />
        </div>
      </div>

      {/* Row 2 — Saúde Financeira: Burn Rate | Break-even | Caixa previsto (30d) */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Saúde Financeira
        </h2>
        <KpiGrid columns={3}>
          <KpiCard
            title="Burn Rate"
            value={d ? d.burnRate : 0}
            sublabel="Média mensal (90 dias)"
            icon={<Flame className="h-4 w-4 text-red-500" />}
            colorClass="text-red-600 dark:text-red-400"
            tooltip={TOOLTIP_BURN}
            isLoading={isLoading}
            isEmpty={!isLoading && !!d && d.burnRate === 0}
            emptyMessage="Sem despesas pagas nos últimos 90 dias para calcular o burn rate."
            error={errMsg}
            onRetry={() => refetch()}
          />
          <KpiCard
            title="Break-even"
            value={d ? d.breakEven : 0}
            sublabel="Receita mínima mensal"
            icon={<Scale className="h-4 w-4 text-amber-500" />}
            colorClass="text-amber-600 dark:text-amber-400"
            tooltip={TOOLTIP_BREAKEVEN}
            isLoading={isLoading}
            isEmpty={!isLoading && !!d && d.breakEven === 0}
            emptyMessage="Sem dados de custos para calcular o ponto de equilíbrio."
            error={errMsg}
            onRetry={() => refetch()}
          />
          <KpiCard
            title="Caixa Previsto (30d)"
            value={d ? effectiveCaixaPrevisto30d : 0}
            sublabel={
              d
                ? `AR ${fmt(d.arNext30)} | AP ${fmt(d.apNext30)}`
                : undefined
            }
            icon={<Calculator className="h-4 w-4 text-blue-500" />}
            colorClass={
              effectiveCaixaPrevisto30d >= 0
                ? "text-blue-600 dark:text-blue-400"
                : "text-red-600 dark:text-red-400"
            }
            tooltip={TOOLTIP_CAIXA_PREVISTO}
            isLoading={isLoading}
            error={errMsg}
            onRetry={() => refetch()}
          />
        </KpiGrid>
      </div>

      {/* Row 3 — Performance: Receita por unidade | Top clientes | Top projetos */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Performance
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <UnitRevenueTable
            data={d?.unitRevenue ?? []}
            isLoading={isLoading}
          />
          <div className="lg:col-span-2">
            <RevenueConcentration
              data={d?.allClientsByRevenue ?? []}
              isLoading={isLoading}
            />
          </div>
          <TopProjectsTable
            data={d?.topProjectsByMargin ?? []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Row 4 — Alertas: Alertas estratégicos | Forecast */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Alertas
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FounderAlerts
            alerts={d?.alerts ?? []}
            isLoading={isLoading}
          />
          <ForecastPanel
            total={d?.forecast90d.total ?? 0}
            months={d?.forecast90d.months ?? []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Row 5 — Concentração de Receita (Melhoria #9) */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Concentração de Receita
        </h2>
        <RevenueConcentrationChart
          data={concentrationData}
          isLoading={concentrationLoading}
          topN={5}
        />
      </div>

      {/* Row 6 — DRE Simplificado (Melhoria #8) */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          DRE Simplificado
        </h2>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <DreTable
            data={dreData}
            isLoading={dreLoading}
            onConfigureClick={() => setDreSettingsOpen(true)}
          />
        </div>
        <DreSettingsModal
          open={dreSettingsOpen}
          onClose={() => setDreSettingsOpen(false)}
          currentTaxRate={dreSettings?.tax_rate ?? 15}
        />
      </div>

      {/* Row 8 — Estratégico: Evolução Mensal + Waterfall Caixa 30d */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Estratégico
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Evolução mensal — takes 3/5 columns */}
          <div className="lg:col-span-3 rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm font-semibold mb-1">Evolução Mensal (6 meses)</p>
            <p className="text-xs text-muted-foreground mb-3">
              Receita · Despesa · Margem — mês atual inclui dados parciais
            </p>
            {isLoading ? (
              <div className="h-[220px] animate-pulse rounded-lg bg-muted" />
            ) : (
              <MonthlyTrendChart data={d?.monthlyTrend ?? []} />
            )}
          </div>

          {/* Waterfall caixa — takes 2/5 columns */}
          <div className="lg:col-span-2 rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm font-semibold mb-1">Projeção de Caixa — 30d</p>
            <p className="text-xs text-muted-foreground mb-3">
              Caixa atual → +AR pendente → −AP pendente = Saldo previsto
            </p>
            {isLoading ? (
              <div className="h-[200px] animate-pulse rounded-lg bg-muted" />
            ) : (
              <CashWaterfallChart
                caixaAtual={effectiveCaixa}
                arNext30={d?.arNext30 ?? 0}
                apNext30={d?.apNext30 ?? 0}
              />
            )}
            {/* Summary row */}
            {d && !isLoading && (
              <div className="mt-3 flex justify-between text-xs text-muted-foreground border-t pt-2">
                <span>
                  AR: <span className="text-emerald-500 font-medium">{fmt(d.arNext30)}</span>
                </span>
                <span>
                  AP: <span className="text-rose-500 font-medium">{fmt(d.apNext30)}</span>
                </span>
                <span>
                  Saldo:{" "}
                  <span
                    className={
                      effectiveCaixaPrevisto30d >= 0
                        ? "text-blue-500 font-medium"
                        : "text-red-500 font-medium"
                    }
                  >
                    {fmt(effectiveCaixaPrevisto30d)}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
