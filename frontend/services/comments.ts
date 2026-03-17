import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type CommentRow = Database["public"]["Tables"]["project_comments"]["Row"];

const COMMENT_COLS =
  "id,task_id,author_id,content,parent_id,tenant_id,created_at,updated_at";

export async function getComments(
  supabase: SupabaseClient<Database>,
  taskId: string
): Promise<CommentRow[]> {
  const { data, error } = await supabase
    .from("project_comments")
    .select(COMMENT_COLS)
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CommentRow[];
}

export async function createComment(
  supabase: SupabaseClient<Database>,
  comment: Database["public"]["Tables"]["project_comments"]["Insert"]
): Promise<CommentRow> {
  const { data, error } = await supabase
    .from("project_comments")
    .insert({
      task_id: comment.task_id,
      author_id: comment.author_id,
      content: comment.content ?? "",
      parent_id: comment.parent_id ?? null,
      tenant_id: comment.tenant_id,
    } as never)
    .select(COMMENT_COLS)
    .single();

  if (error) throw error;
  return data as CommentRow;
}

export async function updateComment(
  supabase: SupabaseClient<Database>,
  id: string,
  content: string
): Promise<CommentRow> {
  const { data, error } = await supabase
    .from("project_comments")
    .update({
      content,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .select(COMMENT_COLS)
    .single();

  if (error) throw error;
  return data as CommentRow;
}

export async function deleteComment(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("project_comments").delete().eq("id", id);
  if (error) throw error;
}
