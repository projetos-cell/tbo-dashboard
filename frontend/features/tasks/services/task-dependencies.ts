import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type {
  TaskDependency,
  CreateDependencyInput,
} from "@/schemas/task-dependency";

const TABLE = "task_dependencies" as never;

// ─── Read ─────────────────────────────────────────────

export async function getTaskDependencies(
  supabase: SupabaseClient<Database>,
  taskId: string
): Promise<TaskDependency[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .or(`predecessor_id.eq.${taskId},successor_id.eq.${taskId}`)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as TaskDependency[];
}

// ─── Batch fetch by task IDs (for Gantt) ─────────────

export async function getDependenciesByTaskIds(
  supabase: SupabaseClient<Database>,
  taskIds: string[],
): Promise<TaskDependency[]> {
  if (taskIds.length === 0) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .or(
      `predecessor_id.in.(${taskIds.join(",")}),successor_id.in.(${taskIds.join(",")})`,
    );

  if (error) throw error;
  return (data ?? []) as unknown as TaskDependency[];
}

// ─── All dependencies (for circular check) ────────────

export async function getAllDependencies(
  supabase: SupabaseClient<Database>
): Promise<Pick<TaskDependency, "predecessor_id" | "successor_id">[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("predecessor_id,successor_id");

  if (error) throw error;
  return (data ?? []) as Pick<TaskDependency, "predecessor_id" | "successor_id">[];
}

// ─── Circular dependency check (DFS) ─────────────────

/**
 * Returns true if adding (predecessorId → successorId) would create a cycle.
 * Strategy: DFS from successorId following "successor_id" edges.
 * If we reach predecessorId, it means predecessorId is already reachable from successorId → circular.
 */
export async function checkCircularDependency(
  supabase: SupabaseClient<Database>,
  predecessorId: string,
  successorId: string
): Promise<boolean> {
  const allDeps = await getAllDependencies(supabase);

  // Build adjacency map: nodeId → list of its successors
  const graph = new Map<string, string[]>();
  for (const dep of allDeps) {
    const list = graph.get(dep.predecessor_id) ?? [];
    list.push(dep.successor_id);
    graph.set(dep.predecessor_id, list);
  }

  // DFS from successorId — if we reach predecessorId, it's circular
  const visited = new Set<string>();
  const stack = [successorId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === predecessorId) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    const neighbors = graph.get(current) ?? [];
    for (const neighbor of neighbors) {
      stack.push(neighbor);
    }
  }

  return false;
}

// ─── Write ────────────────────────────────────────────

export async function createTaskDependency(
  supabase: SupabaseClient<Database>,
  input: CreateDependencyInput
): Promise<TaskDependency> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(input as never)
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as TaskDependency;
}

export async function deleteTaskDependency(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
