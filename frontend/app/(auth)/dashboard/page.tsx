"use client";

import { Suspense } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import {
  useDashboardKPIs,
  useFounderDashboard,
} from "@/features/dashboard/hooks/use-dashboard";
import { KPICards } from "@/features/dashboard/components/kpi-cards";
import { WidgetGrid } from "@/features/dashboard/components/widget-grid";
import {
  FOUNDER_WIDGETS,
  GENERAL_WIDGETS,
} from "@/features/dashboard/utils/dashboard-widgets";
import { DynamicGreeting } from "@/components/modules/academy/DynamicGreeting";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function FounderDashboard() {
  const { data, isLoading } = useFounderDashboard();
  const { data: kpis } = useDashboardKPIs();

  if (isLoading || !data) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {kpis && <KPICards kpis={kpis} />}
      <WidgetGrid
        widgets={[...FOUNDER_WIDGETS, ...GENERAL_WIDGETS]}
        data={data}
        view="founder"
      />
    </div>
  );
}

function GeneralDashboard() {
  const { data: kpis, rawData, isLoading } = useDashboardKPIs();

  if (isLoading || !rawData) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {kpis && <KPICards kpis={kpis} />}
      <WidgetGrid
        widgets={GENERAL_WIDGETS}
        data={rawData}
        view="general"
      />
    </div>
  );
}

export default function DashboardPage() {
  const role = useAuthStore((s) => s.role);
  const isFounderOrDiretoria = hasMinRole(role, "diretoria");

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-6 p-6">
        {/* Greeting */}
        <div>
          <DynamicGreeting />
          <p className="mt-1 text-sm text-muted-foreground">
            {isFounderOrDiretoria
              ? "Visao executiva da TBO"
              : "Suas tarefas, projetos e agenda"}
          </p>
        </div>

        {/* Role-based dashboard */}
        <Suspense fallback={<DashboardSkeleton />}>
          {isFounderOrDiretoria ? <FounderDashboard /> : <GeneralDashboard />}
        </Suspense>
      </div>
    </div>
  );
}
