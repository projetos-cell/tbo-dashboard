"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PEOPLE_STATUS } from "@/lib/constants";
import {
  type PeopleFiltersSpec,
  countActiveFilterGroups,
} from "@/features/people/utils/people-filters";
import { IconSearch, IconArrowsUpDown } from "@tabler/icons-react";
import type { SortSpec } from "@/services/view-state";
import { FilterAdvancedPopover, ActiveFilterTags } from "./people-filter-parts";

// ---------------------------------------------------------------------------
// Sort options
// ---------------------------------------------------------------------------

const SORT_OPTIONS: { label: string; value: SortSpec }[] = [
  { label: "Fila de Atenção", value: { field: "priority_score", dir: "desc" } },
  { label: "Score (menor primeiro)", value: { field: "media_avaliacao", dir: "asc" } },
  { label: "Score (maior primeiro)", value: { field: "media_avaliacao", dir: "desc" } },
  { label: "Nome (A→Z)", value: { field: "full_name", dir: "asc" } },
  { label: "Nome (Z→A)", value: { field: "full_name", dir: "desc" } },
  { label: "Data de início (recente)", value: { field: "start_date", dir: "desc" } },
  { label: "Data de início (antigo)", value: { field: "start_date", dir: "asc" } },
  { label: "Atualizado recentemente", value: { field: "updated_at", dir: "desc" } },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PeopleFiltersProps {
  filters: PeopleFiltersSpec;
  sort: SortSpec[];
  onFiltersChange: (filters: PeopleFiltersSpec) => void;
  onSortChange: (sort: SortSpec[]) => void;
  filterOptions?: {
    areas: string[];
    teams: string[];
    seniorities: string[];
    employmentTypes: string[];
    leaders: { id: string; name: string }[];
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PeopleFilters({
  filters: filtersProp,
  sort,
  onFiltersChange,
  onSortChange,
  filterOptions,
}: PeopleFiltersProps) {
  const filters = filtersProp ?? {};
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const activeStatusList = filters.status ?? [];
  const activeFilterCount = countActiveFilterGroups(filters);
  const search = filters.search ?? "";
  const currentSort = sort[0] ?? { field: "full_name", dir: "asc" };

  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, search: value || undefined });
    },
    [filters, onFiltersChange]
  );

  const toggleStatus = useCallback(
    (key: string) => {
      const current = filters.status ?? [];
      const next = current.includes(key)
        ? current.filter((s) => s !== key)
        : [...current, key];
      onFiltersChange({ ...filters, status: next.length > 0 ? next : undefined, kpi: undefined });
    },
    [filters, onFiltersChange]
  );

  const clearAllStatuses = useCallback(() => {
    onFiltersChange({ ...filters, status: undefined, kpi: undefined });
  }, [filters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({ search: filters.search });
  }, [filters, onFiltersChange]);

  return (
    <div className="space-y-3">
      {/* Row 1: Search + Advanced filter button + Sort */}
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <FilterAdvancedPopover
          open={advancedOpen}
          onOpenChange={setAdvancedOpen}
          filters={filters}
          filterOptions={filterOptions}
          onFiltersChange={onFiltersChange}
          onClearAll={clearAllFilters}
        />

        {/* Sort popover */}
        <Popover open={sortOpen} onOpenChange={setSortOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <IconArrowsUpDown className="h-4 w-4" />
              Ordenar
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1" align="start">
            {SORT_OPTIONS.map((opt) => {
              const isActive =
                currentSort.field === opt.value.field &&
                currentSort.dir === opt.value.dir;
              return (
                <button
                  key={`${opt.value.field}-${opt.value.dir}`}
                  className={`w-full rounded-sm px-3 py-1.5 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-gray-100 font-medium text-gray-900"
                      : "hover:bg-gray-100/50"
                  }`}
                  onClick={() => {
                    onSortChange([opt.value]);
                    setSortOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
      </div>

      {/* Row 2: Status chips */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={activeStatusList.length === 0 && !filters.kpi ? "default" : "outline"}
          className="cursor-pointer"
          onClick={clearAllStatuses}
        >
          Todos
        </Badge>
        {Object.entries(PEOPLE_STATUS).map(([key, cfg]) => {
          const isActive = activeStatusList.includes(key);
          return (
            <Badge
              key={key}
              variant={isActive ? "default" : "outline"}
              className="cursor-pointer"
              style={isActive ? { backgroundColor: cfg.color, color: "#fff" } : undefined}
              onClick={() => toggleStatus(key)}
            >
              {cfg.label}
            </Badge>
          );
        })}
      </div>

      {/* Active filter tags */}
      {activeFilterCount > 0 && (
        <ActiveFilterTags
          filters={filters}
          filterOptions={filterOptions}
          onFiltersChange={onFiltersChange}
        />
      )}
    </div>
  );
}
