import type { SupabaseClient } from "@supabase/supabase-js";

type UntypedClient = SupabaseClient<Record<string, never>>;

export interface HubCommentRow {
  id: string;
  post_id: string;
  tenant_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  mentions: string[];
  created_at: string;
  author_full_name?: string;
  author_avatar_url?: string | null;
}

export async function getHubComments(
  supabase: UntypedClient,
  postId: string
): Promise<HubCommentRow[]> {
  const { data, error } = await (supabase as unknown as SupabaseClient)
    .from("hub_post_comments")
    .select(
      `*, profiles!hub_post_comments_author_id_fkey(full_name, avatar_url)`
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as Record<string, unknown>[]).map((row) => {
    const profile = row.profiles as Record<string, unknown> | null;
    return {
      id: row.id as string,
      post_id: row.post_id as string,
      tenant_id: row.tenant_id as string,
      author_id: row.author_id as string,
      content: row.content as string,
      parent_id: row.parent_id as string | null,
      mentions: (row.mentions as string[]) ?? [],
      created_at: row.created_at as string,
      author_full_name: (profile?.full_name as string) ?? "Usuario",
      author_avatar_url: (profile?.avatar_url as string | null) ?? null,
    };
  });
}

export async function addHubComment(
  supabase: UntypedClient,
  comment: {
    post_id: string;
    tenant_id: string;
    author_id: string;
    content: string;
    parent_id?: string;
    mentions?: string[];
  }
): Promise<HubCommentRow> {
  const { data, error } = await (supabase as unknown as SupabaseClient)
    .from("hub_post_comments")
    .insert(comment as never)
    .select(
      `*, profiles!hub_post_comments_author_id_fkey(full_name, avatar_url)`
    )
    .single();

  if (error) throw error;

  const row = data as Record<string, unknown>;
  const profile = row.profiles as Record<string, unknown> | null;
  return {
    id: row.id as string,
    post_id: row.post_id as string,
    tenant_id: row.tenant_id as string,
    author_id: row.author_id as string,
    content: row.content as string,
    parent_id: row.parent_id as string | null,
    mentions: (row.mentions as string[]) ?? [],
    created_at: row.created_at as string,
    author_full_name: (profile?.full_name as string) ?? "Usuario",
    author_avatar_url: (profile?.avatar_url as string | null) ?? null,
  };
}
