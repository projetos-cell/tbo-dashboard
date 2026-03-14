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

// ─── Aggregate stats (for analytics) ────────────────────────────────────────

export interface AcademyStats {
  totalUsersStarted: number;
  totalUsersCompleted: number;
  avgCompletionPct: number;
  moduleCompletions: { moduleId: string; count: number }[];
}

export async function getAcademyStats(
  supabase: SupabaseClient<Database>,
  totalModules: number
): Promise<AcademyStats> {
  const { data, error } = await supabase
    .from("academy_user_progress" as never)
    .select("user_id, module_id");

  if (error) throw error;

  const rows = (data ?? []) as { user_id: string; module_id: string }[];

  const moduleCounts: Record<string, number> = {};
  const userModules: Record<string, Set<string>> = {};
  for (const r of rows) {
    moduleCounts[r.module_id] = (moduleCounts[r.module_id] ?? 0) + 1;
    if (!userModules[r.user_id]) userModules[r.user_id] = new Set();
    userModules[r.user_id].add(r.module_id);
  }

  const uniqueUsers = Object.keys(userModules);
  const totalUsersStarted = uniqueUsers.length;
  const totalUsersCompleted =
    totalModules > 0
      ? uniqueUsers.filter((uid) => (userModules[uid]?.size ?? 0) >= totalModules).length
      : 0;

  const avgCompletionPct =
    totalModules > 0 && uniqueUsers.length > 0
      ? Math.round(
          (uniqueUsers.reduce((sum, uid) => sum + (userModules[uid]?.size ?? 0), 0) /
            (uniqueUsers.length * totalModules)) *
            100
        )
      : 0;

  const moduleCompletions = Object.entries(moduleCounts).map(
    ([moduleId, count]) => ({ moduleId, count })
  );

  return { totalUsersStarted, totalUsersCompleted, avgCompletionPct, moduleCompletions };
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
