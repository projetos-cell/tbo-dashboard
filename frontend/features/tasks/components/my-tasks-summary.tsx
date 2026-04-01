"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";

interface MyTasksSummaryProps {
  tasks: MyTaskWithSection[];
}

interface KpiPillProps {
  label: string;
  value: number;
  variant?: "default" | "destructive" | "warning" | "success";
}

const VARIANT_STYLES: Record<NonNullable<KpiPillProps["variant"]>, string> = {
  default: "text-foreground bg-muted/60",
  destructive: "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/30",
  warning: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30",
  success: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30",
};

function KpiPill({ label, value, variant = "default" }: KpiPillProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums",
        VARIANT_STYLES[variant]
      )}
    >
      <span className="font-semibold">{value}</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}

export function MyTasksSummary({ tasks }: MyTasksSummaryProps) {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    let pending = 0;
    let overdue = 0;
    let dueToday = 0;
    let completedToday = 0;

    for (const t of tasks) {
      if (!t.is_completed) {
        pending++;
        if (t.due_date && t.due_date < today) overdue++;
        if (t.due_date === today) dueToday++;
      }
      if (
        t.is_completed &&
        t.completed_at &&
        t.completed_at.startsWith(today)
      ) {
        completedToday++;
      }
    }

    return { pending, overdue, dueToday, completedToday };
  }, [tasks]);

  return (
    <div className="flex items-center gap-2">
      <KpiPill label="pendentes" value={stats.pending} />
      {stats.overdue > 0 && (
        <KpiPill label="atrasadas" value={stats.overdue} variant="destructive" />
      )}
      {stats.dueToday > 0 && (
        <KpiPill label="p/ hoje" value={stats.dueToday} variant="warning" />
      )}
      {stats.completedToday > 0 && (
        <KpiPill
          label="concluídas hoje"
          value={stats.completedToday}
          variant="success"
        />
      )}
    </div>
  );
}
