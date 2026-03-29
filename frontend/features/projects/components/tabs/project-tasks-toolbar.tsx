"use client";

import { useState } from "react";
import {
  IconArrowsSort,
  IconLayoutList,
  IconFilter,
  IconPlus,
  IconX,
  IconChevronDown,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type TaskSortField = "order_index" | "title" | "status" | "priority" | "assignee_name" | "due_date" | "created_at";
export type TaskSortDir = "asc" | "desc";
export type TaskGroupField = "none" | "status" | "priority" | "section" | "assignee";

export interface TaskCustomFilter {
  id: string;
  field: string;
  value: string;
  label: string;
}

export interface TaskListFilters {
  search: string;
  status: string;
  sortField: TaskSortField;
  sortDir: TaskSortDir;
  groupBy: TaskGroupField;
  customFilters: TaskCustomFilter[];
}

export const DEFAULT_TASK_FILTERS: TaskListFilters = {
  search: "",
  status: "all",
  sortField: "order_index",
  sortDir: "asc",
  groupBy: "none",
  customFilters: [],
};

const SORT_OPTIONS: { value: TaskSortField; label: string }[] = [
  { value: "order_index", label: "Manual" },
  { value: "title", label: "Nome" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Prioridade" },
  { value: "assignee_name", label: "Responsável" },
  { value: "due_date", label: "Prazo" },
  { value: "created_at", label: "Data de criação" },
];

const GROUP_OPTIONS: { value: TaskGroupField; label: string }[] = [
  { value: "none", label: "Sem agrupamento" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Prioridade" },
  { value: "section", label: "Seção" },
  { value: "assignee", label: "Responsável" },
];

const FILTER_FIELDS: { value: string; label: string; options?: { value: string; label: string }[] }[] = [
  {
    value: "status",
    label: "Status",
    options: Object.entries(TASK_STATUS).map(([k, v]) => ({ value: k, label: v.label })),
  },
  {
    value: "priority",
    label: "Prioridade",
    options: Object.entries(TASK_PRIORITY).map(([k, v]) => ({ value: k, label: v.label })),
  },
];

interface ProjectTasksToolbarProps {
  filters: TaskListFilters;
  onFiltersChange: (filters: TaskListFilters) => void;
  totalCount: number;
  filteredCount: number;
  onAddTask: () => void;
}

export function ProjectTasksToolbar({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  onAddTask,
}: ProjectTasksToolbarProps) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === filters.sortField)?.label ?? "Nome";
  const activeGroupLabel = GROUP_OPTIONS.find((o) => o.value === filters.groupBy)?.label ?? "Sem agrupamento";

  const handleAddFilter = (field: string, value: string, label: string) => {
    const id = `${field}:${value}`;
    if (filters.customFilters.some((f) => f.id === id)) return;
    onFiltersChange({
      ...filters,
      customFilters: [...filters.customFilters, { id, field, value, label }],
    });
    setFilterMenuOpen(false);
  };

  const handleRemoveFilter = (id: string) => {
    onFiltersChange({
      ...filters,
      customFilters: filters.customFilters.filter((f) => f.id !== id),
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Search + status filter badges (top row) */}
      <div className="flex flex-1 items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <input
            type="text"
            placeholder="Buscar tarefa:"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "all", label: "Todas" },
            ...Object.entries(TASK_STATUS).map(([key, config]) => ({
              key,
              label: config.label,
              color: config.color,
              bg: config.bg,
            })),
          ].map((s) => {
            const isActive = filters.status === s.key;
            return (
              <Badge
                key={s.key}
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer select-none text-xs"
                style={
                  isActive && "color" in s
                    ? { backgroundColor: s.color, color: "#fff" }
                    : undefined
                }
                onClick={() => onFiltersChange({ ...filters, status: s.key })}
              >
                {s.label}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {filteredCount < totalCount && (
          <span className="text-muted-foreground text-xs">
            {filteredCount} de {totalCount}
          </span>
        )}
        <Button size="sm" onClick={onAddTask}>
          <IconPlus className="mr-1 h-3.5 w-3.5" />
          Tarefa
        </Button>
      </div>
    </div>
  );
}

export function ProjectTasksSubToolbar({
  filters,
  onFiltersChange,
}: {
  filters: TaskListFilters;
  onFiltersChange: (filters: TaskListFilters) => void;
}) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === filters.sortField)?.label ?? "Nome";
  const activeGroupLabel = GROUP_OPTIONS.find((o) => o.value === filters.groupBy)?.label ?? "Sem agrupamento";

  const handleAddFilter = (field: string, value: string, label: string) => {
    const id = `${field}:${value}`;
    if (filters.customFilters.some((f) => f.id === id)) return;
    onFiltersChange({
      ...filters,
      customFilters: [...filters.customFilters, { id, field, value, label }],
    });
    setFilterMenuOpen(false);
  };

  const handleRemoveFilter = (id: string) => {
    onFiltersChange({
      ...filters,
      customFilters: filters.customFilters.filter((f) => f.id !== id),
    });
  };

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2 py-1.5">
      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
            <IconArrowsSort className="size-3.5" />
            <span className="hidden sm:inline">Ordenar:</span>
            <span className="font-medium text-foreground">{activeSortLabel}</span>
            <IconChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-xs">Ordenar por</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={filters.sortField}
            onValueChange={(v) => onFiltersChange({ ...filters, sortField: v as TaskSortField })}
          >
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs">Direção</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={filters.sortDir}
            onValueChange={(v) => onFiltersChange({ ...filters, sortDir: v as TaskSortDir })}
          >
            <DropdownMenuRadioItem value="asc">Crescente (A → Z)</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="desc">Decrescente (Z → A)</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-4 w-px bg-border/60" />

      {/* Group */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
            <IconLayoutList className="size-3.5" />
            <span className="hidden sm:inline">Agrupar:</span>
            <span className={cn("font-medium", filters.groupBy !== "none" ? "text-foreground" : "text-muted-foreground")}>
              {activeGroupLabel}
            </span>
            <IconChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-xs">Agrupar por</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={filters.groupBy}
            onValueChange={(v) => onFiltersChange({ ...filters, groupBy: v as TaskGroupField })}
          >
            {GROUP_OPTIONS.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-4 w-px bg-border/60" />

      {/* Active custom filters */}
      {filters.customFilters.map((f) => (
        <Badge
          key={f.id}
          variant="secondary"
          className="h-6 gap-1 pl-2 pr-1 text-xs"
        >
          {f.label}
          <button
            type="button"
            onClick={() => handleRemoveFilter(f.id)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
          >
            <IconX className="size-3" />
          </button>
        </Badge>
      ))}

      {/* Filter */}
      <Popover open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground">
            {filters.customFilters.length > 0 ? (
              <IconPlus className="size-3.5" />
            ) : (
              <>
                <IconFilter className="size-3.5" />
                <span className="hidden sm:inline">Filtro</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-2">
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
            Adicionar filtro
          </p>
          {FILTER_FIELDS.map((field) => (
            <div key={field.value}>
              {field.options ? (
                field.options.map((opt) => {
                  const id = `${field.value}:${opt.value}`;
                  const alreadyAdded = filters.customFilters.some((f) => f.id === id);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddFilter(field.value, opt.value, `${field.label}: ${opt.label}`)}
                      className={cn(
                        "flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                        alreadyAdded
                          ? "cursor-not-allowed text-muted-foreground/50"
                          : "hover:bg-muted",
                      )}
                    >
                      {field.label}: {opt.label}
                    </button>
                  );
                })
              ) : (
                <p className="px-2 py-1.5 text-xs text-muted-foreground italic">
                  {field.label} (em breve)
                </p>
              )}
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
