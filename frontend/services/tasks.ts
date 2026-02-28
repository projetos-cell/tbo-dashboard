import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];
const TASK_COLS =
  "id,tenant_id,project_id,section_id,parent_id,title,description,status,assignee_id,assignee_name,start_date,due_date,completed_at,priority,order_index,is_completed,legacy_demand_id,created_by,created_at,updated_at";

export async function getTasks(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: {
    status?: string;
    assignee_name?: string;
    project_id?: string;
    priority?: string;
  }
): Promise<TaskRow[]> {
  let query = supabase
    .from("os_tasks")
    .select(TASK_COLS)
    .eq("tenant_id", tenantId)
    .is("parent_id", null)
    .order("order_index", { ascending: true });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.assignee_name) query = query.eq("assignee_name", filters.assignee_name);
  if (filters?.project_id) query = query.eq("project_id", filters.project_id);
  if (filters?.priority) query = query.eq("priority", filters.priority);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getTaskById(
  supabase: SupabaseClient<Database>,
  id: string,
  tenantId: string
): Promise<TaskRow | null> {
  const { data, error } = await supabase
    .from("os_tasks")
    .select(TASK_COLS)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (error) throw error;
  return data;
}

export async function getSubtasks(
  supabase: SupabaseClient<Database>,
  parentId: string,
  tenantId: string
): Promise<TaskRow[]> {
  const { data, error } = await supabase
    .from("os_tasks")
    .select(TASK_COLS)
    .eq("parent_id", parentId)
    .eq("tenant_id", tenantId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createTask(
  supabase: SupabaseClient<Database>,
  task: Database["public"]["Tables"]["os_tasks"]["Insert"]
): Promise<TaskRow> {
  const { data, error } = await supabase
    .from("os_tasks")
    .insert(task as never)
    .select(TASK_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["os_tasks"]["Update"]
): Promise<TaskRow> {
  const payload = { ...updates, updated_at: new Date().toISOString() };

  // Auto-set completed_at when marking as completed
  if (updates.status === "concluida" || updates.is_completed === true) {
    payload.is_completed = true;
    payload.completed_at = new Date().toISOString();
  } else if (updates.status && updates.status !== "concluida") {
    payload.is_completed = false;
    payload.completed_at = null;
  }

  const { data, error } = await supabase
    .from("os_tasks")
    .update(payload as never)
    .eq("id", id)
    .select(TASK_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("os_tasks").delete().eq("id", id);
  if (error) throw error;
}

