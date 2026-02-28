"use client";

import { useDashboardKPIs } from "@/hooks/use-dashboard";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { ProjectsOverview } from "@/components/dashboard/projects-overview";
import { TasksOverview } from "@/components/dashboard/tasks-overview";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: kpis, rawData, isLoading } = useDashboardKPIs();

  if (isLoading) {
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
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visao geral do seu workspace.
        </p>
      </div>

      {kpis && <KPICards kpis={kpis} />}

      <div className="grid gap-6 lg:grid-cols-2">
        {rawData && <ProjectsOverview projects={rawData.projects} />}
        {rawData && <TasksOverview tasks={rawData.tasks} />}
      </div>
    </div>
  );
}
