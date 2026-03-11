import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface RecentAction {
  id: string;
  type: "lesson" | "certificate" | "milestone" | "video";
  title: string;
  timestamp: string;
}

async function fetchRecentActions(): Promise<RecentAction[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("academy_user_actions" as never)
    .select("*")
    .eq("user_id" as never, user.id)
    .order("created_at" as never, { ascending: false })
    .limit(20);

  const rows = (data ?? []) as Record<string, unknown>[];
  return rows.map((a) => ({
    id: a.id as string,
    type: a.type as RecentAction["type"],
    title: a.title as string,
    timestamp: a.created_at as string,
  }));
}

export function useRecentActions() {
  return useQuery({
    queryKey: ["academy", "recent-actions"],
    queryFn: fetchRecentActions,
    staleTime: 1000 * 60 * 2,
  });
}
