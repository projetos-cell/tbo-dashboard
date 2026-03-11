"use client";

import {
  IconLoader2,
  IconAlertTriangle,
  IconRefresh,
} from "@tabler/icons-react";
import { PointsBalanceCard } from "./rewards/PointsBalanceCard";
import { WishlistCard } from "./rewards/WishlistCard";
import { MilestoneTimeline } from "./rewards/MilestoneTimeline";
import { useRewards } from "@/features/cultura/hooks/use-rewards";
import { usePointsBalance } from "@/features/cultura/hooks/use-reconhecimentos";
import { useAuthStore } from "@/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";

export function RewardsSection() {
  const userId = useAuthStore((s) => s.user?.id);
  const { data: pointsData, isLoading: loadingPoints, isError: errorPoints, refetch: refetchPoints } = usePointsBalance(userId);
  const { data: rewardsData, isLoading: loadingRewards, isError: errorRewards, refetch: refetchRewards } = useRewards(true);

  const currentPoints = (pointsData as number | undefined) ?? 0;
  const isLoading = loadingPoints || loadingRewards;
  const isError = errorPoints || errorRewards;

  const refetch = () => {
    refetchPoints();
    refetchRewards();
  };

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

      {isError ? (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
          <IconAlertTriangle className="h-6 w-6 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            Erro ao carregar recompensas
          </p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          >
            <IconRefresh className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      ) : isLoading ? (
        <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-primary/5 via-secondary/10 to-background p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-primary/5 via-secondary/10 to-background p-6 backdrop-blur-md">
          <PointsBalanceCard totalPoints={currentPoints} />
          <div className="mt-6 space-y-6">
            <WishlistCard items={wishlistItems} currentPoints={currentPoints} />
            <MilestoneTimeline currentPoints={currentPoints} />
          </div>
        </div>
      )}
    </div>
  );
}
