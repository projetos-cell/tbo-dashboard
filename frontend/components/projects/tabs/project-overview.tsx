"use client";

import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  LayoutList,
  Paperclip,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { useProjectActivity } from "@/hooks/use-activity";
import type { ProjectStats } from "@/services/projects";

interface ProjectOverviewProps {
  projectId: string;
  stats?: ProjectStats | null;
  statsLoading?: boolean;
}

export function ProjectOverview({
  projectId,
  stats,
  statsLoading,
}: ProjectOverviewProps) {
  const { data: activities, isLoading: activityLoading } =
    useProjectActivity(projectId, 10);

  const completionPct =
    stats && stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={LayoutList}
          label="Total de tarefas"
          value={stats?.totalTasks}
          loading={statsLoading}
        />
        <StatCard
          icon={CheckCircle2}
          label="Concluídas"
          value={stats?.completedTasks}
          loading={statsLoading}
          color="text-green-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Atrasadas"
          value={stats?.overdueTasks}
          loading={statsLoading}
          color="text-red-600"
        />
        <StatCard
          icon={Paperclip}
          label="Anexos"
          value={stats?.totalAttachments}
          loading={statsLoading}
        />
      </div>

      {/* Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Progresso geral</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <Skeleton className="h-4 w-full" />
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {stats?.completedTasks || 0} de {stats?.totalTasks || 0}{" "}
                  tarefas
                </span>
                <span className="font-medium">{completionPct}%</span>
              </div>
              <Progress value={completionPct} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Atividade recente
          </CardTitle>
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

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value?: number;
  loading?: boolean;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-4">
        <div className="rounded-md bg-muted p-2">
          <Icon className={`size-4 ${color || "text-muted-foreground"}`} />
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-6 w-8" />
          ) : (
            <p className={`text-2xl font-bold ${color || ""}`}>
              {value ?? 0}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
