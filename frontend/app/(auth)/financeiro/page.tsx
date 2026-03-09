"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import { useFounderDashboard } from "@/features/founder-dashboard/hooks/use-founder-dashboard";
import {
  PeriodFilter,
  type PeriodValue,
} from "@/features/founder-dashboard/components/period-filter";
import {
  TrendingUp,
  BarChart3,
  ShieldAlert,
  Wallet,
  Flame,
  Scale,
  Calculator,
  Clock,
  AlertTriangle,
  Users,
  Receipt,
  Cog,
  UserMinus,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

import { KpiCard } from "@/features/founder-dashboard/components/kpi-card";
import { KpiGrid } from "@/features/founder-dashboard/components/kpi-grid";
import { UnitRevenueTable } from "@/features/founder-dashboard/components/unit-revenue-table";
import { TopProjectsTable } from "@/features/founder-dashboard/components/top-projects-table";
import { RevenueConcentration } from "@/features/founder-dashboard/components/revenue-concentration";
import { FounderAlerts } from "@/features/founder-dashboard/components/founder-alerts";
import { ForecastPanel } from "@/features/founder-dashboard/components/forecast-panel";
import type { KpiTooltipContent } from "@/features/founder-dashboard/components/kpi-card";
import { CashBalanceInput } from "@/features/founder-dashboard/components/cash-balance-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";

// ── Dynamic chart imports (no SSR) ──────────────────────────────────────────

const MonthlyTrendChart = dynamic(
  () =>
    import("@/features/founder-dashboard/components/monthly-trend-chart").then((m) => ({
      default: m.MonthlyTrendChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] animate-pulse rounded-xl bg-gray-100" />
    ),
  }
);

const CashWaterfallChart = dynamic(
  () =>
    import("@/features/founder-dashboard/components/cash-waterfall-chart").then(
      (m) => ({ default: m.CashWaterfallChart })
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] animate-pulse rounded-xl bg-gray-100" />
    ),
  }
);

const DreTable = dynamic(
  () =>
    import("@/features/financeiro/components/dre-table").then((m) => ({
      default: m.DreTable,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] animate-pulse rounded-xl bg-gray-100" />
    ),
  }
);

const DreSettingsModal = dynamic(
  () =>
    import("@/features/financeiro/components/dre-settings-modal").then((m) => ({
      default: m.DreSettingsModal,
    })),
  { ssr: false }
);

const RevenueConcentrationChart = dynamic(
  () =>
    import("@/features/financeiro/components/revenue-concentration-chart").then(
      (m) => ({ default: m.RevenueConcentrationChart })
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] animate-pulse rounded-xl bg-gray-100" />
    ),
  }
);

import {
  useFinanceDRE,
  useRevenueConcentrationByClient,
  useDreSettings,
} from "@/features/financeiro/hooks/use-finance";

// ── Helpers ─────────────────────────────────────────────────────────────────

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

// ── Tooltip content ─────────────────────────────────────────────────────────

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
  description:
    "Quantos meses a empresa sobrevive com o caixa atual, sem novas receitas.",
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
  description:
    "Receita mínima mensal para cobrir todos os custos (fixos + variáveis).",
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

const TOOLTIP_PMR: KpiTooltipContent = {
  description:
    "Prazo Médio de Recebimento — quantos dias, em média, os clientes levam para pagar após o vencimento.",
  formula: "Média(paid_date - due_date) nos últimos 180 dias",
  enters: "Títulos a receber baixados (últimos 6 meses).",
  notEnters: "Títulos em aberto ou cancelados.",
  source: "Omie — Contas a Receber (baixadas)",
};

const TOOLTIP_PMP: KpiTooltipContent = {
  description:
    "Prazo Médio de Pagamento — quantos dias, em média, a empresa leva para pagar seus fornecedores após o vencimento.",
  formula: "Média(paid_date - due_date) nos últimos 180 dias",
  enters: "Títulos a pagar baixados (últimos 6 meses).",
  notEnters: "Títulos em aberto ou cancelados.",
  source: "Omie — Contas a Pagar (baixadas)",
};

const TOOLTIP_INADIMPLENCIA: KpiTooltipContent = {
  description:
    "Percentual de títulos a receber vencidos (atrasados) sobre o total de títulos pendentes.",
  formula: "Σ(AR atrasados) / Σ(AR pendentes) × 100",
  enters: "Títulos a receber com status 'atrasado'.",
  notEnters: "Títulos pagos, cancelados ou futuros.",
  source: "Omie — Contas a Receber (pendentes)",
};

