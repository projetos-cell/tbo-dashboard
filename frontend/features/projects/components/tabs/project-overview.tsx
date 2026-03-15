"use client";

import { useMemo } from "react";
import {
  IconCircleCheck,
  IconPlayerPlay,
  IconAlertTriangle,
  IconCalendar,
  IconUser,
  IconClipboardList,
  IconProgress,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProject } from "@/features/projects/hooks/use-projects";
import { useProjectTasks, useProjectSections, useProjectTaskStats } from "@/features/projects/hooks/use-project-tasks";
import { useProfiles } from "@/features/people/hooks/use-people";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
import { parseBus } from "@/features/projects/utils/parse-bus";
import { format, differenceInDays, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ProjectOverviewProps {
  projectId: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function ProjectOverview({ projectId }: ProjectOverviewProps) {
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: stats, isLoading: statsLoading } = useProjectTaskStats(projectId);
  const { allTasks, isLoading: tasksLoading } = useProjectTasks(projectId);
  const { data: sections } = useProjectSections(projectId);
  const { data: profiles } = useProfiles();

  const isLoading = projectLoading || statsLoading || tasksLoading;

  // Compute progress percentage
  const progressPercent = useMemo(() => {
    if (!stats || stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  }, [stats]);

  // Upcoming/overdue tasks (next 7 days + overdue)
  const keyTasks = useMemo(() => {
    if (!allTasks) return { overdue: [], upcoming: [], inProgress: [] };
    const now = new Date();
    const nowStr = now.toISOString().split("T")[0];
    const weekAhead = new Date(now);
    weekAhead.setDate(weekAhead.getDate() + 7);
    const weekStr = weekAhead.toISOString().split("T")[0];

    const overdue = allTasks.filter(
      (t) => !t.is_completed && !t.parent_id && t.due_date && t.due_date < nowStr
    );
    const upcoming = allTasks.filter(
      (t) => !t.is_completed && !t.parent_id && t.due_date && t.due_date >= nowStr && t.due_date <= weekStr
    );
    const inProgress = allTasks.filter(
      (t) => !t.is_completed && !t.parent_id && (t.status === "em_andamento" || t.status === "revisao")
    );

    return { overdue, upcoming, inProgress };
  }, [allTasks]);

  // Section progress
  const sectionProgress = useMemo(() => {
    if (!sections || !allTasks) return [];
    return sections.map((section) => {
      const sectionTasks = allTasks.filter((t) => t.section_id === section.id && !t.parent_id);
      const completed = sectionTasks.filter((t) => t.is_completed).length;
      const total = sectionTasks.length;
      return {
        ...section,
        total,
        completed,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [sections, allTasks]);

  // Team members working on this project
  const teamMembers = useMemo(() => {
    if (!allTasks || !profiles) return [];
    const assigneeIds = new Set<string>();
    for (const t of allTasks) {
      if (t.assignee_id) assigneeIds.add(t.assignee_id);
    }
    return profiles.filter((p) => assigneeIds.has(p.id));
  }, [allTasks, profiles]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  const statusCfg = PROJECT_STATUS[project?.status as ProjectStatusKey];
  const busList = parseBus(project?.bus ?? null);
  const daysLeft = project?.due_date_end
    ? differenceInDays(new Date(project.due_date_end), new Date())
    : null;

  return (
    <div className="space-y-6">
      {/* ── Project Summary ─────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Progress Card */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-primary/10 p-1.5">
                  <IconProgress className="size-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Progresso</span>
              </div>
              <span className="text-2xl font-bold text-primary">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-muted-foreground text-xs mt-2">
              {stats?.completedTasks ?? 0} de {stats?.totalTasks ?? 0} tarefas concluídas
            </p>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-md bg-muted p-1.5">
                <IconClipboardList className="size-4 text-foreground" />
              </div>
              <span className="text-sm font-medium">Status</span>
            </div>
            <div className="space-y-2">
              {statusCfg && (
                <Badge
                  className="text-xs gap-1.5"
                  style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                >
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: statusCfg.color }} />
                  {statusCfg.label}
                </Badge>
              )}
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <IconPlayerPlay className="size-3 text-blue-500" />
                  {stats?.inProgressTasks ?? 0} em progresso
                </span>
                <span className="flex items-center gap-1">
                  <IconAlertTriangle className="size-3 text-red-500" />
                  {stats?.overdueTasks ?? 0} atrasadas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Card */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-md bg-muted p-1.5">
                <IconCalendar className="size-4 text-foreground" />
              </div>
              <span className="text-sm font-medium">Prazo</span>
            </div>
            <div className="space-y-1.5">
              {project?.due_date_start && project?.due_date_end ? (
                <p className="text-sm font-medium">
                  {format(new Date(project.due_date_start), "dd MMM", { locale: ptBR })}
                  {" → "}
                  {format(new Date(project.due_date_end), "dd MMM yyyy", { locale: ptBR })}
                </p>
              ) : project?.due_date_end ? (
                <p className="text-sm font-medium">
                  Entrega: {format(new Date(project.due_date_end), "dd MMM yyyy", { locale: ptBR })}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Sem prazo definido</p>
              )}
              {daysLeft !== null && (
                <p className={cn(
                  "text-xs font-medium",
                  daysLeft < 0 ? "text-red-600" : daysLeft <= 7 ? "text-amber-600" : "text-green-600"
                )}>
                  {daysLeft < 0
                    ? `${Math.abs(daysLeft)} dias atrasado`
                    : daysLeft === 0
                      ? "Prazo é hoje"
                      : `${daysLeft} dias restantes`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Section Progress ────────────────────────────────────── */}
      {sectionProgress.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Progresso por Seção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectionProgress.map((section) => (
              <div key={section.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {section.color && (
                      <div
                        className="size-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: section.color }}
                      />
                    )}
                    <span className="text-sm font-medium">{section.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {section.completed}/{section.total}
                  </span>
                </div>
                <Progress
                  value={section.percent}
                  className="h-1.5"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Key Tasks: Overdue + In Progress ────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Overdue */}
        {keyTasks.overdue.length > 0 && (
          <Card className="border-red-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600">
                <IconAlertTriangle className="size-4" />
                Tarefas Atrasadas ({keyTasks.overdue.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {keyTasks.overdue.slice(0, 5).map((task) => (
                  <TaskRow key={task.id} task={task} variant="overdue" />
                ))}
                {keyTasks.overdue.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    + {keyTasks.overdue.length - 5} mais
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* In Progress */}
        {keyTasks.inProgress.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600">
                <IconPlayerPlay className="size-4" />
                Em Progresso ({keyTasks.inProgress.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {keyTasks.inProgress.slice(0, 5).map((task) => (
                  <TaskRow key={task.id} task={task} variant="progress" />
                ))}
                {keyTasks.inProgress.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    + {keyTasks.inProgress.length - 5} mais
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming */}
        {keyTasks.upcoming.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <IconCalendar className="size-4 text-amber-600" />
                Próximos 7 dias ({keyTasks.upcoming.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {keyTasks.upcoming.slice(0, 5).map((task) => (
                  <TaskRow key={task.id} task={task} variant="upcoming" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Team ────────────────────────────────────────────────── */}
      {teamMembers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconUser className="size-4" />
              Equipe ({teamMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {teamMembers.map((member) => {
                const memberTasks = allTasks?.filter(
                  (t) => t.assignee_id === member.id && !t.is_completed && !t.parent_id
                ).length ?? 0;
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <Avatar className="size-6">
                      <AvatarImage src={member.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {getInitials(member.full_name ?? "?")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.full_name?.split(" ")[0]}</span>
                    {memberTasks > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {memberTasks} pendentes
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Project Details ─────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Detalhes do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {project?.construtora && (
              <Detail label="Construtora" value={project.construtora} />
            )}
            {project?.owner_name && (
              <Detail label="Responsável" value={project.owner_name} />
            )}
            {project?.value && (
              <Detail
                label="Valor"
                value={new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(project.value))}
              />
            )}
            {project?.priority && (
              <Detail label="Prioridade" value={project.priority} />
            )}
            {busList.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Unidades de Negócio</p>
                <div className="flex flex-wrap gap-1">
                  {busList.map((bu) => (
                    <Badge key={bu} variant="outline" className="text-[11px]">
                      {bu}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {project?.notes && (
              <div className="sm:col-span-2 space-y-1">
                <p className="text-xs text-muted-foreground">Notas</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{project.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Helper Components ──────────────────────────────────────────────── */

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function TaskRow({
  task,
  variant,
}: {
  task: { id: string; title: string | null; assignee_name: string | null; due_date: string | null; status: string | null };
  variant: "overdue" | "progress" | "upcoming";
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
      <div className={cn(
        "size-1.5 rounded-full shrink-0",
        variant === "overdue" && "bg-red-500",
        variant === "progress" && "bg-blue-500",
        variant === "upcoming" && "bg-amber-500",
      )} />
      <span className="flex-1 text-sm truncate">{task.title}</span>
      {task.assignee_name && (
        <span className="text-xs text-muted-foreground truncate max-w-[100px]">
          {task.assignee_name.split(" ")[0]}
        </span>
      )}
      {task.due_date && (
        <span className={cn(
          "text-xs shrink-0",
          variant === "overdue" ? "text-red-600 font-medium" : "text-muted-foreground"
        )}>
          {format(new Date(task.due_date), "dd MMM", { locale: ptBR })}
        </span>
      )}
    </div>
  );
}
