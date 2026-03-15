"use client";

import { useMemo } from "react";
import { IconCalendar, IconUser } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TASK_PRIORITY, type TaskPriorityKey } from "@/lib/constants";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface ProjectUpcomingDeadlinesProps {
  tasks: TaskRow[];
  loading?: boolean;
  limit?: number;
}

export function ProjectUpcomingDeadlines({
  tasks,
  loading,
  limit = 7,
}: ProjectUpcomingDeadlinesProps) {
  const upcoming = useMemo(() => {
    return tasks
      .filter((t) => !t.is_completed && !t.parent_id && t.due_date)
      .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
      .slice(0, limit);
  }, [tasks, limit]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Próximos Prazos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (upcoming.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Próximos Prazos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-4 text-center text-sm">
            Nenhuma tarefa com prazo pendente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Próximos Prazos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {upcoming.map((task) => {
          const due = new Date(task.due_date!);
          const overdue = isPast(due) && !isToday(due);
          const today = isToday(due);
          const priorityConfig = task.priority
            ? TASK_PRIORITY[task.priority as TaskPriorityKey]
            : null;

          return (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50"
            >
              {/* Priority dot */}
              <div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: priorityConfig?.color ?? "#d1d5db" }}
              />

              {/* Title */}
              <span className="flex-1 truncate text-sm">{task.title}</span>

              {/* Assignee */}
              {task.assignee_name && (
                <span className="text-muted-foreground hidden items-center gap-1 text-xs sm:flex">
                  <IconUser className="h-3 w-3" />
                  {task.assignee_name}
                </span>
              )}

              {/* Date */}
              <Badge
                variant="outline"
                className={
                  overdue
                    ? "border-red-200 bg-red-50 text-red-700"
                    : today
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : ""
                }
              >
                <IconCalendar className="mr-1 h-3 w-3" />
                {format(due, "dd MMM", { locale: ptBR })}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
