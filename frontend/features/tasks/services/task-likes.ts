import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { Like, LikeTarget } from "@/schemas/like";

const TABLE = "likes" as never;

export async function getLikes(
  supabase: SupabaseClient<Database>,
  targetType: LikeTarget,
  targetId: string
): Promise<Like[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("target_type", targetType)
    .eq("target_id", targetId);

  if (error) throw error;
  return (data ?? []) as unknown as Like[];
}

export async function toggleLike(
  supabase: SupabaseClient<Database>,
  userId: string,
  targetType: LikeTarget,
  targetId: string
): Promise<{ liked: boolean }> {
  // Check if already liked
  const { data: existing } = await supabase
    .from(TABLE)
    .select("id")
    .eq("user_id", userId)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", (existing as unknown as { id: string }).id);
    if (error) throw error;
    return { liked: false };
  }

  // Like
  const { error } = await supabase
    .from(TABLE)
    .insert({ user_id: userId, target_type: targetType, target_id: targetId } as never);
  if (error) throw error;
  return { liked: true };
}
