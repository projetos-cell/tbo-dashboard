"use client";

import {
  IconCalendar,
  IconUser,
  IconFolder,
  IconTag,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  BU_LIST,
} from "@/lib/constants";
import type { SearchFilters } from "./search-dialog-types";

interface Profile {
  id: string;
  full_name: string | null;
}

interface Project {
  id: string;
  name: string | null;
}

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onFiltersChange: (updater: (prev: SearchFilters) => SearchFilters) => void;
  onToggleArrayFilter: (field: "status" | "priority", value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  profiles: Profile[];
  projects: Project[];
}

export function SearchFiltersPanel({
  filters,
  onFiltersChange,
  onToggleArrayFilter,
  onClearFilters,
  hasActiveFilters,
  profiles,
  projects,
}: SearchFiltersPanelProps) {
  return (
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
                onClick={() => onToggleArrayFilter("status", key)}
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
                onClick={() => onToggleArrayFilter("priority", key)}
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
              onFiltersChange((prev) => ({
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
              onFiltersChange((prev) => ({
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
              onFiltersChange((prev) => ({
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
                onFiltersChange((prev) => ({
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
                onFiltersChange((prev) => ({
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
            onClick={onClearFilters}
          >
            <IconX className="mr-1 size-3" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
