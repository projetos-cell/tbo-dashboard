import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

// ─── Types ───────────────────────────────────────────────────
export interface MyTasksSection {
  id: string;
  tenant_id: string;
  user_id: string;
  name: string;
  sort_order: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface MyTasksOrder {
  user_id: string;
  task_id: string;
  section_id: string | null;
  sort_order: number;
}

export interface MyTasksColumnPref {
  id: string;
  visible: boolean;
  width: number;
}

export interface MyTasksPreferences {
  user_id: string;
  tenant_id: string;
  view_mode: "list" | "board" | "calendar";
  sort_by: string;
  sort_direction: "asc" | "desc";
  group_by: string;
  show_completed: boolean;
  filters: Record<string, unknown>;
  columns: MyTasksColumnPref[];
  updated_at: string;
}

export interface MyTaskWithSection extends TaskRow {
  my_section_id: string | null;
  my_sort_order: number;
  assignee_avatar_url: string | null;
}

// ─── Sections CRUD ────────────────────────────────────────────

export async function getMyTasksSections(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<MyTasksSection[]> {
  const { data, error } = await supabase
    .from("my_tasks_sections" as never)
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as MyTasksSection[];
}

export async function createMyTasksSection(
  supabase: SupabaseClient<Database>,
  section: { tenant_id: string; user_id: string; name: string; sort_order: number }
): Promise<MyTasksSection> {
  const { data, error } = await supabase
    .from("my_tasks_sections" as never)
    .insert(section as never)
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as MyTasksSection;
}

export async function updateMyTasksSection(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Partial<Pick<MyTasksSection, "name" | "sort_order">>
): Promise<MyTasksSection> {
  const { data, error } = await supabase
    .from("my_tasks_sections" as never)
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as MyTasksSection;
}

export async function deleteMyTasksSection(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("my_tasks_sections" as never)
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function reorderSections(
  supabase: SupabaseClient<Database>,
  sections: { id: string; sort_order: number }[]
): Promise<void> {
  // Batch update sort orders
  for (const s of sections) {
    const { error } = await supabase
      .from("my_tasks_sections" as never)
      .update({ sort_order: s.sort_order } as never)
      .eq("id", s.id);
    if (error) throw error;
  }
}

// ─── Task Order CRUD ──────────────────────────────────────────

export async function getMyTasksOrder(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<MyTasksOrder[]> {
  const { data, error } = await supabase
    .from("my_tasks_order" as never)
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as MyTasksOrder[];
}

export async function upsertMyTaskOrder(
  supabase: SupabaseClient<Database>,
  order: MyTasksOrder
): Promise<void> {
  const { error } = await supabase
    .from("my_tasks_order" as never)
    .upsert(order as never, { onConflict: "user_id,task_id" });

  if (error) throw error;
}

export async function upsertMyTaskOrders(
  supabase: SupabaseClient<Database>,
  orders: MyTasksOrder[]
): Promise<void> {
  if (orders.length === 0) return;

  const { error } = await supabase
    .from("my_tasks_order" as never)
    .upsert(orders as never, { onConflict: "user_id,task_id" });

  if (error) throw error;
}

export async function removeMyTaskOrder(
  supabase: SupabaseClient<Database>,
  userId: string,
  taskId: string
): Promise<void> {
  const { error } = await supabase
    .from("my_tasks_order" as never)
    .delete()
    .eq("user_id", userId)
    .eq("task_id", taskId);

  if (error) throw error;
}

// ─── Fetch user's tasks with section info ─────────────────────

export async function getMyTasks(
  supabase: SupabaseClient<Database>,
  userId: string,
  showCompleted: boolean = false
): Promise<MyTaskWithSection[]> {
  // Get tasks assigned to user via primary assignee_id (or created by user with no assignee)
  let query = supabase
    .from("os_tasks")
    .select("*")
    .or(`assignee_id.eq.${userId},and(created_by.eq.${userId},assignee_id.is.null)`)
    .is("parent_id", null)
    .order("order_index", { ascending: true });

  if (!showCompleted) {
    query = query.eq("is_completed", false);
  }

  const { data: primaryTasks, error: tasksError } = await query;
  if (tasksError) throw tasksError;

  // Also get tasks where user is a multi-assignee via task_assignees junction table
  // Wrapped in try/catch so primary tasks still show if table doesn't exist yet
  let assigneeRows: { task_id: string }[] = [];
  try {
    const { data, error: assigneeError } = await supabase
      .from("task_assignees")
      .select("task_id")
      .eq("user_id", userId);
    if (!assigneeError) {
      assigneeRows = (data ?? []) as { task_id: string }[];
    }
  } catch {
    // task_assignees table may not exist yet — skip multi-assignee lookup
  }

  const primaryIds = new Set((primaryTasks ?? []).map((t) => t.id));
  const extraTaskIds = (assigneeRows ?? [])
    .map((r) => r.task_id)
    .filter((id) => !primaryIds.has(id));

  let extraTasks: TaskRow[] = [];
  if (extraTaskIds.length > 0) {
    let extraQuery = supabase
      .from("os_tasks")
      .select("*")
      .in("id", extraTaskIds)
      .is("parent_id", null);

    if (!showCompleted) {
      extraQuery = extraQuery.eq("is_completed", false);
    }

    const { data, error } = await extraQuery;
    if (error) throw error;
    extraTasks = (data ?? []) as TaskRow[];
  }

  const tasks = [...(primaryTasks ?? []) as TaskRow[], ...extraTasks];

  // Get order info for these tasks
  const { data: orders, error: ordersError } = await supabase
    .from("my_tasks_order" as never)
    .select("*")
    .eq("user_id", userId);
  if (ordersError) throw ordersError;

  const orderMap = new Map(
    ((orders ?? []) as unknown as MyTasksOrder[]).map((o) => [
      o.task_id,
      { section_id: o.section_id, sort_order: o.sort_order },
    ])
  );

  // Fetch assignee avatar_urls from profiles (no FK, so separate query)
  const assigneeIds = [
    ...new Set(tasks.map((t) => t.assignee_id).filter(Boolean)),
  ] as string[];
  const avatarMap = new Map<string, string | null>();
  if (assigneeIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, avatar_url")
      .in("id", assigneeIds);
    for (const p of profiles ?? []) {
      avatarMap.set(p.id, p.avatar_url);
    }
  }

  // Merge tasks with their personal section info and avatar
  return (tasks as TaskRow[]).map((task) => {
    const order = orderMap.get(task.id);
    return {
      ...task,
      my_section_id: order?.section_id ?? null,
      my_sort_order: order?.sort_order ?? 999999,
      assignee_avatar_url: task.assignee_id
        ? avatarMap.get(task.assignee_id) ?? null
        : null,
    };
  });
}

// ─── Preferences ──────────────────────────────────────────────

export async function getMyTasksPreferences(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<MyTasksPreferences | null> {
  const { data, error } = await supabase
    .from("my_tasks_preferences" as never)
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as unknown as MyTasksPreferences) ?? null;
}

export async function upsertMyTasksPreferences(
  supabase: SupabaseClient<Database>,
  prefs: Partial<MyTasksPreferences> & { user_id: string; tenant_id: string }
): Promise<void> {
  const { error } = await supabase
    .from("my_tasks_preferences" as never)
    .upsert(
      { ...prefs, updated_at: new Date().toISOString() } as never,
      { onConflict: "user_id" }
    );

  if (error) throw error;
}

// ─── Ensure default section (RPC call) ────────────────────────

export async function ensureDefaultSection(
  supabase: SupabaseClient<Database>,
  userId: string,
  tenantId: string
): Promise<string> {
  const { data, error } = await supabase.rpc(
    "ensure_default_my_tasks_section" as never,
    { p_user_id: userId, p_tenant_id: tenantId } as never
  );

  if (error) throw error;
  return data as unknown as string;
}
