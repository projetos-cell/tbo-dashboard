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
    .select("id,title,color,order_index,project_id,tenant_id,created_at,updated_at")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data ?? [];
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
