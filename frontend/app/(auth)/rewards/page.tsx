"use client";

import Link from "next/link";
import {
  IconGift,
  IconAward,
  IconStar,
  IconArrowRight,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRewardsKPIs } from "@/features/rewards/hooks/use-rewards";
import { useRecognitionKPIs } from "@/features/rewards/hooks/use-reconhecimentos";

export default function RewardsHubPage() {
  const { data: rewardKPIs, isLoading: rLoading } = useRewardsKPIs();
  const { data: recKPIs, isLoading: recLoading } = useRecognitionKPIs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">TBO Rewards</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Reconhecimentos, pontos e recompensas do time.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <IconAward className="size-3.5" />
              Reconhecimentos
            </div>
            {recLoading ? <Skeleton className="h-8 w-12" /> : (
              <p className="text-2xl font-bold">{recKPIs?.total ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <IconStar className="size-3.5" />
              Este mes
            </div>
            {recLoading ? <Skeleton className="h-8 w-12" /> : (
              <p className="text-2xl font-bold">{recKPIs?.thisMonth ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <IconGift className="size-3.5" />
              Recompensas
            </div>
            {rLoading ? <Skeleton className="h-8 w-12" /> : (
              <p className="text-2xl font-bold">{rewardKPIs?.activeRewards ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <IconGift className="size-3.5" />
              Pendentes
            </div>
            {rLoading ? <Skeleton className="h-8 w-12" /> : (
              <p className="text-2xl font-bold">{rewardKPIs?.pendingRedemptions ?? 0}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/rewards/reconhecimentos" className="group">
          <Card className="h-full transition-colors group-hover:border-amber-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="rounded-xl bg-amber-50 p-3 shrink-0">
                <IconAward className="size-7 text-amber-500" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Reconhecimentos</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Feed de reconhecimentos, ranking e pontuacao do time
                </p>
              </div>
              <IconArrowRight className="size-4 text-muted-foreground/30 group-hover:text-amber-500 transition-colors shrink-0" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/rewards/recompensas" className="group">
          <Card className="h-full transition-colors group-hover:border-pink-300">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="rounded-xl bg-pink-50 p-3 shrink-0">
                <IconGift className="size-7 text-pink-500" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Recompensas</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Catalogo de recompensas, resgates e gestao admin
                </p>
              </div>
              <IconArrowRight className="size-4 text-muted-foreground/30 group-hover:text-pink-500 transition-colors shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
