"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { RBACGuard } from "@/components/rbac-guard";
import { usePersistedPeriod } from "@/hooks/use-persisted-period";
import { PeriodFilter, resolvePeriodBounds } from "@/features/founder-dashboard/components/period-filter";
import { useRevenueConcentrationByClient } from "@/features/financeiro/hooks/use-finance";

const RevenueConcentrationChart = dynamic(
  () =>
    import(
      "@/features/financeiro/components/revenue-concentration-chart"
    ).then((m) => ({ default: m.RevenueConcentrationChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] animate-pulse rounded-xl bg-gray-100" />
    ),
  }
);

function ConcentracaoContent() {
  const [period, setPeriod] = usePersistedPeriod("ytd");
  const { from, to } = resolvePeriodBounds(period);
  const { data: concentrationData, isLoading: concentrationLoading } =
    useRevenueConcentrationByClient(from, to);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Concentração de Receita
          </h1>
          <p className="text-sm text-muted-foreground">
            Análise de concentração por cliente — risco de dependência.
          </p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      <RevenueConcentrationChart
        data={concentrationData}
        isLoading={concentrationLoading}
        topN={10}
      />
    </div>
  );
}

export default function ConcentracaoPage() {
  return (
    <RBACGuard minRole="diretoria">
      <ConcentracaoContent />
    </RBACGuard>
  );
}
