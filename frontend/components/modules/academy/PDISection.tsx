"use client";

import { IconTarget, IconLoader2 } from "@tabler/icons-react";
import { PDISkillCard } from "./pdi/PDISkillCard";
import { PDIActionTable } from "./pdi/PDIActionTable";
import { usePDI } from "@/features/academy/hooks/use-pdi";

export function PDISection() {
  const { data: pdi, isLoading } = usePDI();

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PDISkillCard skills={mappedSkills} />
        <PDIActionTable actions={mappedActions} />
      </div>
    </div>
  );
}
