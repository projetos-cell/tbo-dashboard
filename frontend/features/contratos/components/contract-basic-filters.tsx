"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconFilter, IconArrowsUpDown } from "@tabler/icons-react";
import {
  CONTRACT_STATUS,
  CONTRACT_CATEGORY,
  CONTRACT_TYPE,
  CONTRACT_SORT_OPTIONS,
  type ContractStatusKey,
  type ContractCategoryKey,
  type ContractTypeKey,
  type ContractSortValue,
} from "@/lib/constants";
import type { ContractFilters } from "@/features/contratos/services/contracts";
import { FilterChip, FilterSection, toggleInArray } from "./contract-filter-helpers";

interface ContractBasicFiltersProps {
  filters: ContractFilters;
  lockedCategories?: readonly string[];
  personNames: string[];
  onUpdate: (partial: Partial<ContractFilters>) => void;
}

export function ContractBasicFilters({
  filters,
  lockedCategories,
  personNames,
  onUpdate,
}: ContractBasicFiltersProps) {
  return (
    <>
      {/* Status */}
      <FilterSection icon={IconFilter} title="Status">
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(CONTRACT_STATUS) as [ContractStatusKey, (typeof CONTRACT_STATUS)[ContractStatusKey]][]).map(
            ([key, cfg]) => (
              <FilterChip
                key={key}
                label={cfg.label}
                color={cfg.color}
                bg={cfg.bg}
                active={filters.statuses?.includes(key) ?? false}
                onClick={() => onUpdate({ statuses: toggleInArray(filters.statuses, key) })}
              />
            ),
          )}
        </div>
      </FilterSection>

      {/* Categoria (hidden when tab locks it) */}
      {!lockedCategories?.length && (
        <FilterSection icon={IconFilter} title="Tipo de Relação">
          <div className="flex flex-wrap gap-1.5">
            {(Object.entries(CONTRACT_CATEGORY) as [ContractCategoryKey, (typeof CONTRACT_CATEGORY)[ContractCategoryKey]][]).map(
              ([key, cfg]) => (
                <FilterChip
                  key={key}
                  label={cfg.label}
                  color={cfg.color}
                  bg={cfg.bg}
                  active={filters.categories?.includes(key) ?? false}
                  onClick={() => onUpdate({ categories: toggleInArray(filters.categories, key) })}
                />
              ),
            )}
          </div>
        </FilterSection>
      )}

      {/* Tipo de Contrato */}
      <FilterSection icon={IconFilter} title="Tipo de Contrato">
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(CONTRACT_TYPE) as [ContractTypeKey, (typeof CONTRACT_TYPE)[ContractTypeKey]][]).map(
            ([key, cfg]) => (
              <FilterChip
                key={key}
                label={cfg.label}
                active={filters.types?.includes(key) ?? false}
                onClick={() => onUpdate({ types: toggleInArray(filters.types, key) })}
              />
            ),
          )}
        </div>
      </FilterSection>

      {/* Responsável */}
      {personNames.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Responsável
          </Label>
          <Select
            value={filters.personName ?? "__all__"}
            onValueChange={(v) =>
              onUpdate({ personName: v === "__all__" ? undefined : v })
            }
          >
            <SelectTrigger size="sm" className="w-full text-sm">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {personNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Ordenação */}
      <FilterSection icon={IconArrowsUpDown} title="Ordenação">
        <Select
          value={filters.sortBy ?? "__default__"}
          onValueChange={(v) =>
            onUpdate({ sortBy: v === "__default__" ? undefined : (v as ContractSortValue) })
          }
        >
          <SelectTrigger size="sm" className="w-full text-sm">
            <SelectValue placeholder="Padrão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__default__">Padrão</SelectItem>
            {CONTRACT_SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>
    </>
  );
}
