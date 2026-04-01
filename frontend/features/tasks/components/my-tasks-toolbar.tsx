"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  IconArrowsUpDown,
  IconFilter,
  IconLayoutRows,
  IconCheck,
  IconArrowUp,
  IconArrowDown,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  MyTasksFilterPanel,
  type MyTasksFilters,
  SORT_OPTIONS,
  GROUP_OPTIONS,
} from "./my-tasks-filter-panel";

type ViewMode = "list" | "board" | "calendar";

interface MyTasksToolbarProps {
  sortBy: string;
  sortDirection: "asc" | "desc";
  groupBy: string;
  filters: Record<string, unknown>;
  onUpdate: (updates: Record<string, unknown>) => void;
  viewMode?: ViewMode;
}

export function MyTasksToolbar({
  sortBy,
  sortDirection,
  groupBy,
  filters,
  onUpdate,
  viewMode = "list",
}: MyTasksToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  const typedFilters = filters as MyTasksFilters;
  const activeFilterCount = typedFilters?.rules?.length ?? 0;
  const isSortActive = sortBy !== "manual";
  const isGroupActive = groupBy !== "section";

  // Board view: sort/group are locked to section-based
  const sortDisabled = viewMode === "board";
  const groupDisabled = viewMode === "board" || viewMode === "calendar";

  const totalActive =
    (isSortActive ? 1 : 0) +
    activeFilterCount +
    (isGroupActive ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {/* ─── Sort ─── */}
      <Popover open={sortOpen} onOpenChange={setSortOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={sortDisabled}
            className={cn(
              "h-7 gap-1.5 text-xs font-medium",
              isSortActive && !sortDisabled && "text-primary"
            )}
          >
            <IconArrowsUpDown className="h-3.5 w-3.5" />
            Ordenar
            {isSortActive && !sortDisabled && (
              <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[9px]">
                1
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1.5" align="start">
          <div className="space-y-0.5">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ordenar por
            </p>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onUpdate({
                    sort_by: opt.value,
                    sort_direction:
                      opt.value === sortBy
                        ? sortDirection === "asc"
                          ? "desc"
                          : "asc"
                        : "asc",
                  });
                  if (opt.value !== sortBy) setSortOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/60",
                  sortBy === opt.value && "bg-muted/40"
                )}
              >
                {sortBy === opt.value ? (
                  <IconCheck className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <span className="h-3.5 w-3.5" />
                )}
                <span className="flex-1 text-left">{opt.label}</span>
                {sortBy === opt.value && opt.value !== "manual" && (
                  <span className="text-muted-foreground">
                    {sortDirection === "asc" ? (
                      <IconArrowUp className="h-3 w-3" />
                    ) : (
                      <IconArrowDown className="h-3 w-3" />
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* ─── Filter ─── */}
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 gap-1.5 text-xs font-medium",
              activeFilterCount > 0 && "text-primary"
            )}
          >
            <IconFilter className="h-3.5 w-3.5" />
            Filtrar
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[9px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2" align="start">
          <MyTasksFilterPanel
            filters={typedFilters}
            onUpdate={(f) => onUpdate({ filters: f })}
          />
        </PopoverContent>
      </Popover>

      {/* ─── Group ─── */}
      <Popover open={groupOpen} onOpenChange={setGroupOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={groupDisabled}
            className={cn(
              "h-7 gap-1.5 text-xs font-medium",
              isGroupActive && !groupDisabled && "text-primary"
            )}
          >
            <IconLayoutRows className="h-3.5 w-3.5" />
            Agrupar
            {isGroupActive && !groupDisabled && (
              <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[9px]">
                1
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-1.5" align="start">
          <div className="space-y-0.5">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Agrupar por
            </p>
            {GROUP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onUpdate({ group_by: opt.value });
                  setGroupOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/60",
                  groupBy === opt.value && "bg-muted/40"
                )}
              >
                {groupBy === opt.value ? (
                  <IconCheck className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <span className="h-3.5 w-3.5" />
                )}
                <span className="flex-1 text-left">{opt.label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* ─── Clear all ─── */}
      {totalActive > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={() =>
            onUpdate({
              sort_by: "manual",
              sort_direction: "asc",
              group_by: "section",
              filters: {},
            })
          }
        >
          <IconX className="h-3 w-3" />
          Limpar
        </Button>
      )}
    </div>
  );
}
