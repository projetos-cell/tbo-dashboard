import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Rewards } from "../schemas/rewards.schema";

const DEFAULT_REWARDS: Rewards = {
  pointsBalance: 0,
  wishlist: [],
  milestones: [],
};

async function fetchRewards(): Promise<Rewards> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return DEFAULT_REWARDS;

  const [balanceRes, wishlistRes, milestonesRes] = await Promise.all([
    supabase
      .from("academy_rewards_balance" as never)
      .select("points" as never)
      .eq("user_id" as never, user.id)
      .single(),
    supabase
      .from("academy_rewards_wishlist" as never)
      .select("*, reward:academy_rewards(*)" as never)
      .eq("user_id" as never, user.id),
    supabase
      .from("academy_milestones" as never)
      .select("*")
      .order("points_required" as never),
  ]);

  const balanceRow = balanceRes.data as Record<string, unknown> | null;
  const pointsBalance = (balanceRow?.points as number) ?? 0;

  const wishlistRows = (wishlistRes.data ?? []) as Record<string, unknown>[];
  const milestoneRows = (milestonesRes.data ?? []) as Record<string, unknown>[];

  return {
    pointsBalance,
    wishlist: wishlistRows.map((w) => {
      const reward = w.reward as Record<string, unknown> | null;
      return {
        id: (reward?.id ?? w.id) as string,
        name: (reward?.name ?? "") as string,
        description: (reward?.description ?? "") as string,
        pointsCost: (reward?.points_cost ?? 0) as number,
        imageUrl: (reward?.image_url as string) ?? undefined,
        available: (reward?.available ?? false) as boolean,
      };
    }),
    milestones: milestoneRows.map((m) => ({
      id: m.id as string,
      label: m.label as string,
      pointsRequired: m.points_required as number,
      reached: pointsBalance >= (m.points_required as number),
    })),
  };
}

export function useRewards() {
  return useQuery({
    queryKey: ["academy", "rewards"],
    queryFn: fetchRewards,
    staleTime: 1000 * 60 * 5,
    placeholderData: DEFAULT_REWARDS,
  });
}
