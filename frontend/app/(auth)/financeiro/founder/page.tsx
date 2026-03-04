"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import { useFounderDashboard } from "@/hooks/use-founder-dashboard";
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
import { TopClientsTable } from "@/components/founder-dashboard/top-clients-table";
import { FounderAlerts } from "@/components/founder-dashboard/founder-alerts";
import { ForecastPanel } from "@/components/founder-dashboard/forecast-panel";
import type { KpiTooltipContent } from "@/components/founder-dashboard/kpi-card";

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
  description: "Soma de todas as receitas recebidas (baixadas) no mes atual.",
  formula: undefined,
  enters: "Titulos baixados no periodo (status pago).",
  notEnters: "Faturado sem recebimento, propostas em aberto.",
  source: "Omie — Contas a Receber (baixados)",
};

const TOOLTIP_MARGEM: KpiTooltipContent = {
  description: "Lucro real apos custos diretos de projetos/producao.",
  formula: "Receita Realizada - Custos Diretos Pagos",
  enters: "Despesas de projetos e producao (pagos).",
  notEnters: "Custo fixo (folha, softwares, infra).",
  source: "Omie — AP + classificacao de custos",
};

const TOOLTIP_RUNWAY: KpiTooltipContent = {
  description: "Quantos meses a empresa sobrevive com o caixa atual, sem novas receitas.",
  formula: "Caixa Atual / Burn Rate",
  enters: undefined,
  notEnters: undefined,
  source: "Omie — saldos bancarios + calculo interno",
};

const TOOLTIP_CAIXA: KpiTooltipContent = {
  description: "Saldo consolidado de todas as contas bancarias hoje.",
  formula: undefined,
  enters: "Contas bancarias cadastradas no Omie.",
  notEnters: undefined,
  source: "Omie — saldos bancarios (snapshot diario)",
};

const TOOLTIP_BURN: KpiTooltipContent = {
  description: "Media mensal de gastos totais nos ultimos 3 meses.",
  formula: "Media de despesas pagas (ultimos 3 meses)",
  enters: undefined,
  notEnters: undefined,
  source: "Omie — Contas a Pagar (baixadas)",
};

const TOOLTIP_BREAKEVEN: KpiTooltipContent = {
  description: "Receita minima mensal para cobrir todos os custos (fixos + variaveis).",
  formula: "Custos Fixos + Custos Variaveis medios",
  enters: "Folha, softwares, infra, custos variaveis.",
  notEnters: undefined,
  source: "Omie — AP + centros de custo",
};

