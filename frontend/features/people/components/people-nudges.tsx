"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconBulb,
  IconMessage,
  IconTarget,
  IconTrendingDown,
  IconFlame,
  IconArrowRight,
} from "@tabler/icons-react";
import type { PeopleNudgeCounts } from "@/features/people/services/people";
import type { PeopleKPIPreset } from "@/features/people/utils/people-filters";

// ---------------------------------------------------------------------------
// Nudge definitions — deterministic rules (Fase 5)
// ---------------------------------------------------------------------------

interface NudgeConfig {
  id: PeopleKPIPreset;
  countKey: keyof PeopleNudgeCounts;
  label: (n: number) => string;
  cta: string;
  icon: React.ElementType;
  /** Tailwind classes for the icon background circle */
  iconBg: string;
  /** Tailwind classes for the icon color */
  iconColor: string;
}

const NUDGE_CONFIGS: NudgeConfig[] = [
  {
    id: "pending_1on1",
    countKey: "pending_1on1",
    label: (n) =>
      n === 1 ? "1 pessoa precisa de 1:1" : `${n} pessoas precisam de 1:1`,
    cta: "Ver pessoas",
    icon: IconMessage,
    iconBg: "bg-orange-100 dark:bg-orange-950",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    id: "stale_pdi",
    countKey: "stale_pdi",
    label: (n) =>
      n === 1
        ? "1 PDI precisa atualização"
        : `${n} PDIs precisam atualização`,
    cta: "Ver PDIs",
    icon: IconTarget,
    iconBg: "bg-amber-100 dark:bg-amber-950",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "critical_score",
    countKey: "critical_score",
    label: (n) =>
      n === 1
        ? "1 pessoa com score crítico"
        : `${n} pessoas com score crítico`,
    cta: "Ver pessoas",
    icon: IconTrendingDown,
    iconBg: "bg-red-100 dark:bg-red-950",
    iconColor: "text-red-600 dark:text-red-400",
  },
  {
    id: "overloaded",
    countKey: "overloaded",
    label: (n) =>
      n === 1
        ? "1 pessoa sobrecarregada"
        : `${n} pessoas sobrecarregadas`,
    cta: "Ver pessoas",
    icon: IconFlame,
    iconBg: "bg-rose-100 dark:bg-rose-950",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PeopleNudgesProps {
  counts: PeopleNudgeCounts;
  isLoading?: boolean;
  onNudgeClick: (kpiPreset: PeopleKPIPreset) => void;
}

export function PeopleNudges({
  counts,
  isLoading,
  onNudgeClick,
}: PeopleNudgesProps) {
  // Filter to only nudges with count > 0
  const activeNudges = NUDGE_CONFIGS.filter(
    (cfg) => counts[cfg.countKey] > 0
  );

  // Nothing to show — all green
  if (!isLoading && activeNudges.length === 0) return null;

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-100" />
            <div className="h-5 w-36 animate-pulse rounded bg-gray-100" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-gray-100/50"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <IconBulb className="h-5 w-5 text-amber-500" />
          Ações sugeridas hoje
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {activeNudges.map((cfg) => {
            const count = counts[cfg.countKey];
            const Icon = cfg.icon;

            return (
              <div
                key={cfg.id}
                className="flex items-center gap-3 rounded-lg border bg-white p-3 transition-colors hover:bg-gray-100/50"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cfg.iconBg}`}
                >
                  <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">
                    {cfg.label(count)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => onNudgeClick(cfg.id)}
                >
                  {cfg.cta}
                  <IconArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
