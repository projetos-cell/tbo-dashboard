"use client";

import { IconUsers, IconReceipt, IconSettings } from "@tabler/icons-react";
import { KpiCard } from "@/features/founder-dashboard/components/kpi-card";
import { KpiGrid } from "@/features/founder-dashboard/components/kpi-grid";
import type { FounderDashboardSnapshot } from "@/features/founder-dashboard/services/founder-dashboard";
import { fmt, fmtPct } from "@/features/financeiro/lib/formatters";

interface Props {
  d: FounderDashboardSnapshot | undefined;
  isLoading: boolean;
  errMsg: string | null;
  onRetry: () => void;
  /** Folha real vinda de finance_team_payroll */
  folhaReal: number;
  /** Headcount real vindo de finance_team_payroll */
  headcountReal: number;
  /** Loading state da payroll */
  payrollLoading: boolean;
}

export function OperationalIndicatorsSection({
  d,
  isLoading,
  errMsg,
  onRetry,
  folhaReal,
  headcountReal,
  payrollLoading,
}: Props) {
  const anyLoading = isLoading || payrollLoading;

  // Receita realizada (YTD) do dashboard
  const receitaRealizada = d?.receitaRealizada ?? 0;

  // Receita/colaborador usando headcount real da payroll
  const receitaPerColab = headcountReal > 0 ? receitaRealizada / headcountReal : 0;

  // Custos operacionais = total despesas Omie - folha real
  const totalDespesas = d ? d.folhaPagamento + d.custosOperacionais : 0;
  const custosOp = Math.max(0, totalDespesas - folhaReal);

  // Percentuais
  const totalCustos = folhaReal + custosOp;
  const folhaPct = totalCustos > 0 ? (folhaReal / totalCustos) * 100 : 0;
  const opPct = totalCustos > 0 ? (custosOp / totalCustos) * 100 : 0;

  return (
    <div>
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Indicadores Operacionais
      </h2>
      <KpiGrid columns={3}>
        <KpiCard
          title="Receita / Colaborador"
          value={!anyLoading ? fmt(receitaPerColab) : "\u2014"}
          sublabel={!anyLoading ? `${headcountReal} colaboradores ativos` : undefined}
          icon={<IconUsers className="h-4 w-4 text-indigo-500" />}
          colorClass="text-indigo-600 dark:text-indigo-400"
          tooltip={{
            description:
              "Receita realizada dividida pelo headcount da folha.",
            formula: "receita_realizada / headcount_payroll",
            source: "Omie (receita) + Folha (headcount)",
          }}
          isLoading={anyLoading}
          isEmpty={!anyLoading && headcountReal === 0}
          emptyMessage="Nenhum colaborador ativo na folha."
          error={errMsg}
          onRetry={onRetry}
        />
        <KpiCard
          title="Folha de Pagamento"
          value={!anyLoading ? fmt(folhaReal) : "\u2014"}
          sublabel={!anyLoading ? `${fmtPct(folhaPct)} do total de custos` : undefined}
          icon={<IconReceipt className="h-4 w-4 text-rose-500" />}
          colorClass="text-rose-600 dark:text-rose-400"
          tooltip={{
            description:
              "Total da folha de pagamento registrada no mes.",
            source: "Folha (finance_team_payroll)",
          }}
          isLoading={anyLoading}
          error={errMsg}
          onRetry={onRetry}
        />
        <KpiCard
          title="Custos Operacionais"
          value={!anyLoading ? fmt(custosOp) : "\u2014"}
          sublabel={!anyLoading ? `${fmtPct(opPct)} do total de custos` : undefined}
          icon={<IconSettings className="h-4 w-4 text-slate-500" />}
          colorClass="text-slate-600 dark:text-slate-400"
          tooltip={{
            description:
              "Despesas pagas excluindo a folha de pagamento.",
            formula: "total_despesas_omie - folha_payroll",
            source: "Omie (despesas pagas) - Folha",
          }}
          isLoading={anyLoading}
          error={errMsg}
          onRetry={onRetry}
        />
      </KpiGrid>
    </div>
  );
}
