"use client";

import {
  IconTarget,
  IconLoader2,
  IconAlertTriangle,
  IconRefresh,
} from "@tabler/icons-react";
import { PDISkillCard } from "./pdi/PDISkillCard";
import { PDIActionTable } from "./pdi/PDIActionTable";
import { usePDI } from "@/features/academy/hooks/use-pdi";
import { Skeleton } from "@/components/ui/skeleton";

export function PDISection() {
  const { data: pdi, isLoading, isError, refetch } = usePDI();

  const mappedSkills = (pdi?.skills ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    category: (s.type === "hard" ? "hard_skill" : "soft_skill") as "hard_skill" | "soft_skill",
    currentLevel: s.currentLevel,
    targetLevel: s.targetLevel,
    timeframe: s.timeframe as "short" | "medium" | "long",
  }));

  const mappedActions = (pdi?.actions ?? []).map((a) => ({
    id: a.id,
    action: a.action,
    competency: "",
    deadline: a.deadline,
    status: (a.status === "done" ? "completed" : a.status) as "pending" | "in_progress" | "completed",
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <IconTarget className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Plano de Desenvolvimento</h2>
        {isLoading && (
          <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isError ? (
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
          <IconAlertTriangle className="h-6 w-6 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            Erro ao carregar PDI
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          >
            <IconRefresh className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border/30 bg-secondary/20 p-5 space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border/30 bg-secondary/20 p-5 space-y-3">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PDISkillCard skills={mappedSkills} />
          <PDIActionTable actions={mappedActions} />
        </div>
      )}
    </div>
  );
}
