"use client";

import { Suspense } from "react";
import { RBACGuard } from "@/components/rbac-guard";
import { useFounderDashboard } from "@/features/founder-dashboard/hooks/use-founder-dashboard";
import { PeriodFilter } from "@/features/founder-dashboard/components/period-filter";
import { usePersistedPeriod } from "@/hooks/use-persisted-period";
import { UnitRevenueTable } from "@/features/founder-dashboard/components/unit-revenue-table";
import { TopProjectsTable } from "@/features/founder-dashboard/components/top-projects-table";
import { RevenueConcentration } from "@/features/founder-dashboard/components/revenue-concentration";

function PerformanceContent() {
  const [period, setPeriod] = usePersistedPeriod("ytd");
  const { data: d, isLoading } = useFounderDashboard(period);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
          <p className="text-sm text-muted-foreground">
            Receita por BU, concentração e projetos de maior margem.
          </p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <UnitRevenueTable data={d?.unitRevenue ?? []} isLoading={isLoading} />
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
  );
}

export default function PerformancePage() {
  return (
    <RBACGuard minRole="diretoria">
      <PerformanceContent />
    </RBACGuard>
  );
}
