"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  IconLayoutGrid,
  IconEye,
  IconCircleCheck,
  IconPackage,
} from "@tabler/icons-react";
import type { ReviewProject } from "@/features/review/types";

interface ReviewKpiCardsProps {
  projects: ReviewProject[];
}

export function ReviewKpiCards({ projects }: ReviewKpiCardsProps) {
  const total = projects.length;
  const emReview = projects.filter((p) => p.workflow_stage === "client_review" || p.workflow_stage === "internal_preview").length;
  const aprovados = projects.filter((p) => p.workflow_stage === "final_approval").length;
  const entregues = projects.filter((p) => p.workflow_stage === "delivered").length;

  const cards = [
    { label: "Total Projetos", value: total, icon: IconLayoutGrid, color: "#6b7280" },
    { label: "Em Review", value: emReview, icon: IconEye, color: "#f97316" },
    { label: "Aprovados", value: aprovados, icon: IconCircleCheck, color: "#22c55e" },
    { label: "Entregues", value: entregues, icon: IconPackage, color: "#06b6d4" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card
            key={c.label}
            className="border-border/50 transition-shadow hover:shadow-sm"
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${c.color}22` }}
              >
                <Icon className="h-5 w-5" style={{ color: c.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tracking-tight">{c.value}</p>
                <p className="truncate text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
