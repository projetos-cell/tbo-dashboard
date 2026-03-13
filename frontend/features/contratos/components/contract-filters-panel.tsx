"use client";

import { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  IconAdjustmentsHorizontal,
  IconFilter,
  IconChevronDown,
  IconRotate,
} from "@tabler/icons-react";
import type { ContractFilters } from "@/features/contratos/services/contracts";
import { countActiveFilters } from "./contract-filter-helpers";
import { ContractBasicFilters, ContractTemporalFilters, ContractAdvancedFilters } from "./contract-filter-sections";

export { ActiveFiltersBadges } from "./contract-active-filters-badges";

// ─── Types ────────────────────────────────────────────────────────────

interface ContractFiltersPanelProps {
  filters: ContractFilters;
  onChange: (filters: ContractFilters) => void;
  personNames: string[];
  lockedCategories?: readonly string[];
}

// ─── Main Component ───────────────────────────────────────────────────

export function ContractFiltersPanel({
  filters,
  onChange,
  personNames,
  lockedCategories,
}: ContractFiltersPanelProps) {
  const [open, setOpen] = useState(false);

  const activeCount = useMemo(
    () => countActiveFilters(filters, lockedCategories),
    [filters, lockedCategories],
  );

  const update = useCallback(
    (partial: Partial<ContractFilters>) => {
      onChange({ ...filters, ...partial });
    },
    [filters, onChange],
  );

  const clearAll = useCallback(() => {
    onChange({
      search: filters.search,
      categories: lockedCategories ? [...lockedCategories] : undefined,
    });
  }, [filters.search, lockedCategories, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 relative">
          <IconAdjustmentsHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {activeCount > 0 && (
            <Badge className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-[10px] font-bold bg-[#f97316] text-white border-0">
              {activeCount}
            </Badge>
          )}
          <IconChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[380px] p-0 max-h-[80vh] overflow-y-auto"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-popover border-b border-border/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconFilter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Filtros Avançados</span>
            {activeCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {activeCount} ativo{activeCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
              onClick={clearAll}
            >
              <IconRotate className="h-3 w-3" />
              Limpar
            </Button>
          )}
        </div>

        <div className="p-4 space-y-5">
          <ContractBasicFilters
            filters={filters}
            lockedCategories={lockedCategories}
            personNames={personNames}
            onUpdate={update}
          />
          <ContractTemporalFilters
            endDateFrom={filters.endDateFrom}
            endDateTo={filters.endDateTo}
            renewalWindowDays={filters.renewalWindowDays}
            onUpdate={update}
          />
          <ContractAdvancedFilters
            valueMin={filters.valueMin}
            valueMax={filters.valueMax}
            dynamicStatuses={filters.dynamicStatuses}
            onUpdate={update}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-popover border-t border-border/50 px-4 py-3 flex justify-end">
          <Button
            size="sm"
            className="bg-[#f97316] hover:bg-[#ea580c] text-white"
            onClick={() => setOpen(false)}
          >
            Aplicar Filtros
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
