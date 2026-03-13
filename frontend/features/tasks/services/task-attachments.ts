import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type {
  TaskAttachment,
  CreateAttachmentInput,
} from "@/schemas/task-attachment";

const TABLE = "task_attachments" as never;

export async function getTaskAttachments(
  supabase: SupabaseClient<Database>,
  taskId: string
): Promise<TaskAttachment[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as TaskAttachment[];
}

export async function createTaskAttachment(
  supabase: SupabaseClient<Database>,
  input: CreateAttachmentInput & { uploaded_by: string }
): Promise<TaskAttachment> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(input as never)
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as TaskAttachment;
}

export async function deleteTaskAttachment(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
