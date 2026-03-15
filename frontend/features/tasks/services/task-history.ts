import { createClient } from "@/lib/supabase/client";

export interface TaskHistoryEntry {
  id: string;
  user_id: string;
  action: string;
  from_state: Record<string, unknown> | null;
  to_state: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export async function getTaskHistory(
  taskId: string
): Promise<TaskHistoryEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("audit_log" as never)
    .select("*")
    .eq("entity_type", "tasks")
    .eq("entity_id", taskId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    user_id: row.user_id as string,
    action: row.action as string,
    from_state: parseJsonField(row.from_state),
    to_state: parseJsonField(row.to_state),
    metadata: parseJsonField(row.metadata),
    created_at: row.created_at as string,
  }));
}

function parseJsonField(
  value: unknown
): Record<string, unknown> | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "object" && !Array.isArray(value))
    return value as Record<string, unknown>;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}
