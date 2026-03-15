"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { useProjectActivity } from "@/hooks/use-activity";
import { useProjectTaskStats, useProjectTasks } from "@/features/projects/hooks/use-project-tasks";
import { ProjectKpiCards } from "./project-kpi-cards";
import { ProjectStatusChart } from "./project-status-chart";
import { ProjectPriorityChart } from "./project-priority-chart";
import { ProjectCompletionRing } from "./project-completion-ring";
import { ProjectUpcomingDeadlines } from "./project-upcoming-deadlines";

interface ProjectOverviewProps {
  projectId: string;
}

export function ProjectOverview({ projectId }: ProjectOverviewProps) {
  const { data: stats, isLoading: statsLoading } = useProjectTaskStats(projectId);
  const { allTasks, isLoading: tasksLoading } = useProjectTasks(projectId);
  const { data: activities, isLoading: activityLoading } = useProjectActivity(projectId, 10);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <ProjectKpiCards stats={stats} loading={statsLoading} />

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ProjectStatusChart stats={stats} loading={statsLoading} />
        <ProjectPriorityChart stats={stats} loading={statsLoading} />
        <ProjectCompletionRing stats={stats} loading={statsLoading} />
      </div>

      {/* Upcoming deadlines */}
      <ProjectUpcomingDeadlines tasks={allTasks} loading={tasksLoading} />

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Atividade recente</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed
            activities={activities || []}
            isLoading={activityLoading}
            emptyMessage="Nenhuma atividade recente"
          />
        </CardContent>
      </Card>
    </div>
  );
}
