"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconFilter,
  IconArrowsUpDown,
  IconCalendar,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import {
  CONTRACT_STATUS,
  CONTRACT_CATEGORY,
  CONTRACT_TYPE,
  CONTRACT_SORT_OPTIONS,
  CONTRACT_RENEWAL_WINDOWS,
  CONTRACT_DYNAMIC_STATUS,
  type ContractStatusKey,
  type ContractCategoryKey,
  type ContractTypeKey,
  type ContractSortValue,
  type ContractDynamicStatusKey,
} from "@/lib/constants";
import type { ContractFilters } from "@/features/contratos/services/contracts";
import { FilterChip, FilterSection, getMonthRange, toggleInArray } from "./contract-filter-helpers";

// ─── Basic filters (status / category / type / responsible / sort) ────

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

// ─── Temporal filters (date range + renewal window) ───────────────────

interface ContractTemporalFiltersProps {
  endDateFrom: string | undefined;
  endDateTo: string | undefined;
  renewalWindowDays: number | undefined;
  onUpdate: (partial: Partial<ContractFilters>) => void;
}

export function ContractTemporalFilters({
  endDateFrom,
  endDateTo,
  renewalWindowDays,
  onUpdate,
}: ContractTemporalFiltersProps) {
  const currentMonth = getMonthRange(0);
  const nextMonth = getMonthRange(1);

  const isCurrentMonth = endDateFrom === currentMonth.from && endDateTo === currentMonth.to;
  const isNextMonth = endDateFrom === nextMonth.from && endDateTo === nextMonth.to;

  return (
    <FilterSection icon={IconCalendar} title="Período de Vencimento">
      {/* Month shortcuts */}
      <div className="flex gap-1.5 mb-2">
        <Button
          variant={isCurrentMonth ? "default" : "outline"}
          size="sm"
          className={`text-xs h-7 ${isCurrentMonth ? "bg-[#f97316] hover:bg-[#ea580c] text-white" : ""}`}
          onClick={() => {
            if (isCurrentMonth) {
              onUpdate({ endDateFrom: undefined, endDateTo: undefined });
            } else {
              onUpdate({ endDateFrom: currentMonth.from, endDateTo: currentMonth.to, renewalWindowDays: undefined });
            }
          }}
        >
          Mês Atual
        </Button>
        <Button
          variant={isNextMonth ? "default" : "outline"}
          size="sm"
          className={`text-xs h-7 ${isNextMonth ? "bg-[#f97316] hover:bg-[#ea580c] text-white" : ""}`}
          onClick={() => {
            if (isNextMonth) {
              onUpdate({ endDateFrom: undefined, endDateTo: undefined });
            } else {
              onUpdate({ endDateFrom: nextMonth.from, endDateTo: nextMonth.to, renewalWindowDays: undefined });
            }
          }}
        >
          Próximo Mês
        </Button>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">De</Label>
          <input
            type="date"
            value={endDateFrom ?? ""}
            onChange={(e) =>
              onUpdate({ endDateFrom: e.target.value || undefined, renewalWindowDays: undefined })
            }
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Até</Label>
          <input
            type="date"
            value={endDateTo ?? ""}
            min={endDateFrom ?? undefined}
            onChange={(e) =>
              onUpdate({ endDateTo: e.target.value || undefined, renewalWindowDays: undefined })
            }
            className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Renewal window */}
      <div className="pt-2 space-y-1.5">
        <Label className="text-[11px] text-muted-foreground">Janela de Renovação</Label>
        <div className="flex gap-1.5">
          {CONTRACT_RENEWAL_WINDOWS.map((w) => {
            const active = renewalWindowDays === w.value;
            return (
              <Button
                key={w.value}
                variant={active ? "default" : "outline"}
                size="sm"
                className={`text-xs h-7 ${active ? "bg-[#f97316] hover:bg-[#ea580c] text-white" : ""}`}
                onClick={() =>
                  onUpdate({
                    renewalWindowDays: active ? undefined : w.value,
                    endDateFrom: undefined,
                    endDateTo: undefined,
                  })
                }
              >
                {w.label}
              </Button>
            );
          })}
        </div>
      </div>
    </FilterSection>
  );
}

// ─── Advanced filters (financial + dynamic status) ────────────────────

interface ContractAdvancedFiltersProps {
  valueMin: number | undefined;
  valueMax: number | undefined;
  dynamicStatuses: ContractFilters["dynamicStatuses"];
  onUpdate: (partial: Partial<ContractFilters>) => void;
}

export function ContractAdvancedFilters({
  valueMin,
  valueMax,
  dynamicStatuses,
  onUpdate,
}: ContractAdvancedFiltersProps) {
  return (
    <>
      {/* Financial range */}
      <FilterSection icon={IconCurrencyDollar} title="Faixa de Valor (mensal)">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Mínimo</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
              <Input
                type="number"
                min={0}
                step={100}
                placeholder="0"
                value={valueMin ?? ""}
                onChange={(e) =>
                  onUpdate({ valueMin: e.target.value ? Number(e.target.value) : undefined })
                }
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Máximo</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
              <Input
                type="number"
                min={0}
                step={100}
                placeholder="∞"
                value={valueMax ?? ""}
                onChange={(e) =>
                  onUpdate({ valueMax: e.target.value ? Number(e.target.value) : undefined })
                }
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Dynamic status */}
      <FilterSection icon={IconFilter} title="Status Dinâmicos">
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(CONTRACT_DYNAMIC_STATUS) as [ContractDynamicStatusKey, (typeof CONTRACT_DYNAMIC_STATUS)[ContractDynamicStatusKey]][]).map(
            ([key, cfg]) => (
              <FilterChip
                key={key}
                label={cfg.label}
                color={cfg.color}
                bg={cfg.bg}
                active={dynamicStatuses?.includes(key) ?? false}
                onClick={() =>
                  onUpdate({ dynamicStatuses: toggleInArray(dynamicStatuses, key) })
                }
              />
            ),
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Filtros computados com base em status + arquivos anexados.
        </p>
      </FilterSection>
    </>
  );
}
