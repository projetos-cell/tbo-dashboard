import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type AuditLogRow = Database["public"]["Tables"]["audit_log"]["Row"];

export async function listAuditLogs(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: {
    action?: string;
    entity_type?: string;
    user_id?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }
): Promise<AuditLogRow[]> {
  let query = supabase
    .from("audit_log")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters?.action) query = query.eq("action", filters.action);
  if (filters?.entity_type)
    query = query.eq("entity_type", filters.entity_type);
  if (filters?.user_id) query = query.eq("user_id", filters.user_id);
  if (filters?.dateFrom)
    query = query.gte("created_at", filters.dateFrom);
  if (filters?.dateTo) query = query.lte("created_at", filters.dateTo);

  const { data, error } = await query;
  if (error) throw error;

  let results = data ?? [];

  // Client-side text search across action + entity_name + user_name
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter((log) => {
      const action = (log.action || "").toLowerCase();
      const entityName = (log.entity_name || "").toLowerCase();
      const userName = (log.user_name || "").toLowerCase();
      const entityType = (log.entity_type || "").toLowerCase();
      return (
        action.includes(q) ||
        entityName.includes(q) ||
        userName.includes(q) ||
        entityType.includes(q)
      );
    });
  }

  return results;
}

export interface AdminKPIs {
  totalActions: number;
  uniqueUsers: number;
  todayActions: number;
  topEntityType: string;
}

export function computeAdminKPIs(logs: AuditLogRow[]): AdminKPIs {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();

  const userIds = new Set(logs.map((l) => l.user_id).filter(Boolean));

  const todayActions = logs.filter(
    (l) => l.created_at && l.created_at >= todayStart
  ).length;

  // Find most frequent entity_type
  const entityCounts: Record<string, number> = {};
  for (const log of logs) {
    if (log.entity_type) {
      entityCounts[log.entity_type] =
        (entityCounts[log.entity_type] ?? 0) + 1;
    }
  }
  const topEntityType =
    Object.entries(entityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return {
    totalActions: logs.length,
    uniqueUsers: userIds.size,
    todayActions,
    topEntityType,
  };
}
