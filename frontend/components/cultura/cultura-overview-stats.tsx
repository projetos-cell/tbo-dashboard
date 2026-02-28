"use client";

import {
  Columns3,
  Repeat,
  Shield,
  Award,
  Heart,
  FileText,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
}

export function CulturaOverviewStats({
  items,
  isLoading,
}: CulturaOverviewStatsProps) {
  const counts = (items || []).reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

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

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map(([key, def]) => {
        const Icon = CATEGORY_ICONS[key] || FileText;
        const count = counts[key] || 0;
        return (
          <Card key={key}>
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: def.bg }}
              >
                <Icon className="size-4" style={{ color: def.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{def.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