const TOOLTIP_CAIXA_PREVISTO: KpiTooltipContent = {
  description: "Projecao de caixa para os proximos 30 dias.",
  formula: "Caixa Atual + A Receber(30d) - A Pagar(30d)",
  enters: undefined,
  notEnters: undefined,
  source: "Omie — AR/AP pendentes + saldos",
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FinanceiroFounderPage() {
  const role = useAuthStore((s) => s.role);
  const router = useRouter();

  useEffect(() => {
    if (role && !hasMinRole(role, "diretoria")) {
      router.replace("/financeiro");
    }
  }, [role, router]);

  const { data, isLoading, error, refetch } = useFounderDashboard();

  if (!role || !hasMinRole(role, "diretoria")) {
    return null;
  }

  const d = data;
  const errMsg = error ? (error as Error).message : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Visao Estrategica</h1>
        <p className="text-muted-foreground">
          Dashboard financeiro executivo — dados consolidados do Omie.
        </p>
      </div>

      {/* Row 1 — Saude: Receita | Margem | Runway */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Saude Financeira
        </h2>
        <KpiGrid columns={3}>
          <KpiCard
            title="Receita Realizada"
            value={d ? fmt(d.receitaRealizada) : "—"}
            sublabel="MTD (pagas)"
            icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
            colorClass="text-emerald-600 dark:text-emerald-400"
            tooltip={TOOLTIP_RECEITA}
            isLoading={isLoading}
            isEmpty={!isLoading && !!d && d.receitaRealizada === 0}
            error={errMsg}
            onRetry={() => refetch()}
          />
          <KpiCard
            title="Margem Real"
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
            isEmpty={!isLoading && !!d && d.receitaRealizada === 0 && d.margemReal === 0}
            error={errMsg}
            onRetry={() => refetch()}
          />
          <KpiCard
            title="Runway"
            value={d ? fmtMonths(d.runway) : "—"}
            sublabel="Meses de sobrevivencia"
            icon={<ShieldAlert className="h-4 w-4 text-orange-500" />}
            colorClass={
              d && d.runway >= 6
                ? "text-emerald-600 dark:text-emerald-400"
                : d && d.runway >= 3
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
            }
            tooltip={TOOLTIP_RUNWAY}
            isLoading={isLoading}
            isEmpty={!isLoading && !!d && d.caixaAtual === 0 && d.burnRate === 0}
            error={errMsg}
            onRetry={() => refetch()}
          />
        </KpiGrid>
      </div>

      {/* Row 2 — Caixa: Caixa atual | Burn rate | Break-even | Caixa previsto */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Caixa e Projecoes
        </h2>
        <KpiGrid columns={4}>
          <KpiCard
            title="Caixa Atual"
            value={d ? d.caixaAtual : 0}
            sublabel="Saldo consolidado"
            icon={<Wallet className="h-4 w-4 text-violet-500" />}
            colorClass={
              d && d.caixaAtual >= 0
                ? "text-violet-600 dark:text-violet-400"
                : "text-red-600 dark:text-red-400"
            }
            tooltip={TOOLTIP_CAIXA}
            isLoading={isLoading}
            error={errMsg}
            onRetry={() => refetch()}
          />
          <KpiCard
            title="Burn Rate"
            value={d ? d.burnRate : 0}
            sublabel="Media mensal (3 meses)"
            icon={<Flame className="h-4 w-4 text-red-500" />}
            colorClass="text-red-600 dark:text-red-400"
            tooltip={TOOLTIP_BURN}
            isLoading={isLoading}
            isEmpty={!isLoading && !!d && d.burnRate === 0}
            error={errMsg}
            onRetry={() => refetch()}
          />
          <KpiCard
            title="Break-even"
            value={d ? d.breakEven : 0}
            sublabel="Receita minima mensal"
            icon={<Scale className="h-4 w-4 text-amber-500" />}
            colorClass="text-amber-600 dark:text-amber-400"
            tooltip={TOOLTIP_BREAKEVEN}
            isLoading={isLoading}
            isEmpty={!isLoading && !!d && d.breakEven === 0}
            error={errMsg}
            onRetry={() => refetch()}
          />
          <KpiCard
            title="Caixa Previsto (30d)"
            value={d ? d.caixaPrevisto30d : 0}
            sublabel={
              d
                ? `AR ${fmt(d.arNext30)} | AP ${fmt(d.apNext30)}`
                : undefined
            }
            icon={<Calculator className="h-4 w-4 text-blue-500" />}
            colorClass={
              d && d.caixaPrevisto30d >= 0
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

      {/* Row 3 — Receita: Unit Revenue | Top Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UnitRevenueTable
          data={d?.unitRevenue ?? []}
          isLoading={isLoading}
        />
        <TopProjectsTable
          data={d?.topProjectsByMargin ?? []}
          isLoading={isLoading}
        />
      </div>

      {/* Row 4 — Clientes / Risco: Top Clients | Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopClientsTable
          data={d?.topClientsByRevenue ?? []}
          concentracaoTop3={d?.concentracaoTop3 ?? 0}
          isLoading={isLoading}
        />
        <FounderAlerts
          alerts={d?.alerts ?? []}
          isLoading={isLoading}
        />
      </div>

      {/* Row 5 — Forecast 90 dias */}
      <ForecastPanel
        total={d?.forecast90d.total ?? 0}
        months={d?.forecast90d.months ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}
