"use client";

import { useMemo } from "react";
import {
  IconGlobe,
  IconCheck,
  IconClock,
  IconFile,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProjectTasks } from "@/features/projects/hooks/use-project-tasks";
import { useProjectStatusUpdates } from "@/features/projects/hooks/use-project-status-updates";
import { PROJECT_HEALTH } from "@/lib/constants";
import { computeProjectHealth, type ProjectHealthKey } from "@/lib/constants";
import { isPast, isToday } from "date-fns";
import { EmptyState } from "@/components/shared";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface ProjectPortalProps {
  projectId: string;
  projectName?: string;
}

export function ProjectPortal({ projectId, projectName }: ProjectPortalProps) {
  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks(projectId);
  const { data: updates = [], isLoading: updatesLoading } = useProjectStatusUpdates(projectId);

  // Calculate stats
  const stats = useMemo(() => {
    const total = tasks.filter((t) => !t.parent_id).length;
    const completed = tasks.filter(
      (t) => !t.parent_id && t.is_completed,
    ).length;
    const overdue = tasks.filter(
      (t) =>
        !t.parent_id &&
        !t.is_completed &&
        t.due_date &&
        isPast(new Date(t.due_date + "T23:59:59")) &&
        !isToday(new Date(t.due_date + "T00:00:00")),
    ).length;
    const inProgress = tasks.filter(
      (t) => !t.parent_id && t.status === "em_andamento",
    ).length;
    const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const health = computeProjectHealth({ total, overdue });

    return { total, completed, overdue, inProgress, progressPct, health };
  }, [tasks]);

  // Client-visible tasks: tasks that are completed or in review
  const visibleTasks = useMemo(
    () =>
      tasks
        .filter(
          (t) =>
            !t.parent_id &&
            (t.status === "concluida" || t.status === "revisao" || t.status === "em_andamento"),
        )
        .sort((a, b) => {
          // Completed first, then by date
          if (a.is_completed && !b.is_completed) return -1;
          if (!a.is_completed && b.is_completed) return 1;
          return (b.updated_at ?? "").localeCompare(a.updated_at ?? "");
        })
        .slice(0, 20),
    [tasks],
  );

  const latestUpdate = updates[0];
  const healthConf = PROJECT_HEALTH[stats.health];

  if (tasksLoading || updatesLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <IconGlobe className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Portal do Cliente</h2>
          <p className="text-sm text-muted-foreground">
            Visao do cliente sobre o progresso do projeto
            {projectName ? ` "${projectName}"` : ""}
          </p>
        </div>
      </div>

      {/* Progress overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Progresso Geral</CardTitle>
            <Badge
              variant="outline"
              style={{
                borderColor: healthConf.color,
                color: healthConf.color,
                backgroundColor: healthConf.bg,
              }}
            >
              {healthConf.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {stats.completed} de {stats.total} tarefas concluidas
              </span>
              <span className="font-semibold">{stats.progressPct}%</span>
            </div>
            <Progress value={stats.progressPct} className="h-2.5" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Total" value={stats.total} icon={IconFile} />
            <StatCard
              label="Concluidas"
              value={stats.completed}
              icon={IconCheck}
              color="#22c55e"
            />
            <StatCard
              label="Em Andamento"
              value={stats.inProgress}
              icon={IconClock}
              color="#3b82f6"
            />
            <StatCard
              label="Atrasadas"
              value={stats.overdue}
              icon={IconClock}
              color="#ef4444"
            />
          </div>
        </CardContent>
      </Card>

      {/* Latest status update */}
      {latestUpdate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <IconSpeakerphone className="size-4" />
              Ultimo Update
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <Badge
                variant="outline"
                style={{
                  borderColor:
                    PROJECT_HEALTH[latestUpdate.health as ProjectHealthKey]?.color,
                  color:
                    PROJECT_HEALTH[latestUpdate.health as ProjectHealthKey]?.color,
                  backgroundColor:
                    PROJECT_HEALTH[latestUpdate.health as ProjectHealthKey]?.bg,
                }}
              >
                {PROJECT_HEALTH[latestUpdate.health as ProjectHealthKey]?.label}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{latestUpdate.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(latestUpdate.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Visible tasks (deliverables) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Entregas
        </h3>
        {visibleTasks.length === 0 ? (
          <EmptyState
            title="Nenhuma entrega visivel"
            description="Tarefas em andamento, revisao ou concluidas aparecerao aqui."
            compact
          />
        ) : (
          <div className="space-y-1.5">
            {visibleTasks.map((task) => (
              <PortalTaskRow key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-3 text-center">
      <Icon className="mx-auto mb-1 size-4 text-muted-foreground" />
      <p className="text-xl font-bold" style={color ? { color } : undefined}>
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function PortalTaskRow({ task }: { task: TaskRow }) {
  const isCompleted = task.is_completed;
  const dueDate = task.due_date
    ? new Date(task.due_date + "T00:00:00").toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
    : null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 px-3 py-2.5 transition-colors hover:bg-accent/30">
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
          isCompleted
            ? "border-green-500 bg-green-500 text-white"
            : "border-muted-foreground/30"
        }`}
      >
        {isCompleted && <IconCheck className="size-3" />}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm ${isCompleted ? "line-through text-muted-foreground" : ""}`}
        >
          {task.title}
        </p>
      </div>
      {task.status && !isCompleted && (
        <Badge variant="outline" className="text-[10px]">
          {task.status === "em_andamento"
            ? "Em Andamento"
            : task.status === "revisao"
              ? "Revisao"
              : task.status}
        </Badge>
      )}
      {dueDate && (
        <span className="text-xs text-muted-foreground">{dueDate}</span>
      )}
    </div>
  );
}
