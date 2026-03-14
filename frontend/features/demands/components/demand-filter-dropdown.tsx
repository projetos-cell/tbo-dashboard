"use client";

import { IconFilter } from "@tabler/icons-react";
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
import { DEMAND_STATUS, DEMAND_PRIORITY, BU_COLORS } from "@/lib/constants";
import type { DemandsFilters } from "./demands-toolbar";

interface DemandFilterDropdownProps {
  filters: DemandsFilters;
  onFiltersChange: (filters: DemandsFilters) => void;
  activeCount: number;
}

export function DemandFilterDropdown({
  filters,
  onFiltersChange,
  activeCount,
}: DemandFilterDropdownProps) {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <IconFilter className="size-3.5" />
          Filtros
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-[10px] px-1">
              {activeCount}
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
  );
}
