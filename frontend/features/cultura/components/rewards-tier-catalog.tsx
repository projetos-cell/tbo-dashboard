"use client";

import { IconStar } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  REWARDS_CATALOG,
  REWARD_CATEGORIES,
  type CatalogReward,
  type RewardTier,
} from "@/features/cultura/data/rewards-catalog";

interface RewardsTierCatalogProps {
  userBalance: number;
  onRedeem: (reward: CatalogReward) => void;
}

function TierCard({
  reward,
  accentColor,
  userBalance,
  onRedeem,
}: {
  reward: CatalogReward;
  accentColor: string;
  userBalance: number;
  onRedeem: (reward: CatalogReward) => void;
}) {
  const cat = REWARD_CATEGORIES[reward.category];
  const canAfford = userBalance >= reward.points;

  return (
    <Card className="group relative overflow-hidden border transition-all hover:shadow-md hover:-translate-y-0.5">
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 transition-all group-hover:h-1"
        style={{ backgroundColor: accentColor }}
      />

      <CardContent className="p-4 pt-4 flex flex-col h-full">
        <div className="flex-1 space-y-2">
          {/* Header: name + points */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm leading-tight">
              {reward.name}
            </h4>
            <Badge
              variant="outline"
              className="shrink-0 text-xs font-bold gap-0.5 tabular-nums"
              style={{ color: "#f59e0b", borderColor: "rgba(245,158,11,0.3)" }}
            >
              <IconStar className="size-3" />
              {reward.points}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {reward.description}
          </p>

          {/* Category badge */}
          <Badge
            variant="secondary"
            className="text-[10px] font-medium"
            style={{ color: cat.color, backgroundColor: cat.bg }}
          >
            {cat.label}
          </Badge>
        </div>

        {/* Redeem button */}
        <Button
          size="sm"
          variant={canAfford ? "default" : "outline"}
          className="w-full mt-3 text-xs"
          disabled={!canAfford}
          onClick={() => onRedeem(reward)}
        >
          {canAfford
            ? "Resgatar"
            : `Faltam ${reward.points - userBalance} pts`}
        </Button>
      </CardContent>
    </Card>
  );
}

function TierSection({
  tier,
  userBalance,
  onRedeem,
}: {
  tier: RewardTier;
  userBalance: number;
  onRedeem: (reward: CatalogReward) => void;
}) {
  return (
    <section className="space-y-3">
      {/* Tier header */}
      <div
        className={`rounded-lg border p-4 bg-gradient-to-r ${tier.gradient}`}
        style={{ borderColor: tier.borderColor }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{tier.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm" style={{ color: tier.accentColor }}>
                Nível {tier.name}
              </h3>
              <Badge
                variant="outline"
                className="text-[10px] font-medium"
                style={{
                  color: tier.accentColor,
                  borderColor: tier.borderColor,
                }}
              >
                {tier.pointRange}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tier.subtitle}
            </p>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {tier.rewards.length} recompensa{tier.rewards.length !== 1 && "s"}
          </span>
        </div>
      </div>

      {/* Reward cards grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tier.rewards.map((reward) => (
          <TierCard
            key={reward.id}
            reward={reward}
            accentColor={tier.accentColor}
            userBalance={userBalance}
            onRedeem={onRedeem}
          />
        ))}
      </div>
    </section>
  );
}

export function RewardsTierCatalog({
  userBalance,
  onRedeem,
}: RewardsTierCatalogProps) {
  return (
    <div className="space-y-6">
      {REWARDS_CATALOG.map((tier) => (
        <TierSection
          key={tier.id}
          tier={tier}
          userBalance={userBalance}
          onRedeem={onRedeem}
        />
      ))}
    </div>
  );
}
