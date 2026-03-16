import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

const TASK_COLS =
  "id,tenant_id,project_id,section_id,parent_id,title,description,status,assignee_id,assignee_name,start_date,due_date,completed_at,priority,order_index,is_completed,legacy_demand_id,created_by,created_at,updated_at";

/** Fetch ALL os_tasks for a project (parents + subtasks) in one query. */
export async function getProjectTasks(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<TaskRow[]> {
  const { data, error } = await supabase
    .from("os_tasks")
    .select(TASK_COLS)
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Fetch os_sections for a project, ordered by order_index. */
export async function getProjectSections(
  supabase: SupabaseClient<Database>,
  projectId: string,
) {
  const { data, error } = await supabase
    .from("os_sections")
    .select("id,title,color,order_index,project_id,tenant_id,default_status,default_priority,default_assignee_id,created_at,updated_at")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ─── Section CRUD ──────────────────────────────────────────────────────────────

type SectionRow = Database["public"]["Tables"]["os_sections"]["Row"];

export async function createProjectSection(
  supabase: SupabaseClient<Database>,
  params: { project_id: string; tenant_id: string; title: string; color?: string; order_index: number },
): Promise<SectionRow> {
  const { data, error } = await supabase
    .from("os_sections")
    .insert({
      project_id: params.project_id,
      tenant_id: params.tenant_id,
      title: params.title,
      color: params.color ?? null,
      order_index: params.order_index,
    } as never)
    .select()
    .single();

  if (error) throw error;
  return data as SectionRow;
}

export async function updateProjectSection(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Partial<Pick<SectionRow, "title" | "color" | "order_index" | "default_status" | "default_priority" | "default_assignee_id">>,
): Promise<SectionRow> {
  const { data, error } = await supabase
    .from("os_sections")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as SectionRow;
}

export async function deleteProjectSection(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  // First, unset section_id on tasks that belong to this section
  await supabase
    .from("os_tasks")
    .update({ section_id: null } as never)
    .eq("section_id", id);

  const { error } = await supabase
    .from("os_sections")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function reorderProjectSections(
  supabase: SupabaseClient<Database>,
  sections: { id: string; order_index: number }[],
): Promise<void> {
  for (const s of sections) {
    const { error } = await supabase
      .from("os_sections")
      .update({ order_index: s.order_index } as never)
      .eq("id", s.id);
    if (error) throw error;
  }
}

export async function moveTaskToSection(
  supabase: SupabaseClient<Database>,
  taskId: string,
  sectionId: string | null,
  orderIndex: number,
  /** A02: Section defaults to apply when moving task */
  sectionDefaults?: {
    default_status?: string | null;
    default_priority?: string | null;
    default_assignee_id?: string | null;
  },
): Promise<void> {
  const updates: Record<string, unknown> = {
    section_id: sectionId,
    order_index: orderIndex,
  };

  // A02: Apply section defaults if provided
  if (sectionDefaults?.default_status) {
    updates.status = sectionDefaults.default_status;
  }
  if (sectionDefaults?.default_priority) {
    updates.priority = sectionDefaults.default_priority;
  }
  if (sectionDefaults?.default_assignee_id) {
    updates.assignee_id = sectionDefaults.default_assignee_id;
  }

  const { error } = await supabase
    .from("os_tasks")
    .update(updates as never)
    .eq("id", taskId);

  if (error) throw error;
}

export async function reorderTasks(
  supabase: SupabaseClient<Database>,
  tasks: { id: string; order_index: number; section_id?: string | null }[],
): Promise<void> {
  for (const t of tasks) {
    const updates: Record<string, unknown> = { order_index: t.order_index };
    if (t.section_id !== undefined) updates.section_id = t.section_id;
    const { error } = await supabase
      .from("os_tasks")
      .update(updates as never)
      .eq("id", t.id);
    if (error) throw error;
  }
}

/** Project task statistics computed from os_tasks. */
export interface ProjectTaskStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  totalSubtasks: number;
  completedSubtasks: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

export async function getProjectTaskStats(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<ProjectTaskStats> {
  const { data, error } = await supabase
    .from("os_tasks")
    .select("id,status,is_completed,due_date,priority,parent_id")
    .eq("project_id", projectId);

  if (error) throw error;

  const tasks = data ?? [];
  const now = new Date().toISOString().split("T")[0];
  const parents = tasks.filter((t) => !t.parent_id);
  const subtasks = tasks.filter((t) => !!t.parent_id);

  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  let completed = 0;
  let inProgress = 0;
  let overdue = 0;
  let blocked = 0;

  for (const t of parents) {
    // Status aggregation
    const s = t.status || "pendente";
    byStatus[s] = (byStatus[s] ?? 0) + 1;

    // Priority aggregation
    const p = t.priority || "sem_prioridade";
    byPriority[p] = (byPriority[p] ?? 0) + 1;

    if (t.is_completed) {
      completed++;
    } else {
      if (s === "em_andamento" || s === "revisao") inProgress++;
      if (s === "bloqueada") blocked++;
      if (t.due_date && t.due_date < now) overdue++;
    }
  }

  return {
    totalTasks: parents.length,
    completedTasks: completed,
    inProgressTasks: inProgress,
    overdueTasks: overdue,
    blockedTasks: blocked,
    totalSubtasks: subtasks.length,
    completedSubtasks: subtasks.filter((t) => t.is_completed).length,
    byStatus,
    byPriority,
  };
}