// ── Page ────────────────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  const role = useAuthStore((s) => s.role);
  const router = useRouter();
  const [period, setPeriod] = useState<PeriodValue>({ preset: "mtd" });
  const [manualCaixa, setManualCaixa] = useState<number | null>(null);
  const [dreSettingsOpen, setDreSettingsOpen] = useState(false);

  const { data: dreData, isLoading: dreLoading } = useFinanceDRE(7);
  const { data: dreSettings } = useDreSettings();
  const { data: concentrationData, isLoading: concentrationLoading } =
    useRevenueConcentrationByClient();

  useEffect(() => {
    if (role && !hasMinRole(role, "diretoria")) {
      router.replace("/dashboard");
    }
  }, [role, router]);

  const { data, isLoading, error, refetch } = useFounderDashboard(period);

  if (!role || !hasMinRole(role, "diretoria")) {
    return null;
  }

  const d = data;
  const errMsg = error ? (error as Error).message : null;

  const effectiveCaixa =
    manualCaixa !== null ? manualCaixa : (d?.caixaAtual ?? 0);
  const effectiveRunway =
    d && d.burnRate > 0 ? effectiveCaixa / d.burnRate : (d?.runway ?? 0);
  const effectiveCaixaPrevisto30d =
    effectiveCaixa + (d?.arNext30 ?? 0) - (d?.apNext30 ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Dashboard financeiro executivo — dados consolidados do Omie.
          </p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* ── Founder Metrics ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
          <div className="flex-1 min-w-0">
            <KpiGrid columns={4}>
              <KpiCard
                title="Receita MTD"
                value={d ? fmt(d.receitaRealizada) : "—"}
                sublabel={
                  d && d.receitaRealizada > 0
                    ? `Recorrente: ${fmt(d.mrrReceita)} | Pontual: ${fmt(d.pontualReceita)}`
                    : d?.periodLabel
                      ? `${d.periodLabel} (pagas)`
                      : "MTD (pagas)"
                }
                icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
                colorClass="text-emerald-600 dark:text-emerald-400"
                tooltip={TOOLTIP_RECEITA}
                isLoading={isLoading}
                isEmpty={!isLoading && !!d && d.receitaRealizada === 0}
                emptyMessage="Nenhuma receita paga neste período."
                error={errMsg}
                onRetry={() => refetch()}
              />
              <KpiCard
                title="Margem"
                value={
                  d
                    ? `${fmt(d.margemReal)} (${fmtPct(d.margemPct)})`
                    : "—"
                }
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
                sublabel={
                  manualCaixa !== null
                    ? "Entrada manual (Caixa Real)"
                    : "Saldo consolidado"
                }
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
                isEmpty={
                  !isLoading &&
                  !!d &&
                  effectiveCaixa === 0 &&
                  d.burnRate === 0
                }
                emptyMessage="Registre o saldo bancário (Caixa Real) para calcular o runway."
                error={errMsg}
                onRetry={() => refetch()}
              />
            </KpiGrid>
          </div>
          <CashBalanceInput
            onBalanceChange={setManualCaixa}
            className="xl:w-72 shrink-0"
          />
        </div>
      </div>

      {/* ── Saúde Financeira ─────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
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
            emptyMessage="Sem despesas pagas nos últimos 90 dias."
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
          <KpiCard
            title="PMR"
            value={d && d.pmr !== null ? `${d.pmr.toFixed(0)} dias` : "—"}
            sublabel="Prazo médio de recebimento (6 meses)"
            icon={<Clock className="h-4 w-4 text-teal-500" />}
            colorClass={
              d && d.pmr !== null && d.pmr <= 5
                ? "text-emerald-600 dark:text-emerald-400"
                : d && d.pmr !== null && d.pmr <= 15
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
            }
            tooltip={TOOLTIP_PMR}
            isLoading={isLoading}
            isEmpty={!isLoading && !!d && d.pmr === null}
            emptyMessage="Sem títulos baixados nos últimos 6 meses."
            error={errMsg}
            onRetry={() => refetch()}
          />
          <KpiCard
            title="PMP"
            value={d && d.pmp !== null ? `${d.pmp.toFixed(0)} dias` : "—"}
            sublabel="Prazo médio de pagamento (6 meses)"
            icon={<Clock className="h-4 w-4 text-indigo-500" />}
            colorClass={
              d && d.pmp !== null && d.pmp <= 5
                ? "text-emerald-600 dark:text-emerald-400"
                : d && d.pmp !== null && d.pmp <= 15
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
            }
            tooltip={TOOLTIP_PMP}
            isLoading={isLoading}
            isEmpty={!isLoading && !!d && d.pmp === null}
            emptyMessage="Sem títulos pagos nos últimos 6 meses."
            error={errMsg}
            onRetry={() => refetch()}
          />
          <KpiCard
            title="Inadimplência"
            value={d ? fmtPct(d.inadimplenciaPct) : "—"}
            sublabel={
              d && d.inadimplenciaCount > 0
                ? `${d.inadimplenciaCount} título${d.inadimplenciaCount > 1 ? "s" : ""} · ${fmt(d.inadimplenciaTotal)}`
                : "Nenhum título atrasado"
            }
            icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}
            colorClass={
              d && d.inadimplenciaPct <= 5
                ? "text-emerald-600 dark:text-emerald-400"
                : d && d.inadimplenciaPct <= 15
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
            }
            tooltip={TOOLTIP_INADIMPLENCIA}
            isLoading={isLoading}
            isEmpty={
              !isLoading &&
              !!d &&
              d.inadimplenciaPct === 0 &&
              d.inadimplenciaCount === 0
            }
            emptyMessage="Nenhum título a receber em atraso — excelente!"
            error={errMsg}
            onRetry={() => refetch()}
          />
        </KpiGrid>
      </div>

      {/* ── Margem por Cliente ───────────────────────────────────────────── */}
      {d && d.clientMargins.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              Margem por Cliente (Top 10)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Receita vs custos diretos atribuídos via projetos no período
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left py-2 font-medium">Cliente</th>
                    <th className="text-right py-2 font-medium">Receita</th>
                    <th className="text-right py-2 font-medium">Custos</th>
                    <th className="text-right py-2 font-medium">Margem</th>
                    <th className="text-right py-2 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {d.clientMargins.map((cm) => (
                    <tr
                      key={cm.client}
                      className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2 font-medium truncate max-w-[200px]">
                        {cm.client}
                      </td>
                      <td className="py-2 text-right text-emerald-600">
                        {fmt(cm.receita)}
                      </td>
                      <td className="py-2 text-right text-rose-500">
                        {fmt(cm.custos)}
                      </td>
                      <td
                        className={`py-2 text-right font-medium ${
                          cm.margem >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {fmt(cm.margem)}
                      </td>
                      <td
                        className={`py-2 text-right ${
                          cm.margemPct >= 30
                            ? "text-emerald-600"
                            : cm.margemPct >= 15
                              ? "text-amber-600"
                              : "text-red-600"
                        }`}
                      >
                        {fmtPct(cm.margemPct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Indicadores Operacionais ─────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Indicadores Operacionais
        </h2>
        <KpiGrid columns={4}>
          <KpiCard
            title="Receita / Colaborador"
            value={d ? fmt(d.receitaPorColaborador) : "—"}
            sublabel={d ? `${d.headcount} colaboradores ativos` : undefined}
            icon={<Users className="h-4 w-4 text-indigo-500" />}
            colorClass="text-indigo-600 dark:text-indigo-400"
            tooltip={{
              description:
                "Receita total dividida pelo número de colaboradores ativos.",
              formula: "receita_realizada / headcount",
              source: "Omie (receita) + Pessoas (headcount)",
            }}
            isLoading={isLoading}
            isEmpty={!isLoading && !!d && d.headcount === 0}
            emptyMessage="Nenhum colaborador ativo cadastrado."
            error={errMsg}
            onRetry={() => refetch()}
          />
          <KpiCard
            title="Folha de Pagamento"
            value={d ? fmt(d.folhaPagamento) : "—"}
            sublabel={
              d ? `${fmtPct(d.folhaPct)} do total de custos` : undefined
            }
            icon={<Receipt className="h-4 w-4 text-rose-500" />}
            colorClass="text-rose-600 dark:text-rose-400"
            tooltip={{
              description:
                "Custos classificados como Folha de Pagamento no período.",
              enters: "Despesas com categoria 'folha' ou 'salários'.",
              source: "Omie (contas a pagar — categoria folha)",
            }}
            isLoading={isLoading}
            error={errMsg}
            onRetry={() => refetch()}
          />
          <KpiCard
            title="Custos Operacionais"
            value={d ? fmt(d.custosOperacionais) : "—"}
            sublabel={
              d ? `${fmtPct(d.operacionalPct)} do total de custos` : undefined
            }
            icon={<Cog className="h-4 w-4 text-slate-500" />}
            colorClass="text-slate-600 dark:text-slate-400"
            tooltip={{
              description:
                "Custos operacionais excluindo folha de pagamento.",
              formula: "total_despesas - folha_pagamento",
              source: "Omie (contas a pagar — exceto categoria folha)",
            }}
            isLoading={isLoading}
            error={errMsg}
            onRetry={() => refetch()}
          />
          <KpiCard
            title="Churn Rate"
            value={d ? fmtPct(d.churnRate) : "—"}
            sublabel="Clientes perdidos (mês atual)"
            icon={<UserMinus className="h-4 w-4 text-red-500" />}
            colorClass={
              d && d.churnRate > 10
                ? "text-red-600 dark:text-red-400"
                : d && d.churnRate > 5
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
            }
            tooltip={{
              description:
                "Taxa de churn: percentual de clientes que deixaram de gerar receita.",
              formula:
                "clientes_perdidos / clientes_ativos_mês_anterior × 100",
              source: "Omie (receita por cliente — comparação mensal)",
            }}
            isLoading={isLoading}
            isEmpty={!isLoading && !!d && d.churnHistory.length === 0}
            emptyMessage="Dados insuficientes para calcular churn (mínimo 2 meses)."
            error={errMsg}
            onRetry={() => refetch()}
          />
        </KpiGrid>

        {/* Churn sparkline */}
        {d && d.churnHistory.length > 1 && !isLoading && (
          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">
                Evolução do Churn
              </p>
              <div className="flex gap-3">
                {d.churnHistory.slice(-3).map((p) => (
                  <span key={p.month} className="text-xs text-gray-400">
                    {p.label}:{" "}
                    <span className="font-medium text-gray-600">
                      {p.rate.toFixed(1)}%
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.churnHistory}>
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ── Performance ──────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
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

      {/* ── Contratos a Vencer ───────────────────────────────────────────── */}
      {d && d.expiringContracts.length > 0 && !isLoading && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Contratos a Vencer (60 dias)
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {d.expiringContracts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {c.title}
                    </p>
                    <p className="text-xs text-gray-500">{c.client}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {fmt(c.monthlyValue)}/mês
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        c.daysRemaining <= 15
                          ? "text-red-600"
                          : c.daysRemaining <= 30
                            ? "text-amber-600"
                            : "text-gray-500"
                      }`}
                    >
                      {c.daysRemaining} dias restantes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Alertas ──────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Alertas
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FounderAlerts alerts={d?.alerts ?? []} isLoading={isLoading} />
          <ForecastPanel
            total={d?.forecast90d.total ?? 0}
            proposalsTotal={d?.forecastProposalsTotal}
            months={d?.forecast90d.months ?? []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* ── Concentração de Receita ──────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Concentração de Receita
        </h2>
        <RevenueConcentrationChart
          data={concentrationData}
          isLoading={concentrationLoading}
          topN={5}
        />
      </div>

      {/* ── DRE Simplificado ─────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          DRE Simplificado
        </h2>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
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

      {/* ── Estratégico ──────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Estratégico
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold mb-1">
              Evolução Mensal (6 meses)
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Receita · Despesa · Margem — mês atual inclui dados parciais
            </p>
            {isLoading ? (
              <div className="h-[220px] animate-pulse rounded-lg bg-gray-100" />
            ) : (
              <MonthlyTrendChart data={d?.monthlyTrend ?? []} />
            )}
          </div>

          <div className="lg:col-span-2 rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold mb-1">
              Projeção de Caixa — 30d
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Caixa atual → +AR pendente → −AP pendente = Saldo previsto
            </p>
            {isLoading ? (
              <div className="h-[200px] animate-pulse rounded-lg bg-gray-100" />
            ) : (
              <CashWaterfallChart
                caixaAtual={effectiveCaixa}
                arNext30={d?.arNext30 ?? 0}
                apNext30={d?.apNext30 ?? 0}
              />
            )}
            {d && !isLoading && (
              <div className="mt-3 flex justify-between text-xs text-gray-500 border-t pt-2">
                <span>
                  AR:{" "}
                  <span className="text-emerald-500 font-medium">
                    {fmt(d.arNext30)}
                  </span>
                </span>
                <span>
                  AP:{" "}
                  <span className="text-rose-500 font-medium">
                    {fmt(d.apNext30)}
                  </span>
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
