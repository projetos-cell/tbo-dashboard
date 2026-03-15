"use client";

import { useState, useMemo, useCallback } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCircle,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  isPast,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useProjectTasks } from "@/features/projects/hooks/use-project-tasks";
import { TaskContextMenu } from "@/features/tasks/components/task-context-menu";
import { TASK_STATUS, type TaskStatusKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface ProjectCalendarProps {
  projectId: string;
  onSelectTask: (taskId: string) => void;
}

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function ProjectCalendar({ projectId, onSelectTask }: ProjectCalendarProps) {
  const { parents, isLoading } = useProjectTasks(projectId);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Group tasks by due_date (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskRow[]>();
    for (const task of parents) {
      if (!task.due_date) continue;
      const key = task.due_date.split("T")[0];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    }
    return map;
  }, [parents]);

  const handlePrev = useCallback(() => setCurrentMonth((m) => subMonths(m, 1)), []);
  const handleNext = useCallback(() => setCurrentMonth((m) => addMonths(m, 1)), []);
  const handleToday = useCallback(() => setCurrentMonth(new Date()), []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={handleToday} className="text-xs">
            Hoje
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrev}>
            <IconChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNext}>
            <IconChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-lg border border-border/60">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border/60 bg-muted/40">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate.get(dateKey) ?? [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={dateKey}
                className={cn(
                  "min-h-[100px] border-b border-r border-border/30 p-1.5 transition-colors",
                  !inMonth && "bg-muted/20",
                  today && "bg-blue-50/50 dark:bg-blue-950/20",
                )}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      !inMonth && "text-muted-foreground/50",
                      today &&
                        "flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Tasks */}
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <CalendarTask
                      key={task.id}
                      task={task}
                      onClick={() => onSelectTask(task.id)}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="block text-[10px] text-muted-foreground px-1">
                      +{dayTasks.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Task Chip ──────────────────────────────────────────────────────

function CalendarTask({
  task,
  onClick,
}: {
  task: TaskRow;
  onClick: () => void;
}) {
  const statusConfig = TASK_STATUS[task.status as TaskStatusKey];
  const done = !!task.is_completed;
  const overdue =
    !done &&
    task.due_date &&
    isPast(new Date(task.due_date)) &&
    !isToday(new Date(task.due_date));

  return (
    <TaskContextMenu task={task} onSelect={() => onClick()}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className={cn(
              "flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[10px] leading-tight transition-colors hover:bg-accent/50",
              overdue && "text-red-600",
              done && "text-muted-foreground line-through",
            )}
            style={
              statusConfig
                ? { borderLeft: `2px solid ${statusConfig.color}` }
                : undefined
            }
          >
            {done ? (
              <IconCircleCheck className="size-2.5 shrink-0 text-green-500" />
            ) : (
              <IconCircle className="size-2.5 shrink-0 text-muted-foreground/40" />
            )}
            <span className="truncate">{task.title}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[200px]">
          <p className="font-medium">{task.title}</p>
          {statusConfig && (
            <p className="text-muted-foreground">{statusConfig.label}</p>
          )}
          {task.assignee_name && (
            <p className="text-muted-foreground">{task.assignee_name}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TaskContextMenu>
  );
}
