"use client";

import { useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconDownload,
  IconFilter,
  IconSortDescending,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/shared/empty-state";
import { useProjectTasks, useProjectSections } from "@/features/projects/hooks/use-project-tasks";
import { TASK_PRIORITY, type TaskPriorityKey } from "@/lib/constants";
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

type SortField = "days_overdue" | "priority" | "assignee" | "due_date";

interface ProjectOverdueReportProps {
  projectId: string;
  onSelectTask?: (taskId: string) => void;
}

export function ProjectOverdueReport({ projectId, onSelectTask }: ProjectOverdueReportProps) {
  const { parents, isLoading } = useProjectTasks(projectId);
  const { data: sections } = useProjectSections(projectId);
  const [sortField, setSortField] = useState<SortField>("days_overdue");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const overdueTasks = useMemo(() => {
    return parents.filter((t) => {
      if (t.is_completed) return false;
      if (!t.due_date) return false;
      const due = new Date(t.due_date);
      due.setHours(0, 0, 0, 0);
      return due < today;
    });
  }, [parents, today]);

  const assignees = useMemo(() => {
    const set = new Set<string>();
    for (const t of overdueTasks) {
      if (t.assignee_name) set.add(t.assignee_name);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [overdueTasks]);

  const filtered = useMemo(() => {
    let items = overdueTasks;
    if (filterAssignee !== "all") {
      items = items.filter((t) => t.assignee_name === filterAssignee);
    }
    if (filterPriority !== "all") {
      items = items.filter((t) => t.priority === filterPriority);
    }
    return items;
  }, [overdueTasks, filterAssignee, filterPriority]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortField) {
        case "days_overdue": {
          const daysA = differenceInDays(today, new Date(a.due_date!));
          const daysB = differenceInDays(today, new Date(b.due_date!));
          return daysB - daysA;
        }
        case "priority": {
          const pa = a.priority ? (TASK_PRIORITY[a.priority as TaskPriorityKey]?.sort ?? 99) : 99;
          const pb = b.priority ? (TASK_PRIORITY[b.priority as TaskPriorityKey]?.sort ?? 99) : 99;
          return pa - pb;
        }
        case "assignee":
          return (a.assignee_name ?? "").localeCompare(b.assignee_name ?? "", "pt-BR");
        case "due_date":
          return (a.due_date ?? "").localeCompare(b.due_date ?? "");
        default:
          return 0;
      }
    });
  }, [filtered, sortField, today]);

  const handleExportCsv = () => {
    const header = "Tarefa,Seção,Responsável,Prazo,Dias de Atraso,Prioridade";
    const rows = sorted.map((t) => {
      const section = sections?.find((s) => s.id === t.section_id);
      const days = differenceInDays(today, new Date(t.due_date!));
      const prio = t.priority ? (TASK_PRIORITY[t.priority as TaskPriorityKey]?.label ?? t.priority) : "—";
      return `"${(t.title ?? "").replace(/"/g, '""')}","${section?.title ?? "—"}","${t.assignee_name ?? "—"}","${t.due_date ?? "—"}","${days}","${prio}"`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tarefas-atrasadas-${format(today, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (overdueTasks.length === 0) {
    return (
      <EmptyState
        icon={IconAlertTriangle}
        title="Nenhuma tarefa atrasada"
        description="Todas as tarefas estão dentro do prazo. Continue assim!"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconAlertTriangle className="size-4 text-red-500" />
          <h3 className="text-sm font-semibold">
            {overdueTasks.length} tarefa{overdueTasks.length !== 1 ? "s" : ""} atrasada{overdueTasks.length !== 1 ? "s" : ""}
          </h3>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExportCsv}>
          <IconDownload className="size-3.5" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <IconFilter className="size-3.5 text-muted-foreground" />
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="h-7 w-[160px] text-xs">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {assignees.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="h-7 w-[140px] text-xs">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {(Object.entries(TASK_PRIORITY) as [TaskPriorityKey, (typeof TASK_PRIORITY)[TaskPriorityKey]][]).map(
              ([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5">
          <IconSortDescending className="size-3.5 text-muted-foreground" />
          <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
            <SelectTrigger className="h-7 w-[150px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days_overdue">Dias de atraso</SelectItem>
              <SelectItem value="priority">Prioridade</SelectItem>
              <SelectItem value="assignee">Responsável</SelectItem>
              <SelectItem value="due_date">Prazo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {filtered.length !== overdueTasks.length && (
          <span className="text-xs text-muted-foreground">
            {filtered.length} de {overdueTasks.length}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Tarefa</th>
              <th className="hidden px-3 py-2 text-left text-xs font-medium text-muted-foreground md:table-cell">Seção</th>
              <th className="hidden px-3 py-2 text-left text-xs font-medium text-muted-foreground md:table-cell">Responsável</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Prazo</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">Dias de Atraso</th>
              <th className="hidden px-3 py-2 text-left text-xs font-medium text-muted-foreground md:table-cell">Prioridade</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((task) => {
              const days = differenceInDays(today, new Date(task.due_date!));
              const section = sections?.find((s) => s.id === task.section_id);
              const prioConfig = task.priority ? TASK_PRIORITY[task.priority as TaskPriorityKey] : null;

              return (
                <tr
                  key={task.id}
                  className="border-b border-border/30 transition-colors last:border-b-0 hover:bg-muted/30 cursor-pointer"
                  onClick={() => onSelectTask?.(task.id)}
                >
                  <td className="px-3 py-2.5">
                    <span className="font-medium">{task.title}</span>
                  </td>
                  <td className="hidden px-3 py-2.5 md:table-cell">
                    {section ? (
                      <div className="flex items-center gap-1.5">
                        {section.color && (
                          <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: section.color }} />
                        )}
                        <span className="text-xs text-muted-foreground">{section.title}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="hidden px-3 py-2.5 md:table-cell">
                    {task.assignee_name ? (
                      <div className="flex items-center gap-1.5">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-semibold text-blue-700">
                          {task.assignee_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                        </span>
                        <span className="text-xs">{task.assignee_name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs text-red-600">
                      {format(new Date(task.due_date!), "dd MMM yyyy", { locale: ptBR })}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium bg-red-50 text-red-600 border-red-200"
                        >
                          {days}d
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        {days} dia{days !== 1 ? "s" : ""} de atraso
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="hidden px-3 py-2.5 md:table-cell">
                    {prioConfig ? (
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{ backgroundColor: prioConfig.bg, color: prioConfig.color }}
                      >
                        {prioConfig.label}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
