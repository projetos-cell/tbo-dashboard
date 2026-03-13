"use client";

import { IconX } from "@tabler/icons-react";
import type { ContractFilters } from "@/features/contratos/services/contracts";

// ─── Active filter count ──────────────────────────────────────────────

export function countActiveFilters(
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

// ─── Month range helper ───────────────────────────────────────────────

export function getMonthRange(offset: number): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return {
    from: start.toISOString().split("T")[0],
    to: end.toISOString().split("T")[0],
  };
}

// ─── Multi-select toggle ──────────────────────────────────────────────

export function toggleInArray<T extends string>(
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

// ─── FilterChip ───────────────────────────────────────────────────────

interface FilterChipProps {
  label: string;
  active: boolean;
  color?: string;
  bg?: string;
  onClick: () => void;
}

export function FilterChip({ label, active, color, bg, onClick }: FilterChipProps) {
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
      {active && <IconX className="h-3 w-3 ml-0.5" />}
    </button>
  );
}

// ─── FilterSection wrapper ────────────────────────────────────────────

interface FilterSectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

export function FilterSection({ icon: Icon, title, children }: FilterSectionProps) {
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
