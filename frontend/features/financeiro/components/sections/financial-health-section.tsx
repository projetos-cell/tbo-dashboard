"use client";

import { IconFlame, IconScale, IconCalculator, IconClock, IconAlertTriangle } from "@tabler/icons-react";
import { KpiCard } from "@/features/founder-dashboard/components/kpi-card";
import { KpiGrid } from "@/features/founder-dashboard/components/kpi-grid";
import type { FounderDashboardSnapshot } from "@/features/founder-dashboard/services/founder-dashboard";
import { fmt, fmtPct } from "@/features/financeiro/lib/formatters";
import {
  TOOLTIP_BURN,
  TOOLTIP_BREAKEVEN,
  TOOLTIP_CAIXA_PREVISTO,
  TOOLTIP_PMR,
  TOOLTIP_PMP,
  TOOLTIP_INADIMPLENCIA,
} from "@/features/financeiro/lib/tooltips";

interface Props {
  d: FounderDashboardSnapshot | undefined;
  isLoading: boolean;
  errMsg: string | null;
  effectiveCaixaPrevisto30d: number;
  onRetry: () => void;
}

export function FinancialHealthSection({
  d,
  isLoading,
  errMsg,
  effectiveCaixaPrevisto30d,
  onRetry,
}: Props) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Saúde Financeira
      </h2>
      <KpiGrid columns={3}>
        <KpiCard
          title="Burn Rate"
          value={d ? d.burnRate : 0}
          sublabel="Média mensal (90 dias)"
          variationValue={d?.burnRateDelta}
          invertColor
          icon={<IconFlame className="h-4 w-4 text-red-500" />}
          colorClass="text-red-600 dark:text-red-400"
          tooltip={TOOLTIP_BURN}
          isLoading={isLoading}
          isEmpty={!isLoading && !!d && d.burnRate === 0}
          emptyMessage="Sem despesas pagas nos últimos 90 dias."
          error={errMsg}
          onRetry={onRetry}
        />
        <KpiCard
          title="Break-even"
          value={d ? d.breakEven : 0}
          sublabel="Receita mínima mensal"
          icon={<IconScale className="h-4 w-4 text-amber-500" />}
          colorClass="text-amber-600 dark:text-amber-400"
          tooltip={TOOLTIP_BREAKEVEN}
          isLoading={isLoading}
          isEmpty={!isLoading && !!d && d.breakEven === 0}
          emptyMessage="Sem dados de custos para calcular o ponto de equilíbrio."
          error={errMsg}
          onRetry={onRetry}
        />
        <KpiCard
          title="Caixa Previsto (30d)"
          value={d ? effectiveCaixaPrevisto30d : 0}
          sublabel={
            d
              ? `AR ${fmt(d.arNext30)} | AP ${fmt(d.apNext30)}`
              : undefined
          }
          variationValue={d?.caixaPrevistoDelta}
          icon={<IconCalculator className="h-4 w-4 text-blue-500" />}
          colorClass={
            effectiveCaixaPrevisto30d >= 0
              ? "text-blue-600 dark:text-blue-400"
              : "text-red-600 dark:text-red-400"
          }
          tooltip={TOOLTIP_CAIXA_PREVISTO}
          isLoading={isLoading}
          error={errMsg}
          onRetry={onRetry}
        />
        <KpiCard
          title="PMR"
          value={d && d.pmr !== null ? `${d.pmr.toFixed(0)} dias` : "—"}
          sublabel="Prazo médio de recebimento (6 meses)"
          icon={<IconClock className="h-4 w-4 text-teal-500" />}
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
          onRetry={onRetry}
        />
        <KpiCard
          title="PMP"
          value={d && d.pmp !== null ? `${d.pmp.toFixed(0)} dias` : "—"}
          sublabel="Prazo médio de pagamento (6 meses)"
          icon={<IconClock className="h-4 w-4 text-indigo-500" />}
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
          onRetry={onRetry}
        />
        <KpiCard
          title="Inadimplência"
          value={d ? fmtPct(d.inadimplenciaPct) : "—"}
          sublabel={
            d && d.inadimplenciaCount > 0
              ? `${d.inadimplenciaCount} título${d.inadimplenciaCount > 1 ? "s" : ""} · ${fmt(d.inadimplenciaTotal)}`
              : "Nenhum título atrasado"
          }
          icon={<IconAlertTriangle className="h-4 w-4 text-orange-500" />}
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
          onRetry={onRetry}
        />
      </KpiGrid>
    </div>
  );
}
