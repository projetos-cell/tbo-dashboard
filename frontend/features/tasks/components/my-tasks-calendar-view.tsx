"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircle,
} from "@tabler/icons-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  getWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TASK_STATUS } from "@/lib/constants";
import { EmptyState } from "@/components/shared";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";

interface MyTasksCalendarViewProps {
  tasks: MyTaskWithSection[];
  onSelect: (task: MyTaskWithSection) => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function MyTasksCalendarView({
  tasks,
  onSelect,
}: MyTasksCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = useMemo(
    () => eachDayOfInterval({ start: calStart, end: calEnd }),
    [calStart, calEnd]
  );

  // Index tasks by due_date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, MyTaskWithSection[]>();
    for (const task of tasks) {
      if (!task.due_date) continue;
      const key = task.due_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    }
    return map;
  }, [tasks]);

  const prevMonth = () => {
    setCurrentDate((d) => {
      const next = new Date(d);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const nextMonth = () => {
    setCurrentDate((d) => {
      const next = new Date(d);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const goToday = () => setCurrentDate(new Date());

  const tasksWithDueDate = useMemo(
    () => tasks.filter((t) => !!t.due_date),
    [tasks]
  );

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={IconCircle}
        title="Nenhuma tarefa"
        description="Quando você tiver tarefas com prazo definido, elas aparecerão no calendário."
      />
    );
  }

  if (tasksWithDueDate.length === 0) {
    return (
      <EmptyState
        icon={IconCircle}
        title="Nenhuma tarefa com prazo"
        description="Defina prazos nas suas tarefas para visualizá-las no calendário."
      />
    );
  }

  // Group days into weeks for week number display
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col gap-3 pt-1">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={prevMonth}
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-semibold capitalize min-w-[140px] text-center">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={nextMonth}
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={goToday}
        >
          Hoje
        </Button>
      </div>

      {/* Grid */}
      <div className="rounded-lg border overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-[40px_repeat(7,1fr)] border-b bg-muted/30">
          {/* Week number header */}
          <div className="py-2 text-center text-[9px] font-medium text-muted-foreground/40">
            S
          </div>
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Week rows */}
        {weeks.map((week, weekIdx) => {
          const weekNum = getWeek(week[0]);
          const isLastWeek = weekIdx === weeks.length - 1;

          return (
            <div
              key={weekIdx}
              className="grid grid-cols-[40px_repeat(7,1fr)]"
            >
              {/* Week number */}
              <div
                className={cn(
                  "flex items-start justify-center pt-2 text-[9px] font-medium text-muted-foreground/30 border-r",
                  !isLastWeek && "border-b"
                )}
              >
                {weekNum}
              </div>

              {/* Day cells */}
              {week.map((day, dayIdx) => {
                const key = format(day, "yyyy-MM-dd");
                const dayTasks = tasksByDate.get(key) ?? [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDay = isToday(day);
                const hasOverdue = dayTasks.some(
                  (t) =>
                    !t.is_completed &&
                    t.due_date &&
                    t.due_date < new Date().toISOString().split("T")[0]
                );

                return (
                  <div
                    key={key}
                    className={cn(
                      "min-h-[100px] p-1.5 transition-colors",
                      dayIdx < 6 && "border-r",
                      !isLastWeek && "border-b",
                      !isCurrentMonth && "bg-muted/10",
                      isTodayDay && "bg-primary/[0.03]",
                      hasOverdue && "bg-red-50/50 dark:bg-red-950/10"
                    )}
                  >
                    {/* Day number + task count */}
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                          isTodayDay
                            ? "bg-primary text-primary-foreground"
                            : isCurrentMonth
                            ? "text-foreground"
                            : "text-muted-foreground/30"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {dayTasks.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="h-4 px-1 text-[9px] font-semibold tabular-nums"
                        >
                          {dayTasks.length}
                        </Badge>
                      )}
                    </div>

                    {/* Task pills (max 3 visible) */}
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 3).map((task) => (
                        <TaskPill
                          key={task.id}
                          task={task}
                          onClick={() => onSelect(task)}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <p className="text-[9px] text-muted-foreground pl-1">
                          +{dayTasks.length - 3} mais
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Task Pill with status dot ──────────────────────────────

function TaskPill({
  task,
  onClick,
}: {
  task: MyTaskWithSection;
  onClick: () => void;
}) {
  const statusCfg = TASK_STATUS[task.status as keyof typeof TASK_STATUS];
  const overdue =
    task.due_date &&
    !task.is_completed &&
    task.due_date < new Date().toISOString().split("T")[0];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left transition-colors",
        "hover:bg-accent/60",
        overdue && "text-red-700 dark:text-red-400"
      )}
    >
      {/* Status dot */}
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{
          backgroundColor: statusCfg?.color ?? "var(--muted-foreground)",
        }}
      />
      <span
        className={cn(
          "truncate text-[10px] font-medium leading-tight",
          task.is_completed && "line-through opacity-50"
        )}
      >
        {task.title}
      </span>
    </button>
  );
}
