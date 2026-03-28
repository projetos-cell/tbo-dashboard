import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface TaskComment {
  id: string;
  tenant_id: string;
  task_id: string;
  author_id: string;
  content: string;
  mentions: string[];
  parent_id: string | null;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
}

export async function getTaskComments(
  supabase: SupabaseClient<Database>,
  taskId: string,
): Promise<TaskComment[]> {
  const { data, error } = await supabase
    .from("task_comments" as never)
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  const comments = (data ?? []) as TaskComment[];

  if (comments.length === 0) return comments;

  // Enrich with author profiles
  const authorIds = [...new Set(comments.map((c) => c.author_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,full_name,avatar_url,email")
    .in("id", authorIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return comments.map((c) => ({
    ...c,
    author: profileMap.get(c.author_id) ?? undefined,
  }));
}

export async function createComment(
  supabase: SupabaseClient<Database>,
  params: {
    tenant_id: string;
    task_id: string;
    author_id: string;
    content: string;
    mentions?: string[];
    parent_id?: string | null;
  },
): Promise<TaskComment> {
  const { data, error } = await supabase
    .from("task_comments" as never)
    .insert({
      tenant_id: params.tenant_id,
      task_id: params.task_id,
      author_id: params.author_id,
      content: params.content,
      mentions: params.mentions ?? [],
      parent_id: params.parent_id ?? null,
    } as never)
    .select()
    .single();

  if (error) throw error;
  return data as TaskComment;
}

export async function updateComment(
  supabase: SupabaseClient<Database>,
  id: string,
  content: string,
): Promise<TaskComment> {
  const { data, error } = await supabase
    .from("task_comments" as never)
    .update({
      content,
      is_edited: true,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as TaskComment;
}

export async function deleteComment(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("task_comments" as never)
    .delete()
    .eq("id", id);

  if (error) throw error;
}
