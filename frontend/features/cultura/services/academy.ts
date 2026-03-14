import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AcademyProgressRow {
  id: string;
  user_id: string;
  module_id: string;
  completed_at: string;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getAcademyProgress(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("academy_user_progress" as never)
    .select("module_id")
    .eq("user_id", userId);

  if (error) throw error;
  return ((data ?? []) as { module_id: string }[]).map((r) => r.module_id);
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function markModuleComplete(
  supabase: SupabaseClient<Database>,
  userId: string,
  moduleId: string
): Promise<void> {
  const { error } = await supabase
    .from("academy_user_progress" as never)
    .upsert(
      {
        user_id: userId,
        module_id: moduleId,
        completed_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id,module_id" }
    );

  if (error) throw error;
}

export async function markModuleIncomplete(
  supabase: SupabaseClient<Database>,
  userId: string,
  moduleId: string
): Promise<void> {
  const { error } = await supabase
    .from("academy_user_progress" as never)
    .delete()
    .eq("user_id", userId as never)
    .eq("module_id", moduleId as never);

  if (error) throw error;
}
