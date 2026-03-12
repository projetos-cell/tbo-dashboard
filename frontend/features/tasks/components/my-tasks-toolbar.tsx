"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowUpDown,
  Filter,
  Layers,
  Check,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";

// ─── Sort Config ──────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "manual", label: "Manual (seções)" },
  { value: "due_date", label: "Prazo" },
  { value: "priority", label: "Prioridade" },
  { value: "status", label: "Status" },
  { value: "created_at", label: "Data de criação" },
  { value: "title", label: "Alfabético" },
] as const;

// ─── Group Config ─────────────────────────────────────────────

const GROUP_OPTIONS = [
  { value: "section", label: "Seções (manual)" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Prioridade" },
  { value: "due_date", label: "Prazo" },
  { value: "project_id", label: "Projeto" },
  { value: "none", label: "Sem agrupamento" },
] as const;

// ─── Filter Presets ───────────────────────────────────────────

interface FilterRule {
  field: string;
  operator: string;
  value: string;
}

interface MyTasksFilters {
  rules?: FilterRule[];
  [key: string]: unknown;
}

// ─── Component ────────────────────────────────────────────────

interface MyTasksToolbarProps {
  sortBy: string;
  sortDirection: "asc" | "desc";
  groupBy: string;
  filters: Record<string, unknown>;
  onUpdate: (updates: Record<string, unknown>) => void;
}

export function MyTasksToolbar({
  sortBy,
  sortDirection,
  groupBy,
  filters,
  onUpdate,
}: MyTasksToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  const typedFilters = filters as MyTasksFilters;
  const activeFilterCount = typedFilters?.rules?.length ?? 0;
  const isSortActive = sortBy !== "manual";
  const isGroupActive = groupBy !== "section";

  return (
    <div className="flex items-center gap-1.5">
      {/* ─── Sort ─── */}
      <Popover open={sortOpen} onOpenChange={setSortOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 gap-1.5 text-xs font-medium",
              isSortActive && "text-primary"
            )}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Ordenar
            {isSortActive && (
              <Badge
                variant="secondary"
                className="ml-0.5 h-4 px-1 text-[9px]"
              >
                1
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1.5" align="start">
          <div className="space-y-0.5">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ordenar por
            </p>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onUpdate({
                    sort_by: opt.value,
                    sort_direction:
                      opt.value === sortBy
                        ? sortDirection === "asc"
                          ? "desc"
                          : "asc"
                        : "asc",
                  });
                  if (opt.value !== sortBy) setSortOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/60",
                  sortBy === opt.value && "bg-muted/40"
                )}
              >
                {sortBy === opt.value ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <span className="h-3.5 w-3.5" />
                )}
                <span className="flex-1 text-left">{opt.label}</span>
                {sortBy === opt.value && opt.value !== "manual" && (
                  <span className="text-muted-foreground">
                    {sortDirection === "asc" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* ─── Filter ─── */}
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 gap-1.5 text-xs font-medium",
              activeFilterCount > 0 && "text-primary"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Filtrar
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-0.5 h-4 px-1 text-[9px]"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2" align="start">
          <FilterPanel
            filters={typedFilters}
            onUpdate={(f) => onUpdate({ filters: f })}
          />
        </PopoverContent>
      </Popover>

      {/* ─── Group ─── */}
      <Popover open={groupOpen} onOpenChange={setGroupOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 gap-1.5 text-xs font-medium",
              isGroupActive && "text-primary"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            Agrupar
            {isGroupActive && (
              <Badge
                variant="secondary"
                className="ml-0.5 h-4 px-1 text-[9px]"
              >
                1
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-1.5" align="start">
          <div className="space-y-0.5">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Agrupar por
            </p>
            {GROUP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onUpdate({ group_by: opt.value });
                  setGroupOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/60",
                  groupBy === opt.value && "bg-muted/40"
                )}
              >
                {groupBy === opt.value ? (
                  <Check className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <span className="h-3.5 w-3.5" />
                )}
                <span className="flex-1 text-left">{opt.label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────

const FILTER_FIELDS = [
  { value: "status", label: "Status" },
  { value: "priority", label: "Prioridade" },
] as const;

const FILTER_OPERATORS = [
  { value: "is", label: "é" },
  { value: "is_not", label: "não é" },
] as const;

function getFieldValues(field: string): { value: string; label: string }[] {
  if (field === "status") {
    return Object.entries(TASK_STATUS).map(([k, v]) => ({
      value: k,
      label: v.label,
    }));
  }
  if (field === "priority") {
    return Object.entries(TASK_PRIORITY).map(([k, v]) => ({
      value: k,
      label: v.label,
    }));
  }
  return [];
}

function FilterPanel({
  filters,
  onUpdate,
}: {
  filters: MyTasksFilters;
  onUpdate: (f: MyTasksFilters) => void;
}) {
  const rules = filters?.rules ?? [];

  const addRule = () => {
    onUpdate({
      ...filters,
      rules: [...rules, { field: "status", operator: "is", value: "pendente" }],
    });
  };

  const removeRule = (index: number) => {
    const next = rules.filter((_, i) => i !== index);
    onUpdate({ ...filters, rules: next });
  };

  const updateRule = (index: number, partial: Partial<FilterRule>) => {
    const next = rules.map((r, i) =>
      i === index ? { ...r, ...partial } : r
    );
    // Reset value if field changed
    if (partial.field && partial.field !== rules[index].field) {
      const firstVal = getFieldValues(partial.field)[0]?.value ?? "";
      next[index] = { ...next[index], value: firstVal };
    }
    onUpdate({ ...filters, rules: next });
  };

  const clearAll = () => {
    onUpdate({ ...filters, rules: [] });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Filtros
        </p>
        {rules.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpar tudo
          </button>
        )}
      </div>

      {rules.length === 0 && (
        <p className="text-xs text-muted-foreground py-2 text-center">
          Nenhum filtro ativo
        </p>
      )}

      {rules.map((rule, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <select
            value={rule.field}
            onChange={(e) => updateRule(idx, { field: e.target.value })}
            className="h-7 flex-1 rounded-md border bg-background px-1.5 text-xs"
          >
            {FILTER_FIELDS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <select
            value={rule.operator}
            onChange={(e) => updateRule(idx, { operator: e.target.value })}
            className="h-7 w-16 rounded-md border bg-background px-1.5 text-xs"
          >
            {FILTER_OPERATORS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={rule.value}
            onChange={(e) => updateRule(idx, { value: e.target.value })}
            className="h-7 flex-1 rounded-md border bg-background px-1.5 text-xs"
          >
            {getFieldValues(rule.field).map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => removeRule(idx)}
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-full text-xs"
        onClick={addRule}
      >
        + Adicionar filtro
      </Button>
    </div>
  );
}
