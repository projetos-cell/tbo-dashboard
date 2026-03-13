"use client";

import { Suspense } from "react";
import { RBACGuard } from "@/components/rbac-guard";
import { useFounderDashboard } from "@/features/founder-dashboard/hooks/use-founder-dashboard";
import { PeriodFilter } from "@/features/founder-dashboard/components/period-filter";
import { usePersistedPeriod } from "@/hooks/use-persisted-period";
import { FounderAlerts } from "@/features/founder-dashboard/components/founder-alerts";
import { ForecastPanel } from "@/features/founder-dashboard/components/forecast-panel";
import { useLatestCashBalance } from "@/features/financeiro/hooks/use-cash-entries";

import { FounderMetricsSection } from "@/features/financeiro/components/sections/founder-metrics-section";
import { FinancialHealthSection } from "@/features/financeiro/components/sections/financial-health-section";
import { ExpiringContractsSection } from "@/features/financeiro/components/sections/expiring-contracts-section";
import { StrategicSection } from "@/features/financeiro/components/sections/strategic-section";
import { OmieSyncButton } from "@/features/financeiro/components/omie-sync-button";
import Link from "next/link";
import { IconUsers, IconReceipt, IconUserMinus, IconArrowRight } from "@tabler/icons-react";

function FinanceiroContent() {
  const [period, setPeriod] = usePersistedPeriod("ytd");
  const { data: manualCaixa } = useLatestCashBalance();

  const { data, isLoading, error, refetch } = useFounderDashboard(period);

  const d = data;
  const errMsg = error ? (error as Error).message : null;

  const effectiveCaixa = manualCaixa ?? (d?.caixaAtual ?? 0);
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
        <div className="flex items-center gap-2">
          <OmieSyncButton />
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
      </div>

      <FounderMetricsSection
        d={d}
        isLoading={isLoading}
        errMsg={errMsg}
        effectiveCaixa={effectiveCaixa}
        effectiveRunway={effectiveRunway}
        manualCaixa={manualCaixa ?? null}
        onRetry={refetch}
      />

      <FinancialHealthSection
        d={d}
        isLoading={isLoading}
        errMsg={errMsg}
        effectiveCaixaPrevisto30d={effectiveCaixaPrevisto30d}
        onRetry={refetch}
      />

      {/* ── Indicadores Operacionais (resumo) ─────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Indicadores Operacionais
        </h2>
        <Link
          href="/financeiro/operacional"
          className="block rounded-xl border bg-white p-4 shadow-sm hover:border-tbo-orange/30 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <IconUsers className="h-4 w-4 text-indigo-500" />
                <div>
                  <p className="text-xs text-gray-500">Receita/Colab.</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {d ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(d.receitaPorColaborador) : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IconReceipt className="h-4 w-4 text-rose-500" />
                <div>
                  <p className="text-xs text-gray-500">Folha</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {d ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(d.folhaPagamento) : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IconUserMinus className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">Churn</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {d ? `${d.churnRate.toFixed(1)}%` : "—"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-tbo-orange group-hover:gap-2.5 transition-all">
              Ver detalhes
              <IconArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </div>

      <ExpiringContractsSection contracts={d?.expiringContracts ?? []} />

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

      <StrategicSection
        d={d}
        isLoading={isLoading}
        effectiveCaixa={effectiveCaixa}
        effectiveCaixaPrevisto30d={effectiveCaixaPrevisto30d}
      />
    </div>
  );
}

export default function FinanceiroPage() {
  return (
    <RBACGuard minRole="diretoria">
      <FinanceiroContent />
    </RBACGuard>
  );
}
