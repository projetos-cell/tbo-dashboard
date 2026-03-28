"use client";

import { useState, useMemo, useCallback } from "react";
import { IconSearch, IconFilter, IconX } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useProfiles } from "@/features/people/hooks/use-people";
import {
  EMPTY_FILTERS,
  type ProjectSearchDialogProps,
  type SearchFilters,
} from "./search-dialog-types";
import { SearchFiltersPanel } from "./search-filters-panel";
import { SearchResultRow } from "./search-result-row";

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

    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.assignee_name?.toLowerCase().includes(q),
      );
    }

    if (filters.status.length > 0) {
      result = result.filter((t) => filters.status.includes(t.status ?? ""));
    }

    if (filters.priority.length > 0) {
      result = result.filter((t) => filters.priority.includes(t.priority ?? ""));
    }

    if (filters.assignee_id) {
      result = result.filter((t) => t.assignee_id === filters.assignee_id);
    }

    if (filters.project_id) {
      result = result.filter((t) => t.project_id === filters.project_id);
    }

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
      if (!projectId) return "\u2014";
      return projects.find((p) => p.id === projectId)?.name ?? "\u2014";
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
            Busca avancada
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
            <SearchFiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              onToggleArrayFilter={toggleArrayFilter}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              profiles={profiles}
              projects={projects}
            />
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
