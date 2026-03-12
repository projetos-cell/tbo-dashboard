// ─── My Tasks Column Definitions ────────────────────────────
// Central source of truth for all available columns in Minhas Tarefas table.

export interface ColumnDef {
  id: string;
  label: string;
  defaultWidth: number;
  minWidth: number;
  alwaysVisible?: boolean;
  sortable?: boolean;
  /** Key on task object used for sorting */
  sortAccessor?: string;
}

export interface ColumnPref {
  id: string;
  visible: boolean;
  width: number;
}

export interface ResolvedColumn {
  id: string;
  label: string;
  width: number;
  minWidth: number;
  alwaysVisible: boolean;
}

export const MY_TASKS_COLUMNS: ColumnDef[] = [
  {
    id: "tarefa",
    label: "Tarefa",
    defaultWidth: 0, // flex
    minWidth: 200,
    alwaysVisible: true,
    sortable: true,
    sortAccessor: "title",
  },
  {
    id: "prazo",
    label: "Prazo",
    defaultWidth: 110,
    minWidth: 80,
    sortable: true,
    sortAccessor: "due_date",
  },
  {
    id: "projeto",
    label: "Projeto",
    defaultWidth: 140,
    minWidth: 80,
    sortable: true,
    sortAccessor: "project_id",
  },
  {
    id: "status",
    label: "Status",
    defaultWidth: 130,
    minWidth: 80,
    sortable: true,
    sortAccessor: "status",
  },
  {
    id: "prioridade",
    label: "Prioridade",
    defaultWidth: 120,
    minWidth: 80,
    sortable: true,
    sortAccessor: "priority",
  },
  {
    id: "responsavel",
    label: "Responsável",
    defaultWidth: 44,
    minWidth: 44,
    sortable: false,
  },
];

/**
 * Merge saved column prefs with default definitions.
 * - Preserves order/visibility/width from saved prefs
 * - Adds any new columns that don't exist in saved prefs (appended at end)
 * - Removes prefs for columns that no longer exist
 */
export function resolveColumns(
  savedPrefs: ColumnPref[] | undefined | null,
  defaults: ColumnDef[] = MY_TASKS_COLUMNS
): ResolvedColumn[] {
  if (!savedPrefs || savedPrefs.length === 0) {
    return defaults.map((d) => ({
      id: d.id,
      label: d.label,
      width: d.defaultWidth,
      minWidth: d.minWidth,
      alwaysVisible: d.alwaysVisible ?? false,
    }));
  }

  const defMap = new Map(defaults.map((d) => [d.id, d]));
  const result: ResolvedColumn[] = [];
  const seen = new Set<string>();

  // Process saved prefs in their saved order
  for (const pref of savedPrefs) {
    const def = defMap.get(pref.id);
    if (!def) continue; // column removed from codebase
    seen.add(pref.id);
    result.push({
      id: def.id,
      label: def.label,
      width: pref.width || def.defaultWidth,
      minWidth: def.minWidth,
      alwaysVisible: def.alwaysVisible ?? false,
    });
  }

  // Append new columns not in saved prefs
  for (const def of defaults) {
    if (!seen.has(def.id)) {
      result.push({
        id: def.id,
        label: def.label,
        width: def.defaultWidth,
        minWidth: def.minWidth,
        alwaysVisible: def.alwaysVisible ?? false,
      });
    }
  }

  return result;
}

/**
 * Filter to only visible columns, respecting alwaysVisible flag.
 */
export function getVisibleColumns(
  columns: ResolvedColumn[],
  prefs: ColumnPref[] | undefined | null
): ResolvedColumn[] {
  if (!prefs || prefs.length === 0) return columns;

  const prefMap = new Map(prefs.map((p) => [p.id, p]));

  return columns.filter((col) => {
    if (col.alwaysVisible) return true;
    const pref = prefMap.get(col.id);
    return pref ? pref.visible : true; // default visible if no pref
  });
}
