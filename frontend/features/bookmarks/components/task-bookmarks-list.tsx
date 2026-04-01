"use client";

import { useRouter } from "next/navigation";
import { IconBookmark, IconCheck, IconCircle, IconCalendar, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  useBookmarkedTasks,
  useToggleTaskBookmark,
  type BookmarkedTask,
} from "@/features/bookmarks/hooks/use-task-bookmarks";
import { TASK_STATUS, TASK_PRIORITY, type TaskStatusKey } from "@/lib/constants";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

function TaskBookmarkRow({ task }: { task: BookmarkedTask }) {
  const router = useRouter();
  const toggleBookmark = useToggleTaskBookmark();

  const statusCfg = TASK_STATUS[task.status as TaskStatusKey];
  const priorityCfg = TASK_PRIORITY[task.priority as keyof typeof TASK_PRIORITY];

  const overdue =
    task.due_date &&
    !task.is_completed &&
    isPast(new Date(task.due_date + "T23:59:59"));

  function navigateToTask() {
    if (task.project_id) {
      router.push(`/projetos/${task.project_id}?task=${task.id}`);
    }
  }

  return (
    <div
      className="group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all hover:shadow-sm cursor-pointer"
      onClick={navigateToTask}
    >
      {/* Complete icon */}
      <div className="shrink-0">
        {task.is_completed ? (
          <IconCheck className="h-4 w-4 text-green-600" />
        ) : (
          <IconCircle className="h-4 w-4 text-muted-foreground/40" />
        )}
      </div>

      {/* Title + meta */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium",
            task.is_completed && "line-through opacity-60",
          )}
        >
          {task.title}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          {task.project_name && (
            <span className="text-xs text-muted-foreground">{task.project_name}</span>
          )}
          {task.due_date && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs text-muted-foreground",
                overdue && "text-red-600",
              )}
            >
              <IconCalendar className="h-3 w-3" />
              {format(new Date(task.due_date + "T12:00:00"), "dd MMM", { locale: ptBR })}
            </span>
          )}
        </div>
      </div>

      {/* Status + priority badges */}
      <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
        {statusCfg && (
          <Badge
            variant="secondary"
            className="h-5 gap-1 px-1.5 text-[10px]"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
          >
            {statusCfg.label}
          </Badge>
        )}
        {priorityCfg && (
          <Badge
            variant="secondary"
            className="h-5 gap-1 px-1.5 text-[10px]"
            style={{ backgroundColor: priorityCfg.bg, color: priorityCfg.color }}
          >
            {priorityCfg.label}
          </Badge>
        )}
      </div>

      {/* Remove bookmark */}
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          toggleBookmark.mutate({ taskId: task.id, isBookmarked: true });
        }}
        title="Remover dos favoritos"
        aria-label="Remover dos favoritos"
      >
        <IconX className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}

export function TaskBookmarksList() {
  const { data: tasks, isLoading } = useBookmarkedTasks();

  if (isLoading) {
    return (
      <div className="mt-4 flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <IconBookmark className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">Nenhuma tarefa favorita ainda</p>
        <p className="text-xs text-muted-foreground/70">
          Clique no ícone de favorito em qualquer tarefa para salvar aqui
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskBookmarkRow key={task.id} task={task} />
      ))}
    </div>
  );
}
