"use client";

import { Badge } from "@/components/tbo-ui/badge";
import { IMPACT_METRIC_MAP } from "@/lib/performance-constants";

interface ImpactMetricCardProps {
  metricId: string;
  normalizedScore: number | null;
  rawValue: number | null;
  available: boolean;
}

export function ImpactMetricCard({
  metricId,
  normalizedScore,
  rawValue,
  available,
}: ImpactMetricCardProps) {
  const def = IMPACT_METRIC_MAP.get(metricId);
  if (!def) return null;

  const hasValue = available && normalizedScore != null;
  const score = normalizedScore ?? 0;

  // Color based on score
  const barColor =
    !hasValue
      ? "bg-gray-100"
      : score >= 75
        ? "bg-emerald-500"
        : score >= 50
          ? "bg-amber-500"
          : "bg-red-500";

  const unit = def.unit;

  // Format raw value for display
  function formatRaw(): string {
    if (!available) return "N/D";
    if (rawValue == null) return "—";
    if (unit === "percent") return `${rawValue}%`;
    if (unit === "count") return `${rawValue}`;
    if (unit === "currency") return `R$ ${rawValue}`;
    return `${rawValue}`;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium truncate">{def.name}</span>
        {!available ? (
          <Badge variant="outline" className="text-[9px] px-1.5">
            N/D
          </Badge>
        ) : hasValue ? (
          <span className="text-xs font-semibold tabular-nums">
            {score.toFixed(0)}
          </span>
        ) : (
          <Badge variant="outline" className="text-[9px] px-1.5">
            Sem dados
          </Badge>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-gray-100">
        <div
          className={`h-1.5 rounded-full transition-all ${barColor}`}
          style={{ width: hasValue ? `${score}%` : "0%" }}
        />
      </div>

      {/* Raw value hint */}
      <p className="text-[10px] text-gray-500">
        {def.description} — <span className="font-medium">{formatRaw()}</span>
        {def.isInverted && hasValue && (
          <span className="ml-1 text-gray-400">(invertido)</span>
        )}
      </p>
    </div>
  );
}
