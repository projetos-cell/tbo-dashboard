"use client";

import { useState, useCallback } from "react";
import { IconArrowRight, IconEye } from "@tabler/icons-react";
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
import { StatusProgressCard, PeriodCard, AiSummaryCard } from "./overview-status-card";

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
      />
      <PeriodCard project={project} daysLeft={daysLeft} />
      <AiSummaryCard aiSummary={aiSummary} aiSummaryLoading={aiSummaryLoading} onGenerate={handleGenerateSummary} />
      <OverviewResourcesSection projectId={projectId} />

      {/* Atividade Recente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((task) => (
                <OverviewTaskRow key={task.id} task={task} variant={task._variant} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nenhuma atividade recente neste projeto.</p>
          )}
        </CardContent>
      </Card>

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

function OverviewTaskRow({ task, variant }: {
  task: { id: string; title: string | null; assignee_name: string | null; due_date: string | null };
  variant: "overdue" | "progress" | "upcoming";
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold",
        variant === "overdue" && "bg-red-100 text-red-700",
        variant === "progress" && "bg-blue-100 text-blue-700",
        variant === "upcoming" && "bg-amber-100 text-amber-700",
      )}>
        {task.assignee_name ? task.assignee_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() : "?"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold">{task.assignee_name?.split(" ")[0] ?? "Alguem"}</span>{" "}
          <span className="text-muted-foreground">
            {variant === "overdue" && "tem tarefa atrasada"}
            {variant === "progress" && "esta trabalhando em"}
            {variant === "upcoming" && "tem tarefa proxima"}
          </span>
        </p>
        <p className="text-xs text-muted-foreground truncate">{task.title}</p>
      </div>
      {task.due_date && (
        <span className={cn("text-xs shrink-0", variant === "overdue" ? "text-red-600 font-medium" : "text-muted-foreground")}>
          {format(new Date(task.due_date), "dd MMM", { locale: ptBR })}
        </span>
      )}
    </div>
  );
}
