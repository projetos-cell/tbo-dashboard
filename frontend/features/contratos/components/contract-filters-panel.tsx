"use client";

import { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SlidersHorizontal,
  X,
  Calendar,
  DollarSign,
  Filter,
  ArrowUpDown,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
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

// ─── Types ───────────────────────────────────────────────────────────
interface ContractFiltersPanelProps {
  filters: ContractFilters;
  onChange: (filters: ContractFilters) => void;
  /** Unique person names for the "Responsável" dropdown */
  personNames: string[];
  /** Active tab categories (locked by tab selection) */
  lockedCategories?: readonly string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────

function countActiveFilters(
  filters: ContractFilters,
  lockedCategories?: readonly string[],
): number {
  let count = 0;
  if (filters.statuses?.length) count++;
  if (filters.categories?.length && !lockedCategories?.length) count++;
  if (filters.types?.length) count++;
  if (filters.personName) count++;
  if (filters.sortBy) count++;
  if (filters.endDateFrom || filters.endDateTo) count++;
  if (filters.renewalWindowDays) count++;
  if (filters.valueMin != null || filters.valueMax != null) count++;
  if (filters.dynamicStatuses?.length) count++;
  return count;
}

/** Month shortcut: returns { from, to } ISO date strings for given month offset */
function getMonthRange(offset: number): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return {
    from: start.toISOString().split("T")[0],
    to: end.toISOString().split("T")[0],
  };
}

// ─── Multi-select toggle helper ──────────────────────────────────────

function toggleInArray<T extends string>(
  arr: readonly T[] | undefined,
  value: T,
): T[] {
  const current = arr ? [...arr] : [];
  const idx = current.indexOf(value);
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(value);
  }
  return current;
}

