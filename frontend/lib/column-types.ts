import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Column definition — describes a single column for any data table    */
/* ------------------------------------------------------------------ */

export interface ColumnDef<T = Record<string, unknown>> {
  /** Unique identifier for this column */
  id: string;
  /** Display label in the table header */
  label: string;
  /** Minimum responsive breakpoint: always visible, or hidden below md/lg/xl */
  responsive?: "always" | "md" | "lg" | "xl";
  /** Fixed width class e.g. "w-[130px]" */
  width?: string;
  /** Whether this column can be hidden by the user (false = always visible) */
  hideable?: boolean;
  /** Whether this column can be reordered */
  reorderable?: boolean;
  /** Whether this column supports click-to-sort */
  sortable?: boolean;
  /** Auto-comparator type (used when sortFn is not provided) */
  sortType?: "string" | "number" | "date" | "boolean";
  /** Extract a raw value from the row for sorting (bypasses cellRender) */
  sortAccessor?: (row: T) => unknown;
  /** Fully custom comparator (return negative/0/positive) */
  sortFn?: (a: T, b: T) => number;
  /** Custom header render */
  headerRender?: () => ReactNode;
  /** Custom cell render */
  cellRender?: (row: T, index: number) => ReactNode;
}

/* ------------------------------------------------------------------ */
/* Persisted column preference (stored in DB / localStorage)           */
/* ------------------------------------------------------------------ */

export interface ColumnPref {
  id: string;
  visible: boolean;
  width?: number;
}

/* ------------------------------------------------------------------ */
/* Table preference record (matches user_table_preferences table)      */
/* ------------------------------------------------------------------ */

export interface SortPref {
  columnId: string;
  direction: "asc" | "desc";
}

export interface TablePreference {
  id: string;
  tenant_id: string;
  user_id: string;
  table_id: string;
  columns: ColumnPref[];
  sort?: SortPref | null;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Merge saved preferences with column definitions.
 * Handles new columns added after user saved prefs (appended at end).
 * Handles removed columns (filtered out).
 */
export function applyColumnPrefs<T>(
  defs: ColumnDef<T>[],
  prefs: ColumnPref[] | undefined
): { column: ColumnDef<T>; visible: boolean }[] {
  if (!prefs || prefs.length === 0) {
    return defs.map((col) => ({ column: col, visible: true }));
  }

  const defMap = new Map(defs.map((d) => [d.id, d]));
  const ordered: { column: ColumnDef<T>; visible: boolean }[] = [];
  const seen = new Set<string>();

  // First, add columns in saved order
  for (const pref of prefs) {
    const def = defMap.get(pref.id);
    if (def) {
      ordered.push({ column: def, visible: pref.visible });
      seen.add(pref.id);
    }
  }

  // Then, append any new columns not in prefs
  for (const def of defs) {
    if (!seen.has(def.id)) {
      ordered.push({ column: def, visible: true });
    }
  }

  return ordered;
}

/**
 * Extract prefs array from current column state (for saving).
 */
export function extractColumnPrefs<T>(
  columns: { column: ColumnDef<T>; visible: boolean }[]
): ColumnPref[] {
  return columns.map(({ column, visible }) => ({
    id: column.id,
    visible,
  }));
}

/**
 * Responsive class helper for hiding columns below breakpoint.
 */
export function responsiveClass(responsive?: "always" | "md" | "lg" | "xl"): string {
  switch (responsive) {
    case "md":
      return "hidden md:table-cell";
    case "lg":
      return "hidden lg:table-cell";
    case "xl":
      return "hidden xl:table-cell";
    default:
      return "";
  }
}

/**
 * Build a comparator for two raw values based on the declared sortType.
 */
export function getDefaultSortFn(
  sortType: "string" | "number" | "date" | "boolean" = "string"
): (a: unknown, b: unknown) => number {
  return (a, b) => {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    switch (sortType) {
      case "number":
        return Number(a) - Number(b);
      case "date":
        return new Date(a as string).getTime() - new Date(b as string).getTime();
      case "boolean":
        return (a ? 1 : 0) - (b ? 1 : 0);
      default:
        return String(a).localeCompare(String(b), "pt-BR", { sensitivity: "base" });
    }
  };
}
