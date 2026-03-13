"use client";

import { Badge } from "@/components/ui/badge";
import { IconX } from "@tabler/icons-react";
import {
  CONTRACT_STATUS,
  CONTRACT_CATEGORY,
  CONTRACT_TYPE,
  CONTRACT_SORT_OPTIONS,
  CONTRACT_DYNAMIC_STATUS,
  type ContractStatusKey,
  type ContractCategoryKey,
  type ContractTypeKey,
} from "@/lib/constants";
import type { ContractFilters } from "@/features/contratos/services/contracts";

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
          onChange({ ...filters, statuses: filters.statuses?.filter((x) => x !== s) }),
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
          onChange({ ...filters, categories: filters.categories?.filter((x) => x !== c) }),
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
          onChange({ ...filters, types: filters.types?.filter((x) => x !== t) }),
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
      ? new Date(filters.endDateFrom + "T00:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        })
      : "…";
    const to = filters.endDateTo
      ? new Date(filters.endDateTo + "T00:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        })
      : "…";
    badges.push({
      label: `Vencimento: ${from} → ${to}`,
      onRemove: () => onChange({ ...filters, endDateFrom: undefined, endDateTo: undefined }),
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
    const min =
      filters.valueMin != null ? `R$${filters.valueMin.toLocaleString("pt-BR")}` : "…";
    const max =
      filters.valueMax != null ? `R$${filters.valueMax.toLocaleString("pt-BR")}` : "∞";
    badges.push({
      label: `Valor: ${min} – ${max}`,
      onRemove: () => onChange({ ...filters, valueMin: undefined, valueMax: undefined }),
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
          <IconX className="h-3 w-3" />
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
