"use client";

import { TrendingUp, BarChart3, ShieldAlert, Wallet } from "lucide-react";
import { KpiCard } from "@/features/founder-dashboard/components/kpi-card";
import { KpiGrid } from "@/features/founder-dashboard/components/kpi-grid";
import { CashBalanceInput } from "@/features/founder-dashboard/components/cash-balance-input";
import type { FounderDashboardSnapshot } from "@/features/founder-dashboard/services/founder-dashboard";
import { fmt, fmtPct, fmtMonths } from "@/features/financeiro/lib/formatters";
import {
  TOOLTIP_RECEITA,
  TOOLTIP_MARGEM,
  TOOLTIP_CAIXA,
  TOOLTIP_RUNWAY,
} from "@/features/financeiro/lib/tooltips";

interface Props {
  d: FounderDashboardSnapshot | undefined;
  isLoading: boolean;
  errMsg: string | null;
  effectiveCaixa: number;
  effectiveRunway: number;
  manualCaixa: number | null;
  onRetry: () => void;
}

export function FounderMetricsSection({
  d,
  isLoading,
  errMsg,
  effectiveCaixa,
  effectiveRunway,
  manualCaixa,
  onRetry,
}: Props) {
  return (
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
              onRetry={onRetry}
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
              onRetry={onRetry}
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
              onRetry={onRetry}
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
              onRetry={onRetry}
            />
          </KpiGrid>
        </div>
        <CashBalanceInput className="xl:w-72 shrink-0" />
      </div>
    </div>
  );
}