// ─── Filter chip ─────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  color,
  bg,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  bg?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium
        transition-all duration-150 select-none border
        ${
          active
            ? "border-transparent shadow-sm"
            : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-transparent"
        }
      `}
      style={
        active
          ? { backgroundColor: bg ?? "rgba(249,115,22,0.12)", color: color ?? "#f97316" }
          : undefined
      }
    >
      {label}
      {active && <X className="h-3 w-3 ml-0.5" />}
    </button>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────

function FilterSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

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

  // ── Shortcut buttons for month ranges ─────────────────────────
  const currentMonth = getMonthRange(0);
  const nextMonth = getMonthRange(1);

  const isCurrentMonth =
    filters.endDateFrom === currentMonth.from &&
    filters.endDateTo === currentMonth.to;
  const isNextMonth =
    filters.endDateFrom === nextMonth.from &&
    filters.endDateTo === nextMonth.to;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 relative"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {activeCount > 0 && (
            <Badge
              className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-[10px] font-bold bg-[#f97316] text-white border-0"
            >
              {activeCount}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
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
            <Filter className="h-4 w-4 text-muted-foreground" />
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
              <RotateCcw className="h-3 w-3" />
              Limpar
            </Button>
          )}
        </div>

        <div className="p-4 space-y-5">
          {/* ═══ 1. Filtros Básicos ═══════════════════════════════ */}

          {/* Status */}
          <FilterSection icon={Filter} title="Status">
            <div className="flex flex-wrap gap-1.5">
              {(Object.entries(CONTRACT_STATUS) as [ContractStatusKey, typeof CONTRACT_STATUS[ContractStatusKey]][]).map(
                ([key, cfg]) => (
                  <FilterChip
                    key={key}
                    label={cfg.label}
                    color={cfg.color}
                    bg={cfg.bg}
                    active={filters.statuses?.includes(key) ?? false}
                    onClick={() =>
                      update({
                        statuses: toggleInArray(filters.statuses, key),
                      })
                    }
                  />
                ),
              )}
            </div>
          </FilterSection>

          {/* Categoria (hidden when tab locks it) */}
          {!lockedCategories?.length && (
            <FilterSection icon={Filter} title="Tipo de Relação">
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(CONTRACT_CATEGORY) as [ContractCategoryKey, typeof CONTRACT_CATEGORY[ContractCategoryKey]][]).map(
                  ([key, cfg]) => (
                    <FilterChip
                      key={key}
                      label={cfg.label}
                      color={cfg.color}
                      bg={cfg.bg}
                      active={filters.categories?.includes(key) ?? false}
                      onClick={() =>
                        update({
                          categories: toggleInArray(filters.categories, key),
                        })
                      }
                    />
                  ),
                )}
              </div>
            </FilterSection>
          )}

          {/* Tipo de Contrato */}
          <FilterSection icon={Filter} title="Tipo de Contrato">
            <div className="flex flex-wrap gap-1.5">
              {(Object.entries(CONTRACT_TYPE) as [ContractTypeKey, typeof CONTRACT_TYPE[ContractTypeKey]][]).map(
                ([key, cfg]) => (
                  <FilterChip
                    key={key}
                    label={cfg.label}
                    active={filters.types?.includes(key) ?? false}
                    onClick={() =>
                      update({
                        types: toggleInArray(filters.types, key),
                      })
                    }
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
                  update({ personName: v === "__all__" ? undefined : v })
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
          <FilterSection icon={ArrowUpDown} title="Ordenação">
            <Select
              value={filters.sortBy ?? "__default__"}
              onValueChange={(v) =>
                update({
                  sortBy: v === "__default__" ? undefined : (v as ContractSortValue),
                })
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

          {/* ═══ 2. Filtros de Temporalidade ═══════════════════════ */}
          <FilterSection icon={Calendar} title="Período de Vencimento">
            {/* Atalhos de mês */}
            <div className="flex gap-1.5 mb-2">
              <Button
                variant={isCurrentMonth ? "default" : "outline"}
                size="sm"
                className={`text-xs h-7 ${isCurrentMonth ? "bg-[#f97316] hover:bg-[#ea580c] text-white" : ""}`}
                onClick={() => {
                  if (isCurrentMonth) {
                    update({ endDateFrom: undefined, endDateTo: undefined });
                  } else {
                    update({ endDateFrom: currentMonth.from, endDateTo: currentMonth.to, renewalWindowDays: undefined });
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
                    update({ endDateFrom: undefined, endDateTo: undefined });
                  } else {
                    update({ endDateFrom: nextMonth.from, endDateTo: nextMonth.to, renewalWindowDays: undefined });
                  }
                }}
              >
                Próximo Mês
              </Button>
            </div>

            {/* Date range inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">De</Label>
                <input
                  type="date"
                  value={filters.endDateFrom ?? ""}
                  onChange={(e) =>
                    update({
                      endDateFrom: e.target.value || undefined,
                      renewalWindowDays: undefined,
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Até</Label>
                <input
                  type="date"
                  value={filters.endDateTo ?? ""}
                  min={filters.endDateFrom ?? undefined}
                  onChange={(e) =>
                    update({
                      endDateTo: e.target.value || undefined,
                      renewalWindowDays: undefined,
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Janela de Renovação */}
            <div className="pt-2 space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">
                Janela de Renovação
              </Label>
              <div className="flex gap-1.5">
                {CONTRACT_RENEWAL_WINDOWS.map((w) => {
                  const active = filters.renewalWindowDays === w.value;
                  return (
                    <Button
                      key={w.value}
                      variant={active ? "default" : "outline"}
                      size="sm"
                      className={`text-xs h-7 ${active ? "bg-[#f97316] hover:bg-[#ea580c] text-white" : ""}`}
                      onClick={() =>
                        update({
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

          {/* ═══ 3. Filtros Financeiros ════════════════════════════ */}
          <FilterSection icon={DollarSign} title="Faixa de Valor (mensal)">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Mínimo</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    R$
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={100}
                    placeholder="0"
                    value={filters.valueMin ?? ""}
                    onChange={(e) =>
                      update({
                        valueMin: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="pl-8 h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Máximo</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    R$
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={100}
                    placeholder="∞"
                    value={filters.valueMax ?? ""}
                    onChange={(e) =>
                      update({
                        valueMax: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="pl-8 h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </FilterSection>

          {/* ═══ 4. Status Dinâmicos ══════════════════════════════ */}
          <FilterSection icon={Filter} title="Status Dinâmicos">
            <div className="flex flex-wrap gap-1.5">
              {(Object.entries(CONTRACT_DYNAMIC_STATUS) as [ContractDynamicStatusKey, typeof CONTRACT_DYNAMIC_STATUS[ContractDynamicStatusKey]][]).map(
                ([key, cfg]) => (
                  <FilterChip
                    key={key}
                    label={cfg.label}
                    color={cfg.color}
                    bg={cfg.bg}
                    active={filters.dynamicStatuses?.includes(key) ?? false}
                    onClick={() =>
                      update({
                        dynamicStatuses: toggleInArray(
                          filters.dynamicStatuses,
                          key,
                        ),
                      })
                    }
                  />
                ),
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Filtros computados com base em status + arquivos anexados.
            </p>
          </FilterSection>
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

// ─── Active filters bar (shows below search) ─────────────────────────

interface ActiveFiltersBadgesProps {
  filters: ContractFilters;
  onChange: (filters: ContractFilters) => void;
  lockedCategories?: readonly string[];
}

export function ActiveFiltersBadges({
  filters,
  onChange,
  lockedCategories,
}: ActiveFiltersBadgesProps) {
  const badges: { label: string; onRemove: () => void }[] = [];

  // Statuses
  if (filters.statuses?.length) {
    for (const s of filters.statuses) {
      const cfg = CONTRACT_STATUS[s as ContractStatusKey];
      badges.push({
        label: `Status: ${cfg?.label ?? s}`,
        onRemove: () =>
          onChange({
            ...filters,
            statuses: filters.statuses?.filter((x) => x !== s),
          }),
      });
    }
  }

  // Categories (not locked by tab)
  if (filters.categories?.length && !lockedCategories?.length) {
    for (const c of filters.categories) {
      const cfg = CONTRACT_CATEGORY[c as ContractCategoryKey];
      badges.push({
        label: `Relação: ${cfg?.label ?? c}`,
        onRemove: () =>
          onChange({
            ...filters,
            categories: filters.categories?.filter((x) => x !== c),
          }),
      });
    }
  }

  // Types
  if (filters.types?.length) {
    for (const t of filters.types) {
      const cfg = CONTRACT_TYPE[t as ContractTypeKey];
      badges.push({
        label: `Tipo: ${cfg?.label ?? t}`,
        onRemove: () =>
          onChange({
            ...filters,
            types: filters.types?.filter((x) => x !== t),
          }),
      });
    }
  }

  // Person
  if (filters.personName) {
    badges.push({
      label: `Responsável: ${filters.personName}`,
      onRemove: () => onChange({ ...filters, personName: undefined }),
    });
  }

  // Sort
  if (filters.sortBy) {
    const sortOpt = CONTRACT_SORT_OPTIONS.find((o) => o.value === filters.sortBy);
    badges.push({
      label: `Ordem: ${sortOpt?.label ?? filters.sortBy}`,
      onRemove: () => onChange({ ...filters, sortBy: undefined }),
    });
  }

  // Date range
  if (filters.endDateFrom || filters.endDateTo) {
    const from = filters.endDateFrom
      ? new Date(filters.endDateFrom + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
      : "…";
    const to = filters.endDateTo
      ? new Date(filters.endDateTo + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
      : "…";
    badges.push({
      label: `Vencimento: ${from} → ${to}`,
      onRemove: () =>
        onChange({ ...filters, endDateFrom: undefined, endDateTo: undefined }),
    });
  }

  // Renewal window
  if (filters.renewalWindowDays) {
    badges.push({
      label: `Renovação: ${filters.renewalWindowDays} dias`,
      onRemove: () => onChange({ ...filters, renewalWindowDays: undefined }),
    });
  }

  // Value range
  if (filters.valueMin != null || filters.valueMax != null) {
    const min = filters.valueMin != null ? `R$${filters.valueMin.toLocaleString("pt-BR")}` : "…";
    const max = filters.valueMax != null ? `R$${filters.valueMax.toLocaleString("pt-BR")}` : "∞";
    badges.push({
      label: `Valor: ${min} – ${max}`,
      onRemove: () =>
        onChange({ ...filters, valueMin: undefined, valueMax: undefined }),
    });
  }

  // Dynamic statuses
  if (filters.dynamicStatuses?.length) {
    for (const ds of filters.dynamicStatuses) {
      const cfg = CONTRACT_DYNAMIC_STATUS[ds];
      badges.push({
        label: cfg.label,
        onRemove: () =>
          onChange({
            ...filters,
            dynamicStatuses: filters.dynamicStatuses?.filter((x) => x !== ds),
          }),
      });
    }
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {badges.map((b, i) => (
        <Badge
          key={`${b.label}-${i}`}
          variant="secondary"
          className="gap-1 text-xs pl-2 pr-1.5 py-0.5 cursor-pointer hover:bg-muted/80 transition-colors"
          onClick={b.onRemove}
        >
          {b.label}
          <X className="h-3 w-3" />
        </Badge>
      ))}
      <button
        type="button"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
        onClick={() =>
          onChange({
            search: filters.search,
            categories: lockedCategories ? [...lockedCategories] : undefined,
          })
        }
      >
        Limpar tudo
      </button>
    </div>
  );
}
