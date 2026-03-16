import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type CommentRow = Database["public"]["Tables"]["project_comments"]["Row"];

const TABLE = "task_comments" as never;
const COMMENT_COLS =
  "id,task_id,author_id,content,parent_comment_id,created_at,updated_at";

/** Extract plain text from TipTap JSON content */
function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!content || typeof content !== "object") return "";
  const doc = content as { content?: Array<{ content?: Array<{ text?: string }> }> };
  return (doc.content ?? [])
    .flatMap((block) => (block.content ?? []).map((n) => n.text ?? ""))
    .join("\n");
}

/** Normalize task_comments row to match CommentRow shape */
function normalize(row: Record<string, unknown>): CommentRow {
  return {
    ...row,
    content: extractText(row.content),
    parent_id: (row.parent_comment_id as string) ?? null,
    tenant_id: (row.tenant_id as string) ?? "",
  } as unknown as CommentRow;
}

export async function getComments(
  supabase: SupabaseClient<Database>,
  taskId: string
): Promise<CommentRow[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COMMENT_COLS)
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => normalize(r as Record<string, unknown>));
}

export async function createComment(
  supabase: SupabaseClient<Database>,
  comment: Database["public"]["Tables"]["project_comments"]["Insert"]
): Promise<CommentRow> {
  const tenantId = (comment as Record<string, unknown>).tenant_id as string;
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      task_id: comment.task_id,
      author_id: comment.author_id,
      content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: comment.content ?? "" }] }] },
      parent_comment_id: comment.parent_id ?? null,
    } as never)
    .select(COMMENT_COLS)
    .single();

  if (error) throw error;
  return normalize(data as Record<string, unknown>);
}

export async function updateComment(
  supabase: SupabaseClient<Database>,
  id: string,
  content: string
): Promise<CommentRow> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: content }] }] },
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .select(COMMENT_COLS)
    .single();

  if (error) throw error;
  return normalize(data as Record<string, unknown>);
}

export async function deleteComment(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
