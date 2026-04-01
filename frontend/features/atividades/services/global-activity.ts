import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ActivityRow = Database["public"]["Tables"]["project_activity"]["Row"];

export type GlobalActivityPeriod = "today" | "7d" | "30d" | "all";

export interface GlobalActivityFilters {
  period?: GlobalActivityPeriod;
  entity_type?: string;
  actor_id?: string;
}

export interface GlobalActivityItem extends ActivityRow {
  actor: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  project_name?: string | null;
}

export const PAGE_SIZE = 50;

function getPeriodStart(period: GlobalActivityPeriod): string | null {
  const now = new Date();
  switch (period) {
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    }
    case "7d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d.toISOString();
    }
    case "30d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return d.toISOString();
    }
    default:
      return null;
  }
}

export async function getGlobalActivity(
  supabase: SupabaseClient<Database>,
  filters: GlobalActivityFilters = {},
  page = 0
): Promise<{ data: GlobalActivityItem[]; count: number }> {
  let query = supabase
    .from("project_activity")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (filters.entity_type) {
    query = query.eq("entity_type", filters.entity_type);
  }

  if (filters.actor_id) {
    query = query.eq("actor_id", filters.actor_id);
  }

  if (filters.period && filters.period !== "all") {
    const periodStart = getPeriodStart(filters.period);
    if (periodStart) query = query.gte("created_at", periodStart);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const rows = data ?? [];

  // Manual join: actor profiles
  const actorIds = [...new Set(rows.map((r) => r.actor_id).filter(Boolean))];
  const profileMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();
  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", actorIds);
    for (const p of profiles ?? []) {
      profileMap.set(p.id, { full_name: p.full_name, avatar_url: p.avatar_url });
    }
  }

  // Manual join: project names
  const projectIds = [...new Set(rows.map((r) => r.project_id).filter(Boolean))];
  const projectMap = new Map<string, string | null>();
  if (projectIds.length > 0) {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name")
      .in("id", projectIds);
    for (const p of projects ?? []) {
      projectMap.set(p.id, p.name ?? null);
    }
  }

  const enriched: GlobalActivityItem[] = rows.map((row) => ({
    ...row,
    actor: row.actor_id ? (profileMap.get(row.actor_id) ?? null) : null,
    project_name: row.project_id ? (projectMap.get(row.project_id) ?? null) : null,
  }));

  return { data: enriched, count: count ?? 0 };
}

export async function getActivityActors(
  supabase: SupabaseClient<Database>
): Promise<{ id: string; full_name: string | null; avatar_url: string | null }[]> {
  // Get unique actor_ids from recent activity then join profiles
  const { data: actorRows } = await supabase
    .from("project_activity")
    .select("actor_id")
    .limit(500);

  const ids = [...new Set((actorRows ?? []).map((r) => r.actor_id).filter(Boolean))];
  if (ids.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", ids)
    .order("full_name");

  return profiles ?? [];
}

export async function getActivityEntityTypes(
  supabase: SupabaseClient<Database>
): Promise<string[]> {
  const { data } = await supabase
    .from("project_activity")
    .select("entity_type")
    .limit(500);

  return [...new Set((data ?? []).map((d) => d.entity_type).filter(Boolean))].sort();
}
