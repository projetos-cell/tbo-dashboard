"use client";

import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";

// ─── Sort / Group Config (shared with toolbar) ────────────────

export const SORT_OPTIONS = [
  { value: "manual", label: "Manual (seções)" },
  { value: "due_date", label: "Prazo" },
  { value: "priority", label: "Prioridade" },
  { value: "status", label: "Status" },
  { value: "created_at", label: "Data de criação" },
  { value: "title", label: "Alfabético" },
] as const;

export const GROUP_OPTIONS = [
  { value: "section", label: "Seções (manual)" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Prioridade" },
  { value: "due_date", label: "Prazo" },
  { value: "project_id", label: "Projeto" },
  { value: "none", label: "Sem agrupamento" },
] as const;

// ─── Types ────────────────────────────────────────────────────

export interface FilterRule {
  field: string;
  operator: string;
  value: string;
}

export interface MyTasksFilters {
  rules?: FilterRule[];
  [key: string]: unknown;
}

// ─── Constants ────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────

interface MyTasksFilterPanelProps {
  filters: MyTasksFilters;
  onUpdate: (f: MyTasksFilters) => void;
}

export function MyTasksFilterPanel({
  filters,
  onUpdate,
}: MyTasksFilterPanelProps) {
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
    const next = rules.map((r, i) => (i === index ? { ...r, ...partial } : r));
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
            className="text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Limpar tudo
          </button>
        )}
      </div>

      {rules.length === 0 && (
        <p className="py-2 text-center text-xs text-muted-foreground">
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
            <IconX className="h-3 w-3" />
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
