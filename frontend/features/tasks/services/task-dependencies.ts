import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type {
  TaskDependency,
  CreateDependencyInput,
} from "@/schemas/task-dependency";

const TABLE = "task_dependencies" as never;

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
