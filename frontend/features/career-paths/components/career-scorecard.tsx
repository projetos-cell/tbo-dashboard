"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getScoreBarColor, getScoreLabel, COMPETENCY_META } from "@/features/career-paths/utils/career-constants";
import type { CareerLevelCompetency } from "@/features/career-paths/services/career-paths";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
};

interface CareerScorecardProps {
  competencies: CareerLevelCompetency[];
  actualScores?: Record<string, number>;
  className?: string;
}

export function CareerScorecard({ competencies, actualScores, className }: CareerScorecardProps) {
  const hard = competencies.filter((c) => c.competency_type === "hard");
  const soft = competencies.filter((c) => c.competency_type === "soft");

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("space-y-5", className)}>
        {/* Hard skills */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Hard Skills
          </p>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
          >
            {hard.map((c) => (
              <motion.div key={c.competency_key} variants={fadeUp}>
                <CompetencyItem
                  competency={c}
                  actualScore={actualScores?.[c.competency_key]}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Soft skills */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Soft Skills
          </p>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
          >
            {soft.map((c) => (
              <motion.div key={c.competency_key} variants={fadeUp}>
                <CompetencyItem
                  competency={c}
                  actualScore={actualScores?.[c.competency_key]}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
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

  const card = (
    <div className="rounded-lg border bg-card p-3 space-y-2 transition-colors hover:bg-muted/20">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{meta?.icon ?? "◆"}</span>
          <span className="text-xs font-medium leading-tight">{competency.competency_name}</span>
        </div>
        <span className="text-xs font-bold tabular-nums">{expected}%</span>
      </div>

      {/* Barra esperada — animada */}
      <div className="space-y-1">
        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${expected}%` }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className={cn("h-full rounded-full", getScoreBarColor(expected))}
          />
        </div>
        {actual !== undefined && (
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(actual, 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              className={cn(
                "h-full rounded-full",
                gap !== null && gap > 0 ? "bg-red-400" : "bg-emerald-400"
              )}
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

  // Tooltip com descrição se disponível
  if (competency.description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {competency.description}
        </TooltipContent>
      </Tooltip>
    );
  }

  return card;
}
