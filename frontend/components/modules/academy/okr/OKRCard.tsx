"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { IconChevronRight } from "@tabler/icons-react";

interface KeyResult {
  id: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
}

interface OKRCardProps {
  objectiveId: string;
  objective: string;
  ownerName: string;
  deadline: string;
  keyResults: KeyResult[];
}

export function OKRCard({
  objectiveId,
  objective,
  ownerName,
  deadline,
  keyResults,
}: OKRCardProps) {
  const overallProgress =
    keyResults.length > 0
      ? Math.round(
          keyResults.reduce(
            (sum, kr) =>
              sum + Math.min((kr.currentValue / kr.targetValue) * 100, 100),
            0
          ) / keyResults.length
        )
      : 0;

  return (
    <Link
      href={`/okrs/individuais?objective=${objectiveId}`}
      className="group block rounded-2xl border border-border/30 bg-secondary/20 p-6 backdrop-blur-sm transition-colors hover:border-primary/20 hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
    >
      <div className="mb-4 flex items-start justify-between">
        <h4 className="font-semibold group-hover:text-primary transition-colors">
          {objective}
        </h4>
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-sm font-bold text-primary">
            {overallProgress}%
          </span>
          <IconChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>

      <div className="mb-4 space-y-3">
        {keyResults.map((kr) => {
          const pct = Math.round(
            Math.min((kr.currentValue / kr.targetValue) * 100, 100)
          );
          return (
            <div key={kr.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {kr.description}
                </span>
                <span className="font-medium">{pct}%</span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{ownerName}</span>
        <span>
          {deadline
            ? new Date(deadline).toLocaleDateString("pt-BR", {
                month: "short",
                year: "numeric",
              })
            : ""}
        </span>
      </div>
    </Link>
  );
}
