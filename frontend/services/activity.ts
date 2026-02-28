import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ActivityRow = Database["public"]["Tables"]["project_activity"]["Row"];

const ACTIVITY_COLS =
  "id,tenant_id,project_id,task_id,actor_id,action,entity_type,field_name,old_value,new_value,metadata,created_at";

export async function getProjectActivity(
  supabase: SupabaseClient<Database>,
  projectId: string,
  tenantId: string,
  limit = 50
): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from("project_activity")
    .select(ACTIVITY_COLS)
    .eq("project_id", projectId)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getTaskActivity(
  supabase: SupabaseClient<Database>,
  taskId: string,
  tenantId: string,
  limit = 30
): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from("project_activity")
    .select(ACTIVITY_COLS)
    .eq("task_id", taskId)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function logActivity(
  supabase: SupabaseClient<Database>,
  entry: Database["public"]["Tables"]["project_activity"]["Insert"]
): Promise<void> {
  const { error } = await supabase
    .from("project_activity")
    .insert(entry as never);
  if (error) throw error;
}
