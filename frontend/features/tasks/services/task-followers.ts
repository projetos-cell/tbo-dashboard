import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export async function getTaskFollowers(
  supabase: SupabaseClient<Database>,
  taskId: string,
): Promise<{ user_id: string }[]> {
  const { data, error } = await supabase
    .from("task_followers")
    .select("user_id")
    .eq("task_id", taskId);

  if (error) throw error;
  return data ?? [];
}

export async function followTask(
  supabase: SupabaseClient<Database>,
  taskId: string,
  userId: string,
  tenantId: string,
): Promise<void> {
  const { error } = await supabase.from("task_followers").insert({
    task_id: taskId,
    user_id: userId,
    tenant_id: tenantId,
  } as never);

  if (error && !error.message.includes("duplicate")) throw error;
}

export async function unfollowTask(
  supabase: SupabaseClient<Database>,
  taskId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("task_followers")
    .delete()
    .eq("task_id", taskId)
    .eq("user_id", userId);

  if (error) throw error;
}
