import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type AssigneeRow = Database["public"]["Tables"]["task_assignees"]["Row"];

const ASSIGNEE_COLS = "id,tenant_id,task_id,user_id,role,created_at";

export async function getAssignees(
  supabase: SupabaseClient<Database>,
  taskId: string,
  tenantId: string
): Promise<AssigneeRow[]> {
  const { data, error } = await supabase
    .from("task_assignees")
    .select(ASSIGNEE_COLS)
    .eq("task_id", taskId)
    .eq("tenant_id", tenantId);

  if (error) throw error;
  return data ?? [];
}

export async function addAssignee(
  supabase: SupabaseClient<Database>,
  assignee: Database["public"]["Tables"]["task_assignees"]["Insert"]
): Promise<AssigneeRow> {
  const { data, error } = await supabase
    .from("task_assignees")
    .upsert(assignee as never, { onConflict: "task_id,user_id" })
    .select(ASSIGNEE_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function removeAssignee(
  supabase: SupabaseClient<Database>,
  taskId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("task_assignees")
    .delete()
    .eq("task_id", taskId)
    .eq("user_id", userId);
  if (error) throw error;
}
