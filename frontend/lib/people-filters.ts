import type { SortSpec } from "@/services/view-state";

// ---------------------------------------------------------------------------
// People Filter Spec — the single source of truth for filter shape
// ---------------------------------------------------------------------------

export interface PeopleFiltersSpec {
  // Basic
  status?: string[];       // ["active", "onboarding"]
  search?: string;         // free-text (name/email)

  // Advanced
  area?: string[];         // BU: ["Marketing", "Branding"]
  team?: string[];         // team name: ["Digital 3D"]
  leader_id?: string[];    // manager UUIDs
  seniority?: string[];    // nivel_atual: ["Pleno I"]
  employment_type?: string[]; // contract_type: ["PJ", "CLT"]
  tags?: string[];         // bu or department tags

  // KPI preset (server-side complex filtering)
  kpi?: PeopleKPIPreset | null;
}

export type PeopleKPIPreset =
  | "at_risk"
  | "pending_1on1"
  | "stale_pdi"
  | "overloaded"
  | "critical_score";

// ---------------------------------------------------------------------------
// Default / empty state
// ---------------------------------------------------------------------------

export const EMPTY_PEOPLE_FILTERS: PeopleFiltersSpec = {};

/** Fase 4 — default is priority queue ("Fila de Atenção") */
export const DEFAULT_PEOPLE_SORT: SortSpec[] = [
  { field: "priority_score", dir: "desc" },
];

/** Sentinel value: when sort[0].field === "priority_score", service layer
 *  computes priority_score from snapshot data instead of using Supabase .order() */
export const PRIORITY_SORT_FIELD = "priority_score" as const;

// ---------------------------------------------------------------------------
// KPI → filter preset mappings
// ---------------------------------------------------------------------------

/** Maps KPI keys to their equivalent filter spec.
 *  Simple status-based KPIs just set `status`.
 *  Complex KPIs set `kpi` for server-side RPC filtering. */
export const KPI_FILTER_PRESETS: Record<string, Partial<PeopleFiltersSpec>> = {
  total: {},                              // clears all filters
  active: { status: ["active"] },
  onboarding: { status: ["onboarding"] },
  at_risk: { kpi: "at_risk" },
  pending_1on1: { kpi: "pending_1on1" },
  stale_pdi: { kpi: "stale_pdi" },
  overloaded: { kpi: "overloaded" },
  critical_score: { kpi: "critical_score" },
  // month_recognitions → navigation, not a filter
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if filters spec has any non-empty values */
export function hasActiveFilters(f: PeopleFiltersSpec): boolean {
  if (f.search) return true;
  if (f.kpi) return true;
  for (const key of ["status", "area", "team", "leader_id", "seniority", "employment_type", "tags"] as const) {
    if (f[key] && (f[key] as string[]).length > 0) return true;
  }
  return false;
}

/** Count active filter groups (for badge count on filter button) */
export function countActiveFilterGroups(f: PeopleFiltersSpec): number {
  let count = 0;
  if (f.kpi) count++;
  for (const key of ["status", "area", "team", "leader_id", "seniority", "employment_type", "tags"] as const) {
    if (f[key] && (f[key] as string[]).length > 0) count++;
  }
  return count;
}

/** Serialize filters to the JSON shape stored in user_view_state */
export function filtersToJson(f: PeopleFiltersSpec): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  if (f.status?.length) obj.status = f.status;
  if (f.search) obj.search = f.search;
  if (f.area?.length) obj.area = f.area;
  if (f.team?.length) obj.team = f.team;
  if (f.leader_id?.length) obj.leader_id = f.leader_id;
  if (f.seniority?.length) obj.seniority = f.seniority;
  if (f.employment_type?.length) obj.employment_type = f.employment_type;
  if (f.tags?.length) obj.tags = f.tags;
  if (f.kpi) obj.kpi = f.kpi;
  return obj;
}

/** Deserialize stored JSON back to PeopleFiltersSpec */
export function jsonToFilters(json: Record<string, unknown>): PeopleFiltersSpec {
  return {
    status: asStringArray(json.status),
    search: typeof json.search === "string" ? json.search : undefined,
    area: asStringArray(json.area),
    team: asStringArray(json.team),
    leader_id: asStringArray(json.leader_id),
    seniority: asStringArray(json.seniority),
    employment_type: asStringArray(json.employment_type),
    tags: asStringArray(json.tags),
    kpi: typeof json.kpi === "string" ? (json.kpi as PeopleKPIPreset) : undefined,
  };
}

function asStringArray(v: unknown): string[] | undefined {
  if (Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string")) return v;
  return undefined;
}
