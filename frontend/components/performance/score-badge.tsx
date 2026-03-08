"use client";

import { Badge } from "@/components/tbo-ui/badge";
import {
  getScoreBand,
  TREND_CONFIG,
  type TrendDirection,
} from "@/lib/performance-constants";

// ---------------------------------------------------------------------------
// Score Badge — colored badge showing score + band label
// ---------------------------------------------------------------------------

interface ScoreBadgeProps {
  score: number | null | undefined;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ScoreBadge({ score, showLabel = false, size = "sm" }: ScoreBadgeProps) {
  const band = getScoreBand(score);
  const fontSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <Badge
      variant="default"
      className={`${band.bgClass} ${band.textClass} border-0 ${fontSize} font-semibold`}
    >
      {score != null ? score.toFixed(1) : "—"}
      {showLabel && ` ${band.label}`}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Trend Indicator
// ---------------------------------------------------------------------------

interface TrendIndicatorProps {
  trend: TrendDirection | null | undefined;
}

export function TrendIndicator({ trend }: TrendIndicatorProps) {
  if (!trend) return <span className="text-xs text-gray-500">→</span>;
  const config = TREND_CONFIG[trend];
  return (
    <span className={`text-sm font-medium ${config.color}`} title={config.label}>
      {config.icon}
    </span>
  );
}
