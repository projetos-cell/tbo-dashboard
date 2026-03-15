"use client";

import {
  IconLayoutList,
  IconCircleCheck,
  IconPlayerPlay,
  IconAlertTriangle,
  IconLock,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProjectTaskStats } from "@/features/projects/services/project-tasks";

interface ProjectKpiCardsProps {
  stats?: ProjectTaskStats | null;
  loading?: boolean;
}

const KPI_CONFIG = [
  { key: "totalTasks" as const, label: "Total", icon: IconLayoutList, color: "text-foreground" },
  { key: "completedTasks" as const, label: "Concluídas", icon: IconCircleCheck, color: "text-green-600" },
  { key: "inProgressTasks" as const, label: "Em Progresso", icon: IconPlayerPlay, color: "text-blue-600" },
  { key: "overdueTasks" as const, label: "Atrasadas", icon: IconAlertTriangle, color: "text-red-600" },
  { key: "blockedTasks" as const, label: "Bloqueadas", icon: IconLock, color: "text-amber-600" },
] as const;

export function ProjectKpiCards({ stats, loading }: ProjectKpiCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      {KPI_CONFIG.map(({ key, label, icon: Icon, color }) => (
        <Card key={key}>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="rounded-md bg-muted p-2">
              <Icon className={`size-4 ${color}`} />
            </div>
            <div>
              {loading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <p className={`text-2xl font-bold ${color}`}>
                  {stats?.[key] ?? 0}
                </p>
              )}
              <p className="text-muted-foreground text-xs">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
