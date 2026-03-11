"use client";

import dynamic from "next/dynamic";
import { RBACGuard } from "@/components/rbac-guard";
import { useFounderDashboard } from "@/features/founder-dashboard/hooks/use-founder-dashboard";
import { PeriodFilter, resolvePeriodBounds } from "@/features/founder-dashboard/components/period-filter";
import { usePersistedPeriod } from "@/hooks/use-persisted-period";
import { UnitRevenueTable } from "@/features/founder-dashboard/components/unit-revenue-table";
import { TopProjectsTable } from "@/features/founder-dashboard/components/top-projects-table";
import { ClientMarginTable } from "@/features/financeiro/components/sections/client-margin-table";
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

function PerformanceContent() {
  const [period, setPeriod] = usePersistedPeriod("ytd");
  const { data: d, isLoading } = useFounderDashboard(period);

  const { from, to } = resolvePeriodBounds(period);
  const { data: concentrationData, isLoading: concentrationLoading } =
    useRevenueConcentrationByClient(from, to);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
          <p className="text-sm text-muted-foreground">
            Receita por BU, concentração de receita e margens por cliente.
          </p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Receita por BU + Top Projetos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UnitRevenueTable data={d?.unitRevenue ?? []} isLoading={isLoading} />
        <TopProjectsTable
          data={d?.topProjectsByMargin ?? []}
          isLoading={isLoading}
        />
      </div>

      {/* Concentração de Receita (chart detalhado) */}
      <RevenueConcentrationChart
        data={concentrationData}
        isLoading={concentrationLoading}
        topN={10}
      />

      {/* Margens por Cliente */}
      {isLoading ? (
        <div className="h-[300px] animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <ClientMarginTable clientMargins={d?.clientMargins ?? []} />
      )}
    </div>
  );
}

export default function PerformancePage() {
  return (
    <RBACGuard minRole="diretoria">
      <PerformanceContent />
    </RBACGuard>
  );
}
