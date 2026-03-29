"use client";

import {
  IconLayoutList,
  IconCircleCheck,
  IconPlayerPlay,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface OverviewKpiRowProps {
  stats: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    inProgressTasks: number;
  } | null;
  progressPercent: number;
}

const KPI_CONFIG = [
  {
    key: "totalTasks" as const,
    label: "Total",
    icon: IconLayoutList,
    color: "text-foreground",
    bg: "bg-muted",
  },
  {
    key: "completedTasks" as const,
    label: "Concluidas",
    icon: IconCircleCheck,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
  {
    key: "inProgressTasks" as const,
    label: "Em Progresso",
    icon: IconPlayerPlay,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    key: "overdueTasks" as const,
    label: "Atrasadas",
    icon: IconAlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
] as const;

export function OverviewKpiRow({ stats, progressPercent }: OverviewKpiRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {KPI_CONFIG.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="flex items-center gap-3 rounded-lg border border-border/40 bg-background px-4 py-3"
        >
          <div className={cn("flex size-8 items-center justify-center rounded-md", bg)}>
            <Icon className={cn("size-4", color)} />
          </div>
          <div className="min-w-0">
            <p className={cn("text-lg font-semibold tabular-nums leading-none", color)}>
              {stats?.[key] ?? 0}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
