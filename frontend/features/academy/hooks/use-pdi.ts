import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PDI } from "../schemas/pdi.schema";

const DEFAULT_PDI: PDI = {
  skills: [],
  actions: [],
};

async function fetchPDI(): Promise<PDI> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return DEFAULT_PDI;

  const [skillsRes, actionsRes] = await Promise.all([
    supabase
      .from("academy_pdi_skills" as never)
      .select("*")
      .eq("user_id" as never, user.id)
      .order("name" as never),
    supabase
      .from("academy_pdi_actions" as never)
      .select("*")
      .eq("user_id" as never, user.id)
      .order("deadline" as never),
  ]);

  const skills = (skillsRes.data ?? []) as Record<string, unknown>[];
  const actions = (actionsRes.data ?? []) as Record<string, unknown>[];

  return {
    skills: skills.map((s) => ({
      id: s.id as string,
      name: s.name as string,
      type: s.type as "hard" | "soft",
      currentLevel: s.current_level as number,
      targetLevel: s.target_level as number,
      timeframe: s.timeframe as string,
    })),
    actions: actions.map((a) => ({
      id: a.id as string,
      action: a.action as string,
      status: a.status as "pending" | "in_progress" | "done",
      deadline: a.deadline as string,
      completed: a.completed as boolean,
    })),
  };
}

export function usePDI() {
  return useQuery({
    queryKey: ["academy", "pdi"],
    queryFn: fetchPDI,
    staleTime: 1000 * 60 * 5,
    placeholderData: DEFAULT_PDI,
  });
}
