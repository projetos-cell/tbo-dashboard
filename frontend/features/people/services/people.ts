import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { PeopleFiltersSpec } from "@/features/people/utils/people-filters";
import { PRIORITY_SORT_FIELD } from "@/features/people/utils/people-filters";
import type { SortSpec } from "@/services/view-state";
import { getPeopleSnapshots, computePriorityScore } from "@/features/people/services/people-snapshot";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TeamRow = Database["public"]["Tables"]["teams"]["Row"];

// ---------------------------------------------------------------------------
// Paginated result
// ---------------------------------------------------------------------------

export interface PeopleListResult {
  data: ProfileRow[];
  count: number; // total matching rows (for pagination UI)
}

// ---------------------------------------------------------------------------
// getPeople v2 — full server-side filter engine
// ---------------------------------------------------------------------------

export async function getPeople(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: PeopleFiltersSpec,
  sort?: SortSpec[],
  pagination?: { page: number; pageSize: number }
): Promise<PeopleListResult> {
  // KPI presets that need server-side RPC (or custom query)
  if (filters?.kpi) {
    if (filters.kpi === "critical_score") {
      return getPeopleByCriticalScore(supabase, filters, sort, pagination);
    }
    return getPeopleByKPI(supabase, tenantId, filters.kpi, filters, sort, pagination);
  }

  // Fase 4 — Priority sort needs snapshot data from multiple tables
  const isPrioritySort = sort?.[0]?.field === PRIORITY_SORT_FIELD;
  if (isPrioritySort) {
    return getPeopleSortedByPriority(supabase, filters, pagination);
  }

  const page = pagination?.page ?? 0;
  const pageSize = pagination?.pageSize ?? 50;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" });

  // Status filter (multi-select)
  if (filters?.status?.length) {
    query = query.in("status", filters.status);
  }

  // Search (name OR email)
  if (filters?.search) {
    const term = `%${filters.search}%`;
    query = query.or(`full_name.ilike.${term},email.ilike.${term}`);
  }

  // Area (BU)
  if (filters?.area?.length) {
    query = query.in("bu", filters.area);
  }

  // Team
  if (filters?.team?.length) {
    query = query.in("department", filters.team);
  }

  // Leader
  if (filters?.leader_id?.length) {
    query = query.in("manager_id", filters.leader_id);
  }

  // Seniority (nivel_atual)
  if (filters?.seniority?.length) {
    query = query.in("nivel_atual", filters.seniority);
  }

  // Employment type (contract_type)
  if (filters?.employment_type?.length) {
    query = query.in("contract_type", filters.employment_type);
  }

  // Tags: filter people whose `bu` matches any tag
  // (tags is a virtual filter that combines BU + department labels)
  if (filters?.tags?.length) {
    query = query.or(
      filters.tags.map((t) => `bu.eq.${t},department.eq.${t}`).join(",")
    );
  }

  // Sorting
  const sortSpecs = sort?.length ? sort : [{ field: "full_name", dir: "asc" as const }];
  for (const s of sortSpecs) {
    query = query.order(s.field, { ascending: s.dir === "asc" });
  }

  // Pagination
  const from = page * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as ProfileRow[], count: count ?? 0 };
}

// ---------------------------------------------------------------------------
// Fase 4 — Priority sort (Fila de Atenção)
// Fetches ALL filtered profiles + snapshot data, computes priority_score,
// sorts in-memory, then returns the requested page slice.
// ---------------------------------------------------------------------------

