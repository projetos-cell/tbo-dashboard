"use client";

import { cn } from "@/lib/utils";
import { getScoreBarColor, getScoreLabel, COMPETENCY_META } from "@/features/career-paths/utils/career-constants";
import type { CareerLevelCompetency } from "@/features/career-paths/services/career-paths";

interface CareerScorecardProps {
  competencies: CareerLevelCompetency[];
  /** Scores reais da pessoa para comparação (skill_id -> level_percentage) */
  actualScores?: Record<string, number>;
  className?: string;
}

export function CareerScorecard({ competencies, actualScores, className }: CareerScorecardProps) {
  const hard = competencies.filter((c) => c.competency_type === "hard");
  const soft = competencies.filter((c) => c.competency_type === "soft");

  return (
    <div className={cn("space-y-5", className)}>
      {/* Hard skills */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Hard Skills
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {hard.map((c) => (
            <CompetencyItem
              key={c.competency_key}
              competency={c}
              actualScore={actualScores?.[c.competency_key]}
            />
          ))}
        </div>
      </div>

      {/* Soft skills */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Soft Skills
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {soft.map((c) => (
            <CompetencyItem
              key={c.competency_key}
              competency={c}
              actualScore={actualScores?.[c.competency_key]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CompetencyItem({
  competency,
  actualScore,
}: {
  competency: CareerLevelCompetency;
  actualScore?: number;
}) {
  const meta = COMPETENCY_META[competency.competency_key as keyof typeof COMPETENCY_META];
  const expected = competency.expected_score;
  const actual = actualScore;
  const gap = actual !== undefined ? expected - actual : null;

  return (
    <div className="rounded-lg border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{meta?.icon ?? "◆"}</span>
          <span className="text-xs font-medium leading-tight">{competency.competency_name}</span>
        </div>
        <span className="text-xs font-bold tabular-nums">{expected}%</span>
      </div>

      {/* Barra esperada */}
      <div className="space-y-1">
        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", getScoreBarColor(expected))}
            style={{ width: `${expected}%` }}
          />
        </div>
        {actual !== undefined && (
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                gap !== null && gap > 0 ? "bg-red-400" : "bg-emerald-400"
              )}
              style={{ width: `${Math.min(actual, 100)}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{getScoreLabel(expected)}</span>
        {gap !== null && (
          <span
            className={cn(
              "text-[10px] font-medium",
              gap > 0 ? "text-red-500" : "text-emerald-500"
            )}
          >
            {gap > 0 ? `−${gap}%` : `+${Math.abs(gap)}%`}
          </span>
        )}
      </div>
    </div>
  );
}
