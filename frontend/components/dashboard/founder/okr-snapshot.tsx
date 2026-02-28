"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { OkrSnapshot } from "@/services/dashboard";
import { Target } from "lucide-react";

interface Props {
  snapshots: OkrSnapshot[];
}

function getProgressColor(progress: number) {
  if (progress >= 70) return "text-green-600";
  if (progress >= 40) return "text-amber-600";
  return "text-red-600";
}

function getProgressBg(progress: number) {
  if (progress >= 70) return "[&>div]:bg-green-500";
  if (progress >= 40) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
}

export function OkrSnapshotCard({ snapshots }: Props) {
  const avgProgress =
    snapshots.length > 0
      ? Math.round(
          snapshots.reduce((sum, s) => sum + s.progress, 0) / snapshots.length
        )
      : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Target className="h-4 w-4 text-purple-500" />
          OKRs Ciclo Ativo
        </CardTitle>
        <Link
          href="/okrs"
          className="text-sm text-muted-foreground hover:underline"
        >
          Ver OKRs
        </Link>
      </CardHeader>
      <CardContent>
        {snapshots.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum ciclo OKR ativo
          </p>
        ) : (
          <div className="space-y-4">
            {/* Overall progress */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Progresso geral do ciclo
                </p>
                <p className={`text-2xl font-bold ${getProgressColor(avgProgress)}`}>
                  {avgProgress}%
                </p>
              </div>
              <Badge variant="secondary">
                {snapshots.length} objetivo{snapshots.length !== 1 && "s"}
              </Badge>
            </div>

            {/* Individual objectives */}
            <div className="space-y-3">
              {snapshots.map((snap) => (
                <div key={snap.objectiveId} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium">
                      {snap.objectiveTitle}
                    </p>
                    <span
                      className={`text-sm font-bold ${getProgressColor(snap.progress)}`}
                    >
                      {snap.progress}%
                    </span>
                  </div>
                  <Progress
                    value={snap.progress}
                    className={`h-1.5 ${getProgressBg(snap.progress)}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {snap.keyResultsCompleted}/{snap.keyResultsCount} KRs
                    concluidos
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
