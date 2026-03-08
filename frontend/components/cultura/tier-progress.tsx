"use client";

import { RECOGNITION_TIERS } from "@/lib/constants";

interface TierProgressProps {
  points: number;
  compact?: boolean;
}

export function TierProgress({ points, compact }: TierProgressProps) {
  const currentTier = RECOGNITION_TIERS.findLast((t) => points >= t.minPoints) ?? RECOGNITION_TIERS[0];
  const nextTier = RECOGNITION_TIERS.find((t) => t.minPoints > points);

  const progress = nextTier
    ? ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span>{currentTier.icon}</span>
        <span className="font-medium" style={{ color: currentTier.color }}>
          {currentTier.name}
        </span>
        <span className="text-gray-500">({points} pts)</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentTier.icon}</span>
          <div>
            <p className="font-medium text-sm" style={{ color: currentTier.color }}>
              {currentTier.name}
            </p>
            <p className="text-xs text-gray-500">
              {points} pontos acumulados
            </p>
          </div>
        </div>
        {nextTier && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Proximo: {nextTier.icon} {nextTier.name}</p>
            <p className="text-xs text-gray-500">
              Faltam {nextTier.minPoints - points} pts
            </p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: currentTier.color,
          }}
        />
      </div>

      {/* All tiers */}
      <div className="flex justify-between text-xs text-gray-500">
        {RECOGNITION_TIERS.map((tier) => (
          <span
            key={tier.name}
            className={points >= tier.minPoints ? "font-medium" : "opacity-50"}
            style={points >= tier.minPoints ? { color: tier.color } : undefined}
          >
            {tier.icon} {tier.minPoints}
          </span>
        ))}
      </div>
    </div>
  );
}
