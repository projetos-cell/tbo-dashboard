"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
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
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TASK_STATUS } from "@/lib/constants";
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
      const key = task.due_date; // "YYYY-MM-DD"
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

  return (
    <div className="flex flex-col gap-3">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-semibold capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={goToday}>
          Hoje
        </Button>
      </div>

      {/* Grid */}
      <div className="rounded-lg border overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate.get(key) ?? [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDay = isToday(day);
            const isLastRow = i >= days.length - 7;

            return (
              <div
                key={key}
                className={cn(
                  "min-h-[80px] p-1.5 border-r border-b",
                  !isLastRow ? "" : "border-b-0",
                  (i + 1) % 7 === 0 ? "border-r-0" : "",
                  !isCurrentMonth && "bg-muted/20"
                )}
              >
                {/* Day number */}
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium",
                      isTodayDay
                        ? "bg-primary text-primary-foreground"
                        : isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground/40"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {dayTasks.length > 2 && (
                    <Badge
                      variant="secondary"
                      className="h-4 px-1 text-[9px] font-medium"
                    >
                      +{dayTasks.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Task pills (max 2 visible) */}
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 2).map((task) => (
                    <TaskPill
                      key={task.id}
                      task={task}
                      onClick={() => onSelect(task)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Task Pill ────────────────────────────────────────────────

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
        "flex w-full items-center gap-1 rounded px-1 py-0.5 text-left transition-colors hover:opacity-80",
        overdue
          ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
          : statusCfg?.bg
          ? `${statusCfg.bg} ${statusCfg.color}`
          : "bg-muted text-foreground"
      )}
    >
      {task.is_completed ? (
        <IconCircleCheck className="h-2.5 w-2.5 shrink-0 opacity-70" />
      ) : (
        <IconCircle className="h-2.5 w-2.5 shrink-0 opacity-50" />
      )}
      <span
        className={cn(
          "truncate text-[10px] font-medium leading-tight",
          task.is_completed && "line-through opacity-60"
        )}
      >
        {task.title}
      </span>
    </button>
  );
}
