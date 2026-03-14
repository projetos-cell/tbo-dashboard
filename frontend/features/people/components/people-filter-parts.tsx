"use client";

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
import { IconAdjustmentsHorizontal, IconX } from "@tabler/icons-react";
import type { PeopleFiltersSpec } from "@/features/people/utils/people-filters";
import { countActiveFilterGroups } from "@/features/people/utils/people-filters";

// ---------------------------------------------------------------------------
// FilterSection — multi-select checkbox list within the popover
// ---------------------------------------------------------------------------

export function FilterSection({
  label,
  options,
  optionValues,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  optionValues?: string[];
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

export function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
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

// ---------------------------------------------------------------------------
// FilterAdvancedPopover — advanced filters popover with checkboxes
// ---------------------------------------------------------------------------

interface FilterAdvancedPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: PeopleFiltersSpec;
  filterOptions?: {
    areas: string[];
    teams: string[];
    seniorities: string[];
    employmentTypes: string[];
    leaders: { id: string; name: string }[];
  };
  onFiltersChange: (filters: PeopleFiltersSpec) => void;
  onClearAll: () => void;
}

export function FilterAdvancedPopover({
  open,
  onOpenChange,
  filters,
  filterOptions,
  onFiltersChange,
  onClearAll,
}: FilterAdvancedPopoverProps) {
  const activeFilterCount = countActiveFilterGroups(filters);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
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
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClearAll}>
              Limpar tudo
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          <div className="space-y-1 p-3">
            <FilterSection
              label="Área (BU)"
              options={filterOptions?.areas ?? []}
              selected={filters.area ?? []}
              onChange={(v) => onFiltersChange({ ...filters, area: v.length ? v : undefined })}
            />
            <Separator className="my-2" />
            <FilterSection
              label="Time"
              options={filterOptions?.teams ?? []}
              selected={filters.team ?? []}
              onChange={(v) => onFiltersChange({ ...filters, team: v.length ? v : undefined })}
            />
            <Separator className="my-2" />
            <FilterSection
              label="Líder"
              options={filterOptions?.leaders?.map((l) => l.name) ?? []}
              optionValues={filterOptions?.leaders?.map((l) => l.id)}
              selected={filters.leader_id ?? []}
              onChange={(v) => onFiltersChange({ ...filters, leader_id: v.length ? v : undefined })}
            />
            <Separator className="my-2" />
            <FilterSection
              label="Senioridade"
              options={filterOptions?.seniorities ?? []}
              selected={filters.seniority ?? []}
              onChange={(v) => onFiltersChange({ ...filters, seniority: v.length ? v : undefined })}
            />
            <Separator className="my-2" />
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
  );
}

// ---------------------------------------------------------------------------
// ActiveFilterTags — removable chips for all active filters
// ---------------------------------------------------------------------------

interface ActiveFilterTagsProps {
  filters: PeopleFiltersSpec;
  filterOptions?: {
    leaders: { id: string; name: string }[];
  };
  onFiltersChange: (filters: PeopleFiltersSpec) => void;
}

export function ActiveFilterTags({ filters, filterOptions, onFiltersChange }: ActiveFilterTagsProps) {
  const activeFilterCount = countActiveFilterGroups(filters);
  if (activeFilterCount === 0) return null;

  return (
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
  );
}