async function getPeopleSortedByPriority(
  supabase: SupabaseClient<Database>,
  filters?: PeopleFiltersSpec,
  pagination?: { page: number; pageSize: number }
): Promise<PeopleListResult> {
  // 1. Fetch ALL matching profiles (no pagination yet — we need full list to sort)
  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" });

  if (filters?.status?.length) query = query.in("status", filters.status);
  if (filters?.search) {
    const term = `%${filters.search}%`;
    query = query.or(`full_name.ilike.${term},email.ilike.${term}`);
  }
  if (filters?.area?.length) query = query.in("bu", filters.area);
  if (filters?.team?.length) query = query.in("department", filters.team);
  if (filters?.leader_id?.length) query = query.in("manager_id", filters.leader_id);
  if (filters?.seniority?.length) query = query.in("nivel_atual", filters.seniority);
  if (filters?.employment_type?.length) query = query.in("contract_type", filters.employment_type);
  if (filters?.tags?.length) {
    query = query.or(filters.tags.map((t) => `bu.eq.${t},department.eq.${t}`).join(","));
  }

  // Fetch up to 1000 profiles (reasonable ceiling for a tenant's people)
  query = query.order("full_name", { ascending: true }).limit(1000);

  const { data, error, count } = await query;
  if (error) throw error;

  const profiles = (data ?? []) as ProfileRow[];
  if (profiles.length === 0) return { data: [], count: 0 };

  // 2. Fetch snapshot data for all these profiles (batch — no N+1)
  const personIds = profiles.map((p) => p.id);
  const snapshots = await getPeopleSnapshots(supabase, personIds);

  // Merge performance_score from profile.media_avaliacao
  for (const p of profiles) {
    if (snapshots[p.id]) {
      snapshots[p.id].performance_score = (p as Record<string, unknown>).media_avaliacao as number | null;
    }
  }

  // 3. Compute priority_score and sort
  const scored = profiles.map((p) => ({
    profile: p,
    priorityScore: snapshots[p.id] ? computePriorityScore(snapshots[p.id]) : 0,
    performanceScore: (p as Record<string, unknown>).media_avaliacao as number | null,
  }));

  scored.sort((a, b) => {
    // Primary: priority_score DESC
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    // Secondary: performance_score ASC, NULLS LAST
    const aScore = a.performanceScore ?? Infinity;
    const bScore = b.performanceScore ?? Infinity;
    return aScore - bScore;
  });

  // 4. Paginate the sorted result
  const page = pagination?.page ?? 0;
  const pageSize = pagination?.pageSize ?? 50;
  const from = page * pageSize;
  const sliced = scored.slice(from, from + pageSize).map((s) => s.profile);

  return { data: sliced, count: count ?? profiles.length };
}

// ---------------------------------------------------------------------------
// KPI preset queries — complex filters via RPC
// ---------------------------------------------------------------------------

async function getPeopleByKPI(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  kpi: string,
  filters?: PeopleFiltersSpec,
  sort?: SortSpec[],
  pagination?: { page: number; pageSize: number }
): Promise<PeopleListResult> {
  // Get IDs from RPC, then fetch profiles
  const { data: ids, error } = await supabase.rpc(
    "get_people_ids_by_kpi" as never,
    { p_tenant_id: tenantId, p_kpi: kpi } as never
  );

  if (error) {
    console.warn("[getPeopleByKPI] RPC failed:", error.message);
    return { data: [], count: 0 };
  }

  const personIds = (ids as unknown as string[]) ?? [];
  if (personIds.length === 0) return { data: [], count: 0 };

  // Fetch profiles for those IDs (with additional filters applied)
  const page = pagination?.page ?? 0;
  const pageSize = pagination?.pageSize ?? 50;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .in("id", personIds);

  // Apply additional filters on top of KPI results
  if (filters?.search) {
    const term = `%${filters.search}%`;
    query = query.or(`full_name.ilike.${term},email.ilike.${term}`);
  }
  if (filters?.area?.length) query = query.in("bu", filters.area);
  if (filters?.team?.length) query = query.in("department", filters.team);

  const sortSpecs = sort?.length ? sort : [{ field: "full_name", dir: "asc" as const }];
  for (const s of sortSpecs) {
    query = query.order(s.field, { ascending: s.dir === "asc" });
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error: fetchError, count } = await query;
  if (fetchError) throw fetchError;
  return { data: (data ?? []) as ProfileRow[], count: count ?? 0 };
}

export async function getPersonById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ProfileRow;
}

export async function updatePerson(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["profiles"]["Update"]
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ProfileRow;
}

export async function getTeams(
  supabase: SupabaseClient<Database>
): Promise<TeamRow[]> {
  const { data, error } = await supabase
    .from("teams")
    .select()
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return (data ?? []) as TeamRow[];
}

export interface PeopleKPIs {
  total: number;
  active: number;
  onVacation: number;
  byBU: Record<string, number>;
}

/** Lightweight profiles query for user pickers — returns id, name, avatar, email */
export async function getProfiles(
  supabase: SupabaseClient<Database>
): Promise<Pick<ProfileRow, "id" | "full_name" | "avatar_url" | "email">[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,avatar_url,email")
    .eq("is_active", true)
    .order("full_name");

  if (error) throw error;
  return (data ?? []) as Pick<ProfileRow, "id" | "full_name" | "avatar_url" | "email">[];
}

