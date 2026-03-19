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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

const RevenueConcentrationChart = dynamic(
  () =>
    import(
      "@/features/financeiro/components/revenue-concentration-chart"
    ).then((m) => ({ default: m.RevenueConcentrationChart })),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[220px] w-full rounded-xl" />
    ),
  }
);

function PerformanceContent() {
  const [period, setPeriod] = usePersistedPeriod("ytd");
  const { data: d, isLoading, isError, error, refetch } = useFounderDashboard(period);

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
        <div className="flex items-center gap-2">
          {isError && (
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <IconRefresh className="size-3.5 mr-1.5" />
              Tentar novamente
            </Button>
          )}
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
          <IconAlertCircle className="size-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Erro ao carregar dados de performance
            </p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">
              {(error as Error)?.message || "Verifique a conexão e tente novamente."}
            </p>
          </div>
        </div>
      )}

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
        <Skeleton className="h-[300px] w-full rounded-xl" />
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
