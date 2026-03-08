"use client";

import {
  Columns3,
  Repeat,
  Shield,
  Award,
  Heart,
  FileText,
  BookOpen,
  Gift,
} from "lucide-react";
import { Card, CardContent } from "@/components/tbo-ui/card";
import { Skeleton } from "@/components/tbo-ui/skeleton";
import {
  CULTURA_CATEGORIES,
  type CulturaCategoryKey,
} from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  pilar: Columns3,
  ritual: Repeat,
  politica: Shield,
  reconhecimento: Award,
  valor: Heart,
  documento: FileText,
  manual: BookOpen,
};

interface CulturaOverviewStatsProps {
  items?: CulturaRow[];
  isLoading?: boolean;
  recognitionCount?: number;
  ritualCount?: number;
  rewardsCount?: number;
}

export function CulturaOverviewStats({
  items,
  isLoading,
  recognitionCount,
  ritualCount,
  rewardsCount,
}: CulturaOverviewStatsProps) {
  const counts = (items || []).reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  // Override with specialized table counts
  if (recognitionCount !== undefined) counts["reconhecimento"] = recognitionCount;
  if (ritualCount !== undefined) counts["ritual"] = ritualCount;

  const categories = Object.entries(CULTURA_CATEGORIES) as [
    CulturaCategoryKey,
    (typeof CULTURA_CATEGORIES)[CulturaCategoryKey],
  ][];

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  const statsCards = [
    ...categories.map(([key, def]) => ({
      key,
      icon: CATEGORY_ICONS[key] || FileText,
      count: counts[key] || 0,
      label: def.label,
      color: def.color,
      bg: def.bg,
    })),
    ...(rewardsCount !== undefined
      ? [{ key: "recompensas", icon: Gift, count: rewardsCount, label: "Recompensas", color: "#ec4899", bg: "rgba(236,72,153,0.12)" }]
      : []),
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat) => (
        <Card key={stat.key}>
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <div
              className="rounded-lg p-2"
              style={{ backgroundColor: stat.bg }}
            >
              <stat.icon className="size-4" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.count}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