// ---------------------------------------------------------------------------
// V2 KPIs — 8 fixed KPIs computed server-side via RPC
// ---------------------------------------------------------------------------

export interface PeopleKPIsV2 {
  total: number;
  active: number;
  onboarding: number;
  at_risk: number;
  pending_1on1: number;
  stale_pdi: number;
  month_recognitions: number;
  overloaded: number;
}

const EMPTY_KPIS: PeopleKPIsV2 = {
  total: 0,
  active: 0,
  onboarding: 0,
  at_risk: 0,
  pending_1on1: 0,
  stale_pdi: 0,
  month_recognitions: 0,
  overloaded: 0,
};

export async function getPeopleKPIs(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<PeopleKPIsV2> {
  const { data, error } = await supabase.rpc(
    "get_people_kpis" as never,
    { p_tenant_id: tenantId } as never
  );

  if (error) {
    console.warn("[getPeopleKPIs] RPC failed, using fallback:", error.message);
    return { ...EMPTY_KPIS };
  }

  const raw = (typeof data === "string" ? JSON.parse(data) : data) as Record<
    string,
    number
  >;

  return {
    total: raw.total ?? 0,
    active: raw.active ?? 0,
    onboarding: raw.onboarding ?? 0,
    at_risk: raw.at_risk ?? 0,
    pending_1on1: raw.pending_1on1 ?? 0,
    stale_pdi: raw.stale_pdi ?? 0,
    month_recognitions: raw.month_recognitions ?? 0,
    overloaded: raw.overloaded ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Fase 5 — Critical score filter (performance_score < 50)
// ---------------------------------------------------------------------------

async function getPeopleByCriticalScore(
  supabase: SupabaseClient<Database>,
  filters?: PeopleFiltersSpec,
  sort?: SortSpec[],
  pagination?: { page: number; pageSize: number }
): Promise<PeopleListResult> {
  const page = pagination?.page ?? 0;
  const pageSize = pagination?.pageSize ?? 50;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .not("media_avaliacao", "is", null)
    .lt("media_avaliacao", 50);

  // Apply additional filters on top
  if (filters?.search) {
    const term = `%${filters.search}%`;
    query = query.or(`full_name.ilike.${term},email.ilike.${term}`);
  }
  if (filters?.area?.length) query = query.in("bu", filters.area);
  if (filters?.team?.length) query = query.in("department", filters.team);
  if (filters?.leader_id?.length) query = query.in("manager_id", filters.leader_id);

  const sortSpecs = sort?.length ? sort : [{ field: "media_avaliacao", dir: "asc" as const }];
  for (const s of sortSpecs) {
    if (s.field === PRIORITY_SORT_FIELD) {
      query = query.order("media_avaliacao", { ascending: true });
    } else {
      query = query.order(s.field, { ascending: s.dir === "asc" });
    }
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as ProfileRow[], count: count ?? 0 };
}

// ---------------------------------------------------------------------------
// Fase 5 — Nudge counts (deterministic, server-side)
// ---------------------------------------------------------------------------

export interface PeopleNudgeCounts {
  pending_1on1: number;
  stale_pdi: number;
  critical_score: number;
  overloaded: number;
}

/**
 * Returns the count of people with performance_score < 50.
 * Used by the nudge system (Fase 5) — separate from at_risk (< 60).
 */
export async function getCriticalScoreCount(
  supabase: SupabaseClient<Database>
): Promise<number> {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .not("media_avaliacao", "is", null)
    .lt("media_avaliacao", 50);

  if (error) {
    console.warn("[getCriticalScoreCount] Query failed:", error.message);
    return 0;
  }
  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Legacy V1 KPIs (kept for backward compatibility)
// ---------------------------------------------------------------------------

export function computePeopleKPIs(people: ProfileRow[]): PeopleKPIs {
  const active = people.filter((p) => p.status === "active" || p.is_active);
  const onVacation = people.filter((p) => p.status === "vacation");
  const byBU: Record<string, number> = {};
  for (const p of people) {
    if (p.bu) byBU[p.bu] = (byBU[p.bu] ?? 0) + 1;
  }

  return {
    total: people.length,
    active: active.length,
    onVacation: onVacation.length,
    byBU,
  };
}
