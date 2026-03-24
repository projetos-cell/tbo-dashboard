import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { BlogPostWithAuthor, BlogPostInsert, BlogPostUpdate } from "../types";

type Client = SupabaseClient<Database>;

export async function getBlogPosts(supabase: Client): Promise<BlogPostWithAuthor[]> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("blog_posts")
    .select(`
      *,
      author:profiles!blog_posts_author_id_fkey(full_name, avatar_url)
    `)
    .order("updated_at", { ascending: false });
  if (error) throw error;

  return ((data ?? []) as Record<string, unknown>[]).map((row) => {
    const author = row.author as { full_name: string; avatar_url: string | null } | null;
    return {
      ...row,
      author_name: author?.full_name ?? null,
      author_avatar_url: author?.avatar_url ?? null,
    };
  }) as BlogPostWithAuthor[];
}

export async function getBlogPost(supabase: Client, id: string): Promise<BlogPostWithAuthor> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("blog_posts")
    .select(`
      *,
      author:profiles!blog_posts_author_id_fkey(full_name, avatar_url)
    `)
    .eq("id", id)
    .single();
  if (error) throw error;

  const author = (data as Record<string, unknown>).author as { full_name: string; avatar_url: string | null } | null;
  return {
    ...(data as Record<string, unknown>),
    author_name: author?.full_name ?? null,
    author_avatar_url: author?.avatar_url ?? null,
  } as BlogPostWithAuthor;
}

export async function createBlogPost(
  supabase: Client,
  post: BlogPostInsert,
): Promise<BlogPostWithAuthor> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("blog_posts")
    .insert(post as never)
    .select(`
      *,
      author:profiles!blog_posts_author_id_fkey(full_name, avatar_url)
    `)
    .single();
  if (error) throw error;

  const author = (data as Record<string, unknown>).author as { full_name: string; avatar_url: string | null } | null;
  return {
    ...(data as Record<string, unknown>),
    author_name: author?.full_name ?? null,
    author_avatar_url: author?.avatar_url ?? null,
  } as BlogPostWithAuthor;
}

export async function updateBlogPost(
  supabase: Client,
  id: string,
  updates: BlogPostUpdate,
): Promise<BlogPostWithAuthor> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("blog_posts")
    .update(updates as never)
    .eq("id", id)
    .select(`
      *,
      author:profiles!blog_posts_author_id_fkey(full_name, avatar_url)
    `)
    .single();
  if (error) throw error;

  const author = (data as Record<string, unknown>).author as { full_name: string; avatar_url: string | null } | null;
  return {
    ...(data as Record<string, unknown>),
    author_name: author?.full_name ?? null,
    author_avatar_url: author?.avatar_url ?? null,
  } as BlogPostWithAuthor;
}

export async function deleteBlogPost(supabase: Client, id: string): Promise<void> {
  const { error } = await (supabase as SupabaseClient)
    .from("blog_posts")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function uploadBlogCover(
  supabase: Client,
  tenantId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${tenantId}/blog-covers/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("marketing-assets")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from("marketing-assets").getPublicUrl(path);
  return data.publicUrl;
}
