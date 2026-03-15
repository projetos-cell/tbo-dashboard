"use client";

import { IconSearch, IconPlus } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TASK_STATUS, type TaskStatusKey } from "@/lib/constants";

export interface TaskListFilters {
  search: string;
  status: string;
}

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
  const statuses = [
    { key: "all", label: "Todas" },
    ...Object.entries(TASK_STATUS).map(([key, config]) => ({
      key,
      label: config.label,
      color: config.color,
    })),
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar tarefas..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {statuses.map((s) => {
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
                onClick={() =>
                  onFiltersChange({ ...filters, status: s.key })
                }
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
