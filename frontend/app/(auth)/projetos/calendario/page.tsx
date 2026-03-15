"use client";

import { useState, useMemo, useCallback } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCircle,
  IconFilter,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  isPast,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { TASK_STATUS, BU_LIST, type TaskStatusKey } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function ProjetosCalendarioGlobal() {
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [buFilter, setBuFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const isLoading = tasksLoading || projectsLoading;

  // Build project lookup
  const projectMap = useMemo(() => {
    const map = new Map<string, ProjectRow>();
    for (const p of projects) map.set(p.id, p);
    return map;
  }, [projects]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let tasks = allTasks.filter((t) => t.due_date);

    if (projectFilter !== "all") {
      tasks = tasks.filter((t) => t.project_id === projectFilter);
    }

    if (buFilter !== "all") {
      tasks = tasks.filter((t) => {
        const proj = t.project_id ? projectMap.get(t.project_id) : null;
        if (!proj) return false;
        const bus = (proj.bus as string[] | null) ?? [];
        return bus.includes(buFilter);
      });
    }

    return tasks;
  }, [allTasks, projectFilter, buFilter, projectMap]);

  // Calendar days
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Group tasks by due_date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskRow[]>();
    for (const task of filteredTasks) {
      if (!task.due_date) continue;
      const key = task.due_date.split("T")[0];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    }
    return map;
  }, [filteredTasks]);

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendário</h1>
          <p className="text-sm text-muted-foreground">
            Todas as tarefas dos projetos por data de entrega.
          </p>
        </div>
      </div>

      {/* Filters + navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h3>
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

        <div className="flex items-center gap-2">
          <IconFilter className="size-3.5 text-muted-foreground" />
          <Select value={buFilter} onValueChange={setBuFilter}>
            <SelectTrigger className="h-7 w-[140px] text-xs">
              <SelectValue placeholder="Todas as BUs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as BUs</SelectItem>
              {BU_LIST.map((bu) => (
                <SelectItem key={bu} value={bu}>{bu}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="h-7 w-[180px] text-xs">
              <SelectValue placeholder="Todos os projetos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os projetos</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  {dayTasks.length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                      {dayTasks.length}
                    </Badge>
                  )}
                </div>

                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <GlobalCalendarTask
                      key={task.id}
                      task={task}
                      projectName={task.project_id ? projectMap.get(task.project_id)?.name : undefined}
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

// ─── Global Calendar Task Chip ──────────────────────────────────────────────

function GlobalCalendarTask({
  task,
  projectName,
}: {
  task: TaskRow;
  projectName?: string | null;
}) {
  const statusConfig = TASK_STATUS[task.status as TaskStatusKey];
  const done = !!task.is_completed;
  const overdue =
    !done &&
    task.due_date &&
    isPast(new Date(task.due_date)) &&
    !isToday(new Date(task.due_date));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[10px] leading-tight transition-colors hover:bg-accent/50 cursor-default",
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
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs max-w-[220px]">
        <p className="font-medium">{task.title}</p>
        {projectName && (
          <p className="text-muted-foreground">{projectName}</p>
        )}
        {statusConfig && (
          <p className="text-muted-foreground">{statusConfig.label}</p>
        )}
        {task.assignee_name && (
          <p className="text-muted-foreground">{task.assignee_name}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
