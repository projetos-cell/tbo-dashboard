import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TeamRow = Database["public"]["Tables"]["teams"]["Row"];

export async function getPeople(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: {
    status?: string;
    bu?: string;
    search?: string;
  }
): Promise<ProfileRow[]> {
  let query = supabase
    .from("profiles")
    .select()
    .eq("tenant_id", tenantId)
    .order("full_name", { ascending: true });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.bu) query = query.eq("bu", filters.bu);
  if (filters?.search) query = query.ilike("full_name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ProfileRow[];
}

export async function getPersonById(
  supabase: SupabaseClient<Database>,
  id: string,
  tenantId: string
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", id)
    .eq("tenant_id", tenantId)
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
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<TeamRow[]> {
  const { data, error } = await supabase
    .from("teams")
    .select()
    .eq("tenant_id", tenantId)
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
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<Pick<ProfileRow, "id" | "full_name" | "avatar_url" | "email">[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,avatar_url,email")
    .eq("tenant_id", tenantId)
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
