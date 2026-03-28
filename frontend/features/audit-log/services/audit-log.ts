import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];

export interface AuditLogWithUser extends AuditLogRow {
  profile?: {
    full_name: string;
    avatar_url: string | null;
    email: string | null;
  } | null;
}

export interface AuditLogFilters {
  search?: string;
  action?: string;
  entity_type?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
}

const PAGE_SIZE = 50;

export async function getAuditLogs(
  supabase: SupabaseClient<Database>,
  filters: AuditLogFilters = {},
  page = 0
): Promise<{ data: AuditLogWithUser[]; count: number }> {
  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (filters.action) {
    query = query.eq("action", filters.action);
  }

  if (filters.entity_type) {
    query = query.eq("entity_type", filters.entity_type);
  }

  if (filters.user_id) {
    query = query.eq("user_id", filters.user_id);
  }

  if (filters.date_from) {
    query = query.gte("created_at", filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte("created_at", `${filters.date_to}T23:59:59`);
  }

  if (filters.search) {
    query = query.or(
      `action.ilike.%${filters.search}%,entity_type.ilike.%${filters.search}%,entity_id.ilike.%${filters.search}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const rows = data ?? [];

  // Resolve user profiles (no FK exists, manual join)
  const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[];

  let profileMap = new Map<string, { full_name: string; avatar_url: string | null; email: string | null }>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, email")
      .in("id", userIds);

    if (profiles) {
      for (const p of profiles) {
        profileMap.set(p.id, { full_name: p.full_name, avatar_url: p.avatar_url, email: p.email });
      }
    }
  }

  const enriched: AuditLogWithUser[] = rows.map((row) => ({
    ...row,
    profile: row.user_id ? profileMap.get(row.user_id) ?? null : null,
  }));

  return {
    data: enriched,
    count: count ?? 0,
  };
}

export async function getAuditLogActions(
  supabase: SupabaseClient<Database>
): Promise<string[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("action")
    .order("action");

  if (error) throw error;

  const unique = [...new Set((data ?? []).map((d) => d.action))];
  return unique;
}

export async function getAuditLogEntityTypes(
  supabase: SupabaseClient<Database>
): Promise<string[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("entity_type")
    .not("entity_type", "is", null)
    .order("entity_type");

  if (error) throw error;

  const unique = [...new Set((data ?? []).map((d) => d.entity_type).filter(Boolean) as string[])];
  return unique;
}
