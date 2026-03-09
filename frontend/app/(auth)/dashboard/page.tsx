"use client";

import { useDashboardKPIs, useFounderDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import { computeKPIs } from "@/features/dashboard/services/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared";

import { KPICards } from "@/features/dashboard/components/kpi-cards";
import { WidgetGrid } from "@/features/dashboard/components/widget-grid";
import {
  FOUNDER_WIDGETS,
  GENERAL_WIDGETS,
} from "@/features/dashboard/utils/dashboard-widgets";

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-1 h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}

function FounderDashboard() {
  const { data, isLoading, error, refetch } = useFounderDashboard();
  const kpis = data ? computeKPIs(data) : undefined;

  if (isLoading || !data) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard Executivo
        </h1>
        <p className="text-gray-500">
          Visao completa do negocio — financeiro, projetos, OKRs e alertas.
        </p>
      </div>

      {kpis && <KPICards kpis={kpis} />}

      <WidgetGrid
        widgets={FOUNDER_WIDGETS}
        data={data}
        view="founder"
      />
    </div>
  );
}

function GeneralDashboard() {
  const { data: kpis, rawData, isLoading, error, refetch } = useDashboardKPIs();

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">
          Visao geral do seu workspace.
        </p>
      </div>

      {kpis && <KPICards kpis={kpis} />}

      {rawData && (
        <WidgetGrid
          widgets={GENERAL_WIDGETS}
          data={rawData}
          view="general"
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const role = useAuthStore((s) => s.role);

  // Founder + Diretoria see the executive dashboard; everyone else sees general
  if (hasMinRole(role, "diretoria")) {
    return <FounderDashboard />;
  }

  return <GeneralDashboard />;
}
