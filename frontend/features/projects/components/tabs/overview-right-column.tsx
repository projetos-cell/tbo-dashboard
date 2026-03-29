"use client";

import { useState, useCallback, useMemo } from "react";
import { IconArrowRight, IconEye, IconAlertTriangle, IconPlayerPlay, IconCalendar } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUpdateProject } from "@/features/projects/hooks/use-projects";
import { WORKFLOW_STAGE_CONFIG } from "@/features/review/constants";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { OverviewResourcesSection } from "./overview-resources-section";
import { StatusProgressCard, AiSummaryCard } from "./overview-status-card";

interface SectionProgress {
  id: string;
  title: string;
  color: string | null;
  total: number;
  completed: number;
  percent: number;
}

interface RecentActivityTask {
  id: string;
  title: string | null;
  assignee_name: string | null;
  due_date: string | null;
  status: string | null;
  _variant: "overdue" | "progress" | "upcoming";
}

interface ReviewProject {
  id: string;
  name: string;
  workflow_stage: string;
}

interface ProjectData {
  status: string | null;
  notes: string | null;
  due_date_start: string | null;
  due_date_end: string | null;
  name: string;
}

interface OverviewRightColumnProps {
  projectId: string;
  project: ProjectData | null;
  stats: { totalTasks: number; completedTasks: number; overdueTasks: number; inProgressTasks: number } | null;
  progressPercent: number;
  sectionProgress: SectionProgress[];
  recentActivity: RecentActivityTask[];
  reviewProjects: ReviewProject[] | undefined;
  allTasks: Array<{
    title: string | null;
    status: string | null;
    assignee_name: string | null;
    due_date: string | null;
  }> | null;
}

export function OverviewRightColumn({
  projectId, project, stats, progressPercent, sectionProgress, recentActivity, reviewProjects, allTasks,
}: OverviewRightColumnProps) {
  const router = useRouter();
  const updateProject = useUpdateProject();

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  function handleStatusChange(status: string) {
    updateProject.mutate({ id: projectId, updates: { status } as never });
  }

  const handleGenerateSummary = useCallback(async () => {
    if (!project || !allTasks) return;
    setAiSummaryLoading(true);
    try {
      const res = await fetch("/api/ai/project-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: project.name,
          context: {
            totalTasks: stats?.totalTasks ?? 0, completedTasks: stats?.completedTasks ?? 0,
            overdueTasks: stats?.overdueTasks ?? 0, inProgressTasks: stats?.inProgressTasks ?? 0,
            recentTasks: allTasks.slice(0, 15).map((t) => ({
              title: t.title, status: t.status, assignee: t.assignee_name, due_date: t.due_date,
            })),
          },
        }),
      });
      const data = (await res.json()) as { summary?: string; error?: string };
      if (data.summary) setAiSummary(data.summary);
    } catch { /* silent */ } finally { setAiSummaryLoading(false); }
  }, [project, allTasks, stats]);

  const statusCfg = PROJECT_STATUS[project?.status as ProjectStatusKey];
  const daysLeft = project?.due_date_end
    ? differenceInDays(new Date(project.due_date_end), new Date()) : null;

  return (
    <div className="space-y-4">
      <StatusProgressCard
        statusCfg={statusCfg} projectStatus={project?.status ?? null}
        onStatusChange={handleStatusChange} progressPercent={progressPercent}
        stats={stats} sectionProgress={sectionProgress}
        project={project} daysLeft={daysLeft}
      />
      <AiSummaryCard aiSummary={aiSummary} aiSummaryLoading={aiSummaryLoading} onGenerate={handleGenerateSummary} />
      <OverviewResourcesSection projectId={projectId} />

      {/* Atividade Recente — agrupada por tipo */}
      <RecentActivityCard recentActivity={recentActivity} />

      {/* Creative Review */}
      {reviewProjects && reviewProjects.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <IconEye className="h-4 w-4" /> Creative Review
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => router.push("/review")}>
                Ver todos <IconArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reviewProjects.map((rp) => {
                const stageConfig = WORKFLOW_STAGE_CONFIG[rp.workflow_stage as keyof typeof WORKFLOW_STAGE_CONFIG];
                return (
                  <button key={rp.id} type="button"
                    className="w-full flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                    onClick={() => router.push(`/review/${rp.id}`)}>
                    <span className="font-medium truncate">{rp.name}</span>
                    <Badge variant="secondary" className="ml-2 shrink-0 text-xs"
                      style={{ backgroundColor: stageConfig?.color + "20", color: stageConfig?.color }}>
                      {stageConfig?.label ?? rp.workflow_stage}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const ACTIVITY_GROUP_CONFIG = {
  overdue: {
    label: "Atrasadas",
    icon: IconAlertTriangle,
    dotColor: "bg-red-500",
    textColor: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/20",
  },
  progress: {
    label: "Em andamento",
    icon: IconPlayerPlay,
    dotColor: "bg-blue-500",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
  },
  upcoming: {
    label: "Proximas",
    icon: IconCalendar,
    dotColor: "bg-amber-500",
    textColor: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
  },
} as const;

function RecentActivityCard({ recentActivity }: { recentActivity: RecentActivityTask[] }) {
  const grouped = useMemo(() => {
    const groups: Record<string, RecentActivityTask[]> = {};
    for (const task of recentActivity) {
      const key = task._variant;
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    }
    return groups;
  }, [recentActivity]);

  const groupOrder = ["overdue", "progress", "upcoming"] as const;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <IconArrowRight className="size-4 text-muted-foreground" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {groupOrder.map((variant) => {
              const tasks = grouped[variant];
              if (!tasks || tasks.length === 0) return null;
              const cfg = ACTIVITY_GROUP_CONFIG[variant];
              const GroupIcon = cfg.icon;
              return (
                <div key={variant} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <GroupIcon className={cn("size-3.5", cfg.textColor)} />
                    <span className={cn("text-xs font-medium", cfg.textColor)}>
                      {cfg.label} ({tasks.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/50">
                        <div className={cn("size-1.5 shrink-0 rounded-full", cfg.dotColor)} />
                        <span className="flex-1 truncate text-foreground">{task.title ?? "Sem titulo"}</span>
                        {task.assignee_name && (
                          <span className="shrink-0 text-muted-foreground">{task.assignee_name.split(" ")[0]}</span>
                        )}
                        {task.due_date && (
                          <span className={cn("shrink-0 tabular-nums", variant === "overdue" ? "font-medium text-red-600" : "text-muted-foreground")}>
                            {format(new Date(task.due_date), "dd MMM", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    ))}
                    {tasks.length > 3 && (
                      <p className="px-2.5 text-[11px] text-muted-foreground">
                        +{tasks.length - 3} {tasks.length - 3 === 1 ? "tarefa" : "tarefas"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Nenhuma atividade recente.</p>
        )}
      </CardContent>
    </Card>
  );
}
