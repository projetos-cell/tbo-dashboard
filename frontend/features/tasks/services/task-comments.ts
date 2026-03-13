import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type {
  TaskComment,
  CreateCommentInput,
  UpdateCommentInput,
} from "@/schemas/task-comment";

const TABLE = "task_comments" as never;

export async function getTaskComments(
  supabase: SupabaseClient<Database>,
  taskId: string
): Promise<TaskComment[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as TaskComment[];
}

export async function createTaskComment(
  supabase: SupabaseClient<Database>,
  input: CreateCommentInput & { author_id: string }
): Promise<TaskComment> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(input as never)
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as TaskComment;
}

export async function updateTaskComment(
  supabase: SupabaseClient<Database>,
  id: string,
  input: UpdateCommentInput
): Promise<TaskComment> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...input, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as TaskComment;
}

export async function deleteTaskComment(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
