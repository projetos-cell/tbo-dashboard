"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PEOPLE_STATUS } from "@/lib/constants";
import {
  type PeopleFiltersSpec,
  countActiveFilterGroups,
} from "@/features/people/utils/people-filters";
import { IconSearch, IconAdjustmentsHorizontal, IconX, IconArrowsUpDown } from "@tabler/icons-react";
import type { SortSpec } from "@/services/view-state";

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

  // Debounced search is handled by the parent (page.tsx)
  const search = filters.search ?? "";

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

  const currentSort = sort[0] ?? { field: "full_name", dir: "asc" };

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

        {/* Advanced filters popover */}
        <Popover open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <IconAdjustmentsHorizontal className="h-4 w-4" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="text-sm font-medium">Filtros avançados</span>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearAllFilters}>
                  Limpar tudo
                </Button>
              )}
            </div>
            <ScrollArea className="max-h-80">
              <div className="space-y-1 p-3">
                {/* Area (BU) */}
                <FilterSection
                  label="Área (BU)"
                  options={filterOptions?.areas ?? []}
                  selected={filters.area ?? []}
                  onChange={(v) => onFiltersChange({ ...filters, area: v.length ? v : undefined })}
                />

                <Separator className="my-2" />

                {/* Team (department) */}
                <FilterSection
                  label="Time"
                  options={filterOptions?.teams ?? []}
                  selected={filters.team ?? []}
                  onChange={(v) => onFiltersChange({ ...filters, team: v.length ? v : undefined })}
                />

                <Separator className="my-2" />

                {/* Leader */}
                <FilterSection
                  label="Líder"
                  options={filterOptions?.leaders?.map((l) => l.name) ?? []}
                  optionValues={filterOptions?.leaders?.map((l) => l.id)}
                  selected={filters.leader_id ?? []}
                  onChange={(v) => onFiltersChange({ ...filters, leader_id: v.length ? v : undefined })}
                />

                <Separator className="my-2" />

                {/* Seniority */}
                <FilterSection
                  label="Senioridade"
                  options={filterOptions?.seniorities ?? []}
                  selected={filters.seniority ?? []}
                  onChange={(v) => onFiltersChange({ ...filters, seniority: v.length ? v : undefined })}
                />

                <Separator className="my-2" />

                {/* Employment type */}
                <FilterSection
                  label="Tipo de contrato"
                  options={filterOptions?.employmentTypes ?? []}
                  selected={filters.employment_type ?? []}
                  onChange={(v) => onFiltersChange({ ...filters, employment_type: v.length ? v : undefined })}
                />
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

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
              style={
                isActive
                  ? { backgroundColor: cfg.color, color: "#fff" }
                  : undefined
              }
              onClick={() => toggleStatus(key)}
            >
              {cfg.label}
            </Badge>
          );
        })}
      </div>

      {/* Active filter tags (removable) */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-500">Filtros:</span>
          {filters.area?.map((v) => (
            <FilterTag
              key={`area-${v}`}
              label={`Área: ${v}`}
              onRemove={() => {
                const next = (filters.area ?? []).filter((x) => x !== v);
                onFiltersChange({ ...filters, area: next.length ? next : undefined });
              }}
            />
          ))}
          {filters.team?.map((v) => (
            <FilterTag
              key={`team-${v}`}
              label={`Time: ${v}`}
              onRemove={() => {
                const next = (filters.team ?? []).filter((x) => x !== v);
                onFiltersChange({ ...filters, team: next.length ? next : undefined });
              }}
            />
          ))}
          {filters.leader_id?.map((v) => {
            const name = filterOptions?.leaders?.find((l) => l.id === v)?.name ?? v;
            return (
              <FilterTag
                key={`leader-${v}`}
                label={`Líder: ${name}`}
                onRemove={() => {
                  const next = (filters.leader_id ?? []).filter((x) => x !== v);
                  onFiltersChange({ ...filters, leader_id: next.length ? next : undefined });
                }}
              />
            );
          })}
          {filters.seniority?.map((v) => (
            <FilterTag
              key={`seniority-${v}`}
              label={`Senioridade: ${v}`}
              onRemove={() => {
                const next = (filters.seniority ?? []).filter((x) => x !== v);
                onFiltersChange({ ...filters, seniority: next.length ? next : undefined });
              }}
            />
          ))}
          {filters.employment_type?.map((v) => (
            <FilterTag
              key={`emp-${v}`}
              label={`Contrato: ${v}`}
              onRemove={() => {
                const next = (filters.employment_type ?? []).filter((x) => x !== v);
                onFiltersChange({ ...filters, employment_type: next.length ? next : undefined });
              }}
            />
          ))}
          {filters.kpi && (
            <FilterTag
              label={`KPI: ${filters.kpi}`}
              onRemove={() => onFiltersChange({ ...filters, kpi: undefined })}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FilterSection — multi-select checkbox list within the popover
// ---------------------------------------------------------------------------

function FilterSection({
  label,
  options,
  optionValues,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  optionValues?: string[]; // Use when display differs from stored value (e.g. leader name vs id)
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  if (options.length === 0) {
    return (
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="py-1 text-xs text-gray-400">Nenhuma opção</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
      <div className="space-y-1">
        {options.map((opt, i) => {
          const value = optionValues?.[i] ?? opt;
          const isChecked = selected.includes(value);
          return (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-1 py-0.5 text-sm hover:bg-gray-100/50"
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => {
                  const next = isChecked
                    ? selected.filter((s) => s !== value)
                    : [...selected, value];
                  onChange(next);
                }}
              />
              <span className="truncate">{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FilterTag — removable chip showing an active filter
// ---------------------------------------------------------------------------

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1 text-xs">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-gray-100-foreground/20"
      >
        <IconX className="h-3 w-3" />
      </button>
    </Badge>
  );
}
