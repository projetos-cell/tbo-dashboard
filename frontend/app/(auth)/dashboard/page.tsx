"use client";

import dynamic from "next/dynamic";
import { useDashboardKPIs, useFounderDashboard } from "@/hooks/use-dashboard";
import { useAuthStore } from "@/stores/auth-store";
import { isAdmin } from "@/lib/permissions";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared";

// Shared components
import { KPICards } from "@/components/dashboard/kpi-cards";
import { ProjectsOverview } from "@/components/dashboard/projects-overview";
import { TasksOverview } from "@/components/dashboard/tasks-overview";

// Founder-only components — FinancialOverview uses recharts (heavy), lazy load
const FinancialOverview = dynamic(
  () => import("@/components/dashboard/founder/financial-overview").then((m) => ({ default: m.FinancialOverview })),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
  }
);
import { PipelineOverview } from "@/components/dashboard/founder/pipeline-overview";
import { ActiveProjects } from "@/components/dashboard/founder/active-projects";
import { UrgentTasks } from "@/components/dashboard/founder/urgent-tasks";
import { OkrSnapshotCard } from "@/components/dashboard/founder/okr-snapshot";
import { AlertsPanel } from "@/components/dashboard/founder/alerts-panel";

// General components
import { QuickActions } from "@/components/dashboard/general/quick-actions";
import { AgendaSummary } from "@/components/dashboard/general/agenda-summary";

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
  const kpis = data
    ? {
        totalProjects: data.projects.length,
        activeProjects: data.projects.filter(
          (p) => !["finalizado", "cancelado"].includes(p.status ?? "")
        ).length,
        completedProjects: data.projects.filter(
          (p) => p.status === "finalizado"
        ).length,
        stoppedProjects: data.projects.filter(
          (p) => p.status === "parado" || p.status === "pausado"
        ).length,
        totalTasks: data.tasks.length,
        pendingTasks: data.tasks.filter(
          (t) => !t.is_completed && t.status !== "cancelada"
        ).length,
        overdueTasks: data.tasks.filter(
          (t) =>
            !t.is_completed &&
            t.due_date &&
            t.due_date < new Date().toISOString().split("T")[0] &&
            t.status !== "cancelada"
        ).length,
        completedTasks: data.tasks.filter((t) => t.is_completed).length,
        totalDemands: data.demands.length,
        uniqueClients: new Set(
          data.projects.map((p) => p.construtora).filter(Boolean)
        ).size,
      }
    : undefined;

  if (isLoading || !data) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard Executivo
        </h1>
        <p className="text-muted-foreground">
          Visao completa do negocio — financeiro, projetos, OKRs e alertas.
        </p>
      </div>

      {/* KPIs row */}
      {kpis && <KPICards kpis={kpis} />}

      {/* Row 1: Financial + Pipeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FinancialOverview entries={data.financial} />
        <PipelineOverview demands={data.demands} />
      </div>

      {/* Row 2: Active Projects + Urgent Tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActiveProjects projects={data.projects} />
        <UrgentTasks tasks={data.tasks} />
      </div>

      {/* Row 3: OKRs + Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <OkrSnapshotCard snapshots={data.okrSnapshots} />
        <AlertsPanel alerts={data.alerts} />
      </div>
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
        <p className="text-muted-foreground">
          Visao geral do seu workspace.
        </p>
      </div>

      {/* KPIs */}
      {kpis && <KPICards kpis={kpis} />}

      {/* Row 1: Projects + Tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {rawData && <ProjectsOverview projects={rawData.projects} />}
        {rawData && <TasksOverview tasks={rawData.tasks} />}
      </div>

      {/* Row 2: Agenda + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AgendaSummary />
        <QuickActions />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const role = useAuthStore((s) => s.role);

  // Founder/Admin see the executive dashboard; everyone else sees general
  if (isAdmin(role)) {
    return <FounderDashboard />;
  }

  return <GeneralDashboard />;
}
