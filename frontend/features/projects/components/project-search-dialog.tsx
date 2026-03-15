"use client";

import { useState, useMemo, useCallback } from "react";
import {
  IconSearch,
  IconFilter,
  IconX,
  IconCalendar,
  IconUser,
  IconFolder,
  IconTag,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useProfiles } from "@/features/people/hooks/use-people";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  BU_LIST,
  type TaskStatusKey,
  type TaskPriorityKey,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface ProjectSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTask?: (taskId: string) => void;
}

interface SearchFilters {
  query: string;
  status: string[];
  priority: string[];
  assignee_id: string;
  project_id: string;
  bu: string;
  due_from: string;
  due_to: string;
}

const EMPTY_FILTERS: SearchFilters = {
  query: "",
  status: [],
  priority: [],
  assignee_id: "",
  project_id: "",
  bu: "",
  due_from: "",
  due_to: "",
};

export function ProjectSearchDialog({
  open,
  onOpenChange,
  onSelectTask,
}: ProjectSearchDialogProps) {
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const { data: tasks = [] } = useTasks();
  const { data: projects = [] } = useProjects();
  const { data: profiles = [] } = useProfiles();

  const hasActiveFilters = useMemo(
    () =>
      filters.status.length > 0 ||
      filters.priority.length > 0 ||
      filters.assignee_id !== "" ||
      filters.project_id !== "" ||
      filters.bu !== "" ||
      filters.due_from !== "" ||
      filters.due_to !== "",
    [filters],
  );

  const filteredTasks = useMemo(() => {
    if (!filters.query && !hasActiveFilters) return [];

    let result = tasks;

    // Text search
    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.assignee_name?.toLowerCase().includes(q),
      );
    }

    // Status filter (multi)
    if (filters.status.length > 0) {
      result = result.filter((t) => filters.status.includes(t.status ?? ""));
    }

    // Priority filter (multi)
    if (filters.priority.length > 0) {
      result = result.filter((t) => filters.priority.includes(t.priority ?? ""));
    }

    // Assignee
    if (filters.assignee_id) {
      result = result.filter((t) => t.assignee_id === filters.assignee_id);
    }

    // Project
    if (filters.project_id) {
      result = result.filter((t) => t.project_id === filters.project_id);
    }

    // BU (via project)
    if (filters.bu) {
      const buProjectIds = new Set(
        projects
          .filter((p) => {
            const bus = p.bus as string[] | null;
            return bus?.includes(filters.bu);
          })
          .map((p) => p.id),
      );
      result = result.filter((t) => t.project_id && buProjectIds.has(t.project_id));
    }

    // Date range
    if (filters.due_from) {
      result = result.filter((t) => t.due_date && t.due_date >= filters.due_from);
    }
    if (filters.due_to) {
      result = result.filter((t) => t.due_date && t.due_date <= filters.due_to);
    }

    return result.slice(0, 50);
  }, [tasks, projects, filters, hasActiveFilters]);

  const toggleArrayFilter = useCallback(
    (field: "status" | "priority", value: string) => {
      setFilters((prev) => {
        const arr = prev[field];
        return {
          ...prev,
          [field]: arr.includes(value)
            ? arr.filter((v) => v !== value)
            : [...arr, value],
        };
      });
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  const getProjectName = useCallback(
    (projectId: string | null) => {
      if (!projectId) return "—";
      return projects.find((p) => p.id === projectId)?.name ?? "—";
    },
    [projects],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.assignee_id) count++;
    if (filters.project_id) count++;
    if (filters.bu) count++;
    if (filters.due_from || filters.due_to) count++;
    return count;
  }, [filters]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-[680px] overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <IconSearch className="size-4" />
            Busca avançada
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-0">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <IconSearch className="size-4 text-muted-foreground" />
            <Input
              value={filters.query}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, query: e.target.value }))
              }
              placeholder="Buscar tarefas por nome, descricao ou responsavel..."
              className="border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
              autoFocus
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, query: "" }))}
                className="text-muted-foreground hover:text-foreground"
              >
                <IconX className="size-3.5" />
              </button>
            )}
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="sm"
              className="shrink-0 gap-1.5 text-xs"
              onClick={() => setShowFilters(!showFilters)}
            >
              <IconFilter className="size-3.5" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 size-5 items-center justify-center rounded-full p-0 text-[10px]"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="space-y-3 border-b border-border bg-muted/30 px-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Status multi-select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(TASK_STATUS).map(([key, val]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleArrayFilter("status", key)}
                        className="rounded-full border px-2 py-0.5 text-[11px] transition-colors"
                        style={{
                          borderColor: filters.status.includes(key)
                            ? val.color
                            : "var(--border)",
                          backgroundColor: filters.status.includes(key)
                            ? val.bg
                            : "transparent",
                          color: filters.status.includes(key)
                            ? val.color
                            : "var(--muted-foreground)",
                        }}
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority multi-select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Prioridade
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(TASK_PRIORITY).map(([key, val]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleArrayFilter("priority", key)}
                        className="rounded-full border px-2 py-0.5 text-[11px] transition-colors"
                        style={{
                          borderColor: filters.priority.includes(key)
                            ? val.color
                            : "var(--border)",
                          backgroundColor: filters.priority.includes(key)
                            ? val.bg
                            : "transparent",
                          color: filters.priority.includes(key)
                            ? val.color
                            : "var(--muted-foreground)",
                        }}
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assignee */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <IconUser className="size-3" />
                    Responsavel
                  </label>
                  <Select
                    value={filters.assignee_id || "all"}
                    onValueChange={(v) =>
                      setFilters((prev) => ({
                        ...prev,
                        assignee_id: v === "all" ? "" : v,
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {profiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Project */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <IconFolder className="size-3" />
                    Projeto
                  </label>
                  <Select
                    value={filters.project_id || "all"}
                    onValueChange={(v) =>
                      setFilters((prev) => ({
                        ...prev,
                        project_id: v === "all" ? "" : v,
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* BU */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <IconTag className="size-3" />
                    BU
                  </label>
                  <Select
                    value={filters.bu || "all"}
                    onValueChange={(v) =>
                      setFilters((prev) => ({
                        ...prev,
                        bu: v === "all" ? "" : v,
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {BU_LIST.map((bu) => (
                        <SelectItem key={bu} value={bu}>
                          {bu}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date range */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <IconCalendar className="size-3" />
                    Prazo
                  </label>
                  <div className="flex gap-1.5">
                    <Input
                      type="date"
                      value={filters.due_from}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          due_from: e.target.value,
                        }))
                      }
                      className="h-8 text-xs"
                      placeholder="De"
                    />
                    <Input
                      type="date"
                      value={filters.due_to}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          due_to: e.target.value,
                        }))
                      }
                      className="h-8 text-xs"
                      placeholder="Ate"
                    />
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={clearFilters}
                  >
                    <IconX className="mr-1 size-3" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <IconSearch className="mb-2 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {filters.query || hasActiveFilters
                    ? "Nenhuma tarefa encontrada com esses filtros"
                    : "Digite algo para buscar tarefas"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                <div className="px-4 py-1.5 text-[11px] font-medium text-muted-foreground">
                  {filteredTasks.length} resultado{filteredTasks.length !== 1 ? "s" : ""}
                </div>
                {filteredTasks.map((task) => (
                  <SearchResultRow
                    key={task.id}
                    task={task}
                    projectName={getProjectName(task.project_id)}
                    onClick={() => {
                      onSelectTask?.(task.id);
                      onOpenChange(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Result row ───────────────────────────────────────────────────────────────

function SearchResultRow({
  task,
  projectName,
  onClick,
}: {
  task: TaskRow;
  projectName: string;
  onClick: () => void;
}) {
  const statusConf = TASK_STATUS[task.status as TaskStatusKey];
  const priorityConf = TASK_PRIORITY[task.priority as TaskPriorityKey];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/50"
    >
      {/* Status dot */}
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: statusConf?.color ?? "#6b7280" }}
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm">{task.title}</div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="truncate">{projectName}</span>
          {task.assignee_name && (
            <>
              <span>·</span>
              <span className="truncate">{task.assignee_name}</span>
            </>
          )}
          {task.due_date && (
            <>
              <span>·</span>
              <span>
                {new Date(task.due_date + "T00:00:00").toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex shrink-0 items-center gap-1.5">
        {statusConf && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: statusConf.bg, color: statusConf.color }}
          >
            {statusConf.label}
          </span>
        )}
        {priorityConf && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: priorityConf.bg, color: priorityConf.color }}
          >
            {priorityConf.label}
          </span>
        )}
      </div>
    </button>
  );
}
