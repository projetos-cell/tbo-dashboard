import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type TaskDependencyRow = {
  id: string;
  tenant_id: string;
  task_id: string;
  depends_on_id: string;
  dependency_type: "finish_to_start" | "start_to_start" | "finish_to_finish" | "start_to_finish";
  lag_days: number;
  created_at: string;
};

export type { TaskDependencyRow };

export async function getTaskDependencies(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<TaskDependencyRow[]> {
  // Get all task IDs for this project first
  const { data: tasks, error: tasksError } = await supabase
    .from("os_tasks")
    .select("id")
    .eq("project_id", projectId);

  if (tasksError) throw tasksError;
  if (!tasks || tasks.length === 0) return [];

  const taskIds = tasks.map((t) => t.id);

  const { data, error } = await supabase
    .from("task_dependencies" as never)
    .select("*")
    .in("task_id", taskIds)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TaskDependencyRow[];
}

export async function addTaskDependency(
  supabase: SupabaseClient<Database>,
  params: {
    tenant_id: string;
    task_id: string;
    depends_on_id: string;
    dependency_type?: "finish_to_start" | "start_to_start" | "finish_to_finish" | "start_to_finish";
    lag_days?: number;
  },
): Promise<TaskDependencyRow> {
  const { data, error } = await supabase
    .from("task_dependencies" as never)
    .insert({
      tenant_id: params.tenant_id,
      task_id: params.task_id,
      depends_on_id: params.depends_on_id,
      dependency_type: params.dependency_type ?? "finish_to_start",
      lag_days: params.lag_days ?? 0,
    } as never)
    .select()
    .single();

  if (error) throw error;
  return data as TaskDependencyRow;
}

export async function removeTaskDependency(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("task_dependencies" as never)
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/** Returns tasks that block the given taskId (i.e., taskId depends on them). */
export async function getBlockingTasks(
  supabase: SupabaseClient<Database>,
  taskId: string,
): Promise<Array<TaskDependencyRow & { blocking_task: { id: string; title: string; status: string | null; is_completed: boolean | null } }>> {
  const { data, error } = await supabase
    .from("task_dependencies" as never)
    .select("*, blocking_task:os_tasks!depends_on_id(id,title,status,is_completed)")
    .eq("task_id", taskId);

  if (error) throw error;
  return (data ?? []) as never;
}

export interface CriticalPathResult {
  taskId: string;
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  slack: number;
  isCritical: boolean;
}

/** Compute critical path for a project by traversing the dependency graph. */
export async function getCriticalPath(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<CriticalPathResult[]> {
  const [tasksRes, depsRes] = await Promise.all([
    supabase
      .from("os_tasks")
      .select("id,title,start_date,due_date,status,is_completed")
      .eq("project_id", projectId),
    getTaskDependencies(supabase, projectId),
  ]);

  if (tasksRes.error) throw tasksRes.error;

  const tasks = tasksRes.data ?? [];
  const deps = depsRes;

  // Build adjacency maps
  const successors = new Map<string, string[]>();
  const predecessors = new Map<string, string[]>();

  for (const task of tasks) {
    successors.set(task.id, []);
    predecessors.set(task.id, []);
  }

  for (const dep of deps) {
    successors.get(dep.depends_on_id)?.push(dep.task_id);
    predecessors.get(dep.task_id)?.push(dep.depends_on_id);
  }

  // Duration in days (default 1 if no dates)
  const getDuration = (task: { start_date: string | null; due_date: string | null }) => {
    if (task.start_date && task.due_date) {
      const s = new Date(task.start_date).getTime();
      const e = new Date(task.due_date).getTime();
      return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
    }
    return 1;
  };

  const durationMap = new Map(tasks.map((t) => [t.id, getDuration(t)]));

  // Forward pass: compute earliest start/finish
  const es = new Map<string, number>();
  const ef = new Map<string, number>();

  const topoOrder: string[] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  const dfs = (id: string) => {
    if (inStack.has(id)) return; // cycle guard
    if (visited.has(id)) return;
    inStack.add(id);
    for (const pred of predecessors.get(id) ?? []) {
      dfs(pred);
    }
    inStack.delete(id);
    visited.add(id);
    topoOrder.push(id);
  };

  for (const task of tasks) dfs(task.id);

  for (const id of topoOrder) {
    const predEFs = (predecessors.get(id) ?? []).map((p) => ef.get(p) ?? 0);
    const esVal = predEFs.length > 0 ? Math.max(...predEFs) : 0;
    es.set(id, esVal);
    ef.set(id, esVal + (durationMap.get(id) ?? 1));
  }

  const maxEF = Math.max(...Array.from(ef.values()), 0);

  // Backward pass: compute latest start/finish
  const ls = new Map<string, number>();
  const lf = new Map<string, number>();

  for (const id of [...topoOrder].reverse()) {
    const succLSs = (successors.get(id) ?? []).map((s) => ls.get(s) ?? maxEF);
    const lfVal = succLSs.length > 0 ? Math.min(...succLSs) : maxEF;
    lf.set(id, lfVal);
    ls.set(id, lfVal - (durationMap.get(id) ?? 1));
  }

  return tasks.map((task) => {
    const esVal = es.get(task.id) ?? 0;
    const efVal = ef.get(task.id) ?? 0;
    const lsVal = ls.get(task.id) ?? 0;
    const lfVal = lf.get(task.id) ?? 0;
    const slack = lsVal - esVal;

    return {
      taskId: task.id,
      earliestStart: esVal,
      earliestFinish: efVal,
      latestStart: lsVal,
      latestFinish: lfVal,
      slack,
      isCritical: slack === 0,
    };
  });
}
