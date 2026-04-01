import type { SupabaseClient } from "@supabase/supabase-js";

// hub_posts não está no types gerado ainda — usar untyped queries
type UntypedClient = SupabaseClient<Record<string, never>>;

export type HubPostChannel =
  | "projetos"
  | "comercial"
  | "financeiro"
  | "pessoas"
  | "cultura"
  | "marketing";

export interface HubPostRow {
  id: string;
  tenant_id: string;
  author_id: string;
  title: string | null;
  body: string;
  channel: HubPostChannel;
  cover_url: string | null;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  // joined
  author_full_name?: string;
  author_avatar_url?: string | null;
  author_role?: string | null;
  user_has_liked?: boolean;
}

export interface GetHubPostsParams {
  channel?: HubPostChannel | null;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getHubPosts(
  supabase: UntypedClient,
  params: GetHubPostsParams = {}
): Promise<HubPostRow[]> {
  const { channel, search, limit = 20, offset = 0 } = params;

  let query = (supabase as unknown as SupabaseClient)
    .from("hub_posts")
    .select(
      `*, profiles!hub_posts_author_id_fkey(full_name, avatar_url, role)`
    )
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (channel) {
    query = query.eq("channel", channel);
  }

  if (search) {
    query = query.textSearch("body", search, { type: "websearch", config: "portuguese" });
  }

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as Record<string, unknown>[]).map((row) => {
    const profile = row.profiles as Record<string, unknown> | null;
    return {
      id: row.id as string,
      tenant_id: row.tenant_id as string,
      author_id: row.author_id as string,
      title: row.title as string | null,
      body: row.body as string,
      channel: row.channel as HubPostChannel,
      cover_url: row.cover_url as string | null,
      is_pinned: row.is_pinned as boolean,
      likes_count: row.likes_count as number,
      comments_count: row.comments_count as number,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      author_full_name: (profile?.full_name as string) ?? "Usuario",
      author_avatar_url: (profile?.avatar_url as string | null) ?? null,
      author_role: (profile?.role as string | null) ?? null,
    };
  });
}

export async function createHubPost(
  supabase: UntypedClient,
  post: {
    tenant_id: string;
    author_id: string;
    title?: string;
    body: string;
    channel: HubPostChannel;
    cover_url?: string;
  }
): Promise<HubPostRow> {
  const { data, error } = await (supabase as unknown as SupabaseClient)
    .from("hub_posts")
    .insert(post as never)
    .select(
      `*, profiles!hub_posts_author_id_fkey(full_name, avatar_url, role)`
    )
    .single();

  if (error) throw error;

  const row = data as Record<string, unknown>;
  const profile = row.profiles as Record<string, unknown> | null;
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    author_id: row.author_id as string,
    title: row.title as string | null,
    body: row.body as string,
    channel: row.channel as HubPostChannel,
    cover_url: row.cover_url as string | null,
    is_pinned: row.is_pinned as boolean,
    likes_count: row.likes_count as number,
    comments_count: row.comments_count as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    author_full_name: (profile?.full_name as string) ?? "Usuario",
    author_avatar_url: (profile?.avatar_url as string | null) ?? null,
    author_role: (profile?.role as string | null) ?? null,
  };
}

export async function deleteHubPost(
  supabase: UntypedClient,
  id: string
): Promise<void> {
  const { error } = await (supabase as unknown as SupabaseClient)
    .from("hub_posts")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function toggleHubPostLike(
  supabase: UntypedClient,
  postId: string,
  userId: string,
  tenantId: string,
  isLiked: boolean
): Promise<void> {
  if (isLiked) {
    const { error } = await (supabase as unknown as SupabaseClient)
      .from("hub_post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await (supabase as unknown as SupabaseClient)
      .from("hub_post_likes")
      .insert({ post_id: postId, user_id: userId, tenant_id: tenantId } as never);
    if (error) throw error;
  }
}

export async function checkUserLikes(
  supabase: UntypedClient,
  postIds: string[],
  userId: string
): Promise<Set<string>> {
  if (postIds.length === 0) return new Set();
  const { data, error } = await (supabase as unknown as SupabaseClient)
    .from("hub_post_likes")
    .select("post_id")
    .eq("user_id", userId)
    .in("post_id", postIds);
  if (error) throw error;
  return new Set(((data ?? []) as Array<{ post_id: string }>).map((r) => r.post_id));
}
