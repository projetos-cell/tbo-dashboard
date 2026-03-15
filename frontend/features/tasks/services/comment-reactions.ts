import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface ReactionGroup {
  emoji: string;
  count: number;
  user_ids: string[];
}

export async function getCommentReactions(
  supabase: SupabaseClient<Database>,
  commentId: string,
): Promise<ReactionGroup[]> {
  const { data, error } = await supabase
    .from("comment_reactions")
    .select("emoji, user_id")
    .eq("comment_id", commentId);

  if (error) throw error;

  const grouped = new Map<string, string[]>();
  for (const r of data ?? []) {
    const existing = grouped.get(r.emoji) ?? [];
    existing.push(r.user_id);
    grouped.set(r.emoji, existing);
  }

  return Array.from(grouped.entries()).map(([emoji, user_ids]) => ({
    emoji,
    count: user_ids.length,
    user_ids,
  }));
}

export async function toggleReaction(
  supabase: SupabaseClient<Database>,
  commentId: string,
  userId: string,
  emoji: string,
  tenantId: string,
): Promise<"added" | "removed"> {
  // Check if reaction exists
  const { data: existing } = await supabase
    .from("comment_reactions")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", userId)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    await supabase.from("comment_reactions").delete().eq("id", existing.id);
    return "removed";
  }

  const { error } = await supabase.from("comment_reactions").insert({
    comment_id: commentId,
    user_id: userId,
    emoji,
    tenant_id: tenantId,
  } as never);

  if (error) throw error;
  return "added";
}
