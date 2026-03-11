import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { OKR } from "../schemas/okr.schema";

async function fetchOKRs(): Promise<OKR[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("academy_okrs" as never)
    .select("*, key_results:academy_okr_key_results(*)" as never)
    .eq("user_id" as never, user.id)
    .order("deadline" as never);

  const rows = (data ?? []) as Record<string, unknown>[];
  return rows.map((okr) => ({
    id: okr.id as string,
    objective: okr.objective as string,
    ownerName: (okr.owner_name as string) ?? "Você",
    deadline: okr.deadline as string,
    keyResults: ((okr.key_results as Record<string, unknown>[] | null) ?? []).map((kr) => ({
      id: kr.id as string,
      description: kr.description as string,
      currentValue: kr.current_value as number,
      targetValue: kr.target_value as number,
      unit: kr.unit as string,
    })),
  }));
}

export function useOKRs() {
  return useQuery({
    queryKey: ["academy", "okrs"],
    queryFn: fetchOKRs,
    staleTime: 1000 * 60 * 5,
  });
}
