"use client";

import { useState } from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Filter,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DEMAND_STATUS,
  DEMAND_PRIORITY,
  BU_COLORS,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

type SortField = "title" | "due_date" | "prioridade" | "status" | "created_at";

export interface DemandsFilters {
  statuses: string[];
  priorities: string[];
  bus: string[];
  search: string;
}

interface DemandsToolbarProps {
  demands: DemandRow[];
  filters: DemandsFilters;
  onFiltersChange: (filters: DemandsFilters) => void;
  sortField: SortField;
  sortDir: "asc" | "desc";
  onSortChange: (field: SortField, dir: "asc" | "desc") => void;
  filteredCount: number;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "due_date", label: "Prazo" },
  { value: "title", label: "Titulo" },
  { value: "prioridade", label: "Prioridade" },
  { value: "status", label: "Status" },
  { value: "created_at", label: "Data de criacao" },
];

const PRIORITY_ORDER: Record<string, number> = {
  urgente: 0,
  alta: 1,
  media: 2,
  baixa: 3,
};

export function applyDemandsFilters(
  demands: DemandRow[],
  filters: DemandsFilters,
  sortField: SortField,
  sortDir: "asc" | "desc"
): DemandRow[] {
  let filtered = demands;

  if (filters.statuses.length > 0) {
    filtered = filtered.filter((d) => filters.statuses.includes(d.status));
  }

  if (filters.priorities.length > 0) {
    filtered = filtered.filter(
      (d) =>
        d.prioridade &&
        filters.priorities.includes(d.prioridade.toLowerCase())
    );
  }

  if (filters.bus.length > 0) {
    filtered = filtered.filter(
      (d) => d.bus && d.bus.some((bu) => filters.bus.includes(bu))
    );
  }

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.responsible && d.responsible.toLowerCase().includes(q)) ||
        (d.info && d.info.toLowerCase().includes(q))
    );
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "title":
        cmp = a.title.localeCompare(b.title);
        break;
      case "due_date":
        cmp = (a.due_date || "9999").localeCompare(b.due_date || "9999");
        break;
      case "prioridade":
        cmp =
          (PRIORITY_ORDER[a.prioridade?.toLowerCase() ?? ""] ?? 99) -
          (PRIORITY_ORDER[b.prioridade?.toLowerCase() ?? ""] ?? 99);
        break;
      case "status":
        cmp = a.status.localeCompare(b.status);
        break;
      case "created_at":
        cmp = (a.created_at || "").localeCompare(b.created_at || "");
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  return filtered;
}

export function DemandsToolbar({
  demands,
  filters,
  onFiltersChange,
  sortField,
  sortDir,
  onSortChange,
  filteredCount,
}: DemandsToolbarProps) {
  const activeFilterCount =
    filters.statuses.length +
    filters.priorities.length +
    filters.bus.length +
    (filters.search ? 1 : 0);

  const toggleStatus = (status: string) => {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: next });
  };

  const togglePriority = (priority: string) => {
    const next = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority];
    onFiltersChange({ ...filters, priorities: next });
  };

  const toggleBu = (bu: string) => {
    const next = filters.bus.includes(bu)
      ? filters.bus.filter((b) => b !== bu)
      : [...filters.bus, bu];
    onFiltersChange({ ...filters, bus: next });
  };

  const clearFilters = () => {
    onFiltersChange({ statuses: [], priorities: [], bus: [], search: "" });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <input
        type="text"
        placeholder="Buscar demandas..."
        className="h-8 w-48 rounded-md border bg-transparent px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        value={filters.search}
        onChange={(e) =>
          onFiltersChange({ ...filters, search: e.target.value })
        }
      />

      {/* Filter dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Filter className="size-3.5" />
            Filtros
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            {Object.entries(DEMAND_STATUS)
              .filter(([key]) => key !== "Concluido")
              .map(([key, cfg]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={filters.statuses.includes(key)}
                  onCheckedChange={() => toggleStatus(key)}
                >
                  <span
                    className="size-2 rounded-full mr-2 shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  />
                  {cfg.label}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Prioridade</DropdownMenuLabel>
            {Object.entries(DEMAND_PRIORITY).map(([key, cfg]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={filters.priorities.includes(key)}
                onCheckedChange={() => togglePriority(key)}
              >
                <span
                  className="size-2 rounded-full mr-2 shrink-0"
                  style={{ backgroundColor: cfg.color }}
                />
                {cfg.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>BU</DropdownMenuLabel>
            {Object.keys(BU_COLORS).map((bu) => (
              <DropdownMenuCheckboxItem
                key={bu}
                checked={filters.bus.includes(bu)}
                onCheckedChange={() => toggleBu(bu)}
              >
                {bu}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            {sortDir === "asc" ? (
              <ArrowDownAZ className="size-3.5" />
            ) : (
              <ArrowUpAZ className="size-3.5" />
            )}
            {SORT_OPTIONS.find((o) => o.value === sortField)?.label ?? "Ordenar"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          {SORT_OPTIONS.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={sortField === opt.value}
              onCheckedChange={() =>
                onSortChange(
                  opt.value,
                  sortField === opt.value && sortDir === "asc" ? "desc" : "asc"
                )
              }
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1"
          onClick={clearFilters}
        >
          <X className="size-3" />
          Limpar
        </Button>
      )}

      {/* Count */}
      <span className="ml-auto text-xs text-muted-foreground">
        {filteredCount} demanda{filteredCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
