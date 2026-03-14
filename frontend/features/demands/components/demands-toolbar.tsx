"use client";

import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/supabase/types";
import { DemandFilterDropdown } from "./demand-filter-dropdown";
import { DemandSortDropdown } from "./demand-sort-dropdown";

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
        d.prioridade && filters.priorities.includes(d.prioridade.toLowerCase())
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

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="text"
        placeholder="Buscar demandas..."
        className="h-8 w-48 rounded-md border bg-transparent px-2 text-sm focus:outline-none focus:ring-1 focus:ring-tbo-orange"
        value={filters.search}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
      />

      <DemandFilterDropdown
        filters={filters}
        onFiltersChange={onFiltersChange}
        activeCount={activeFilterCount}
      />

      <DemandSortDropdown
        sortField={sortField}
        sortDir={sortDir}
        onSortChange={onSortChange}
      />

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1"
          onClick={() =>
            onFiltersChange({ statuses: [], priorities: [], bus: [], search: "" })
          }
        >
          <IconX className="size-3" />
          Limpar
        </Button>
      )}

      <span className="ml-auto text-xs text-gray-500">
        {filteredCount} demanda{filteredCount !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
