import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { UserStats } from "../schemas/user-stats.schema";

const DEFAULT_STATS: UserStats = {
  progressPercent: 0,
  level: 1,
  levelLabel: "Iniciante",
  xpCurrent: 0,
  xpNext: 100,
  lessonsCompleted: 0,
  lessonsTotal: 0,
  certificatesCount: 0,
};

async function fetchUserStats(): Promise<UserStats> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return DEFAULT_STATS;

  const { data } = await supabase
    .from("academy_user_stats" as never)
    .select("*")
    .eq("user_id" as never, user.id)
    .single();

  if (!data) return DEFAULT_STATS;

  const row = data as Record<string, unknown>;
  return {
    progressPercent: (row.progress_percent as number) ?? 0,
    level: (row.level as number) ?? 1,
    levelLabel: (row.level_label as string) ?? "Iniciante",
    xpCurrent: (row.xp_current as number) ?? 0,
    xpNext: (row.xp_next as number) ?? 100,
    lessonsCompleted: (row.lessons_completed as number) ?? 0,
    lessonsTotal: (row.lessons_total as number) ?? 0,
    certificatesCount: (row.certificates_count as number) ?? 0,
  };
}

export function useUserStats() {
  return useQuery({
    queryKey: ["academy", "user-stats"],
    queryFn: fetchUserStats,
    staleTime: 1000 * 60 * 5,
    placeholderData: DEFAULT_STATS,
  });
}
