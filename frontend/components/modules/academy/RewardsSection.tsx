"use client";

import { IconLoader2 } from "@tabler/icons-react";
import { PointsBalanceCard } from "./rewards/PointsBalanceCard";
import { WishlistCard } from "./rewards/WishlistCard";
import { MilestoneTimeline } from "./rewards/MilestoneTimeline";
import { useRewards } from "@/features/cultura/hooks/use-rewards";
import { usePointsBalance } from "@/features/cultura/hooks/use-reconhecimentos";
import { useAuthStore } from "@/stores/auth-store";

export function RewardsSection() {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: pointsData, isLoading: loadingPoints } = usePointsBalance(userId);
  const { data: rewardsData, isLoading: loadingRewards } = useRewards(true);

  const currentPoints = (pointsData as number | undefined) ?? 0;
  const isLoading = loadingPoints || loadingRewards;

  const rewardRows = (rewardsData ?? []) as Record<string, unknown>[];
  const wishlistItems = rewardRows.map((r) => ({
    id: (r.id as string) ?? "",
    name: (r.name as string) ?? "",
    cost: (r.points_required as number) ?? 0,
    category: (r.type as string) ?? "product",
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">Recompensas</h2>
        {isLoading && (
          <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-primary/5 via-secondary/10 to-background p-6 backdrop-blur-md">
        <PointsBalanceCard totalPoints={currentPoints} />
        <div className="mt-6 space-y-6">
          <WishlistCard items={wishlistItems} currentPoints={currentPoints} />
          <MilestoneTimeline currentPoints={currentPoints} />
        </div>
      </div>
    </div>
  );
}
