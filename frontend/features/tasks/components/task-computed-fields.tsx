"use client";

import { useState } from "react";
import {
  IconMathFunction,
  IconSum,
  IconChevronDown,
  IconChevronUp,
  IconCalendar,
  IconPercentage,
  IconAlertTriangle,
  IconCheckbox,
  IconClock,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { differenceInDays, isPast, isToday } from "date-fns";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface TaskComputedFieldsProps {
  task: TaskRow;
  subtasks: TaskRow[];
}

// ─── Formula fields (P03) ─────────────────────────────

function computeFormulas(task: TaskRow) {
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const now = new Date();

  const daysRemaining = dueDate
    ? differenceInDays(dueDate, now)
    : null;

  const isOverdue = dueDate
    ? !task.is_completed && isPast(dueDate) && !isToday(dueDate)
    : false;

  return { daysRemaining, isOverdue };
}

// ─── Rollup fields (P04) ──────────────────────────────

function computeRollups(subtasks: TaskRow[]) {
  if (subtasks.length === 0) return null;

  const countDone = subtasks.filter((s) => s.is_completed).length;
  const countTotal = subtasks.length;
  const progressPct = Math.round((countDone / countTotal) * 100);

  const estimatedHours = subtasks.reduce((sum, s) => {
    const h = (s as Record<string, unknown>).estimated_hours as number | null;
    return sum + (h ?? 0);
  }, 0);

  const loggedHours = subtasks.reduce((sum, s) => {
    const h = (s as Record<string, unknown>).logged_hours as number | null;
    return sum + (h ?? 0);
  }, 0);

  return { countDone, countTotal, progressPct, estimatedHours, loggedHours };
}

// ─── Component ────────────────────────────────────────

export function TaskComputedFields({ task, subtasks }: TaskComputedFieldsProps) {
  const [collapsed, setCollapsed] = useState(false);
  const formulas = computeFormulas(task);
  const rollups = computeRollups(subtasks);

  const hasFormulas = formulas.daysRemaining !== null;
  const hasRollups = rollups !== null;

  if (!hasFormulas && !hasRollups) return null;

  return (
    <div className="space-y-0">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      >
        {collapsed ? (
          <IconChevronDown className="h-3.5 w-3.5" />
        ) : (
          <IconChevronUp className="h-3.5 w-3.5" />
        )}
        Progresso
      </button>

      {!collapsed && (
        <div className="divide-y divide-border/40 mt-1">
          {/* P03 — Formula: days_remaining */}
          {hasFormulas && (
            <div className="flex items-start gap-3 py-2 min-h-[34px]">
              <div className="flex items-center gap-1.5 w-[120px] shrink-0 mt-0.5">
                <span className="text-muted-foreground">
                  <IconCalendar className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-medium text-muted-foreground">Dias restantes</span>
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    formulas.isOverdue
                      ? "bg-red-50 text-red-600 border-red-200"
                      : formulas.daysRemaining! <= 3
                        ? "bg-amber-50 text-amber-600 border-amber-200"
                        : "bg-blue-50 text-blue-600 border-blue-200",
                  )}
                >
                  <IconMathFunction className="size-2.5 mr-0.5" />
                  {formulas.isOverdue
                    ? `${Math.abs(formulas.daysRemaining!)} dias atrasada`
                    : formulas.daysRemaining === 0
                      ? "Vence hoje"
                      : `${formulas.daysRemaining} dias`}
                </Badge>
                {formulas.isOverdue && (
                  <IconAlertTriangle className="size-3.5 text-red-500" />
                )}
              </div>
            </div>
          )}

          {/* P04 — Rollup: subtask progress */}
          {hasRollups && (
            <>
              <div className="flex items-start gap-3 py-2 min-h-[34px]">
                <div className="flex items-center gap-1.5 w-[120px] shrink-0 mt-0.5">
                  <span className="text-muted-foreground">
                    <IconCheckbox className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Progresso</span>
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-medium gap-1">
                    <IconSum className="size-2.5" />
                    {rollups.countDone}/{rollups.countTotal}
                  </Badge>
                  <div className="flex items-center gap-1.5 flex-1 max-w-[120px]">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          rollups.progressPct === 100 ? "bg-green-500" : "bg-blue-400",
                        )}
                        style={{ width: `${rollups.progressPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] tabular-nums text-muted-foreground">{rollups.progressPct}%</span>
                  </div>
                </div>
              </div>

              {/* P04 — Rollup: hours sum */}
              {(rollups.estimatedHours > 0 || rollups.loggedHours > 0) && (
                <div className="flex items-start gap-3 py-2 min-h-[34px]">
                  <div className="flex items-center gap-1.5 w-[120px] shrink-0 mt-0.5">
                    <span className="text-muted-foreground">
                      <IconClock className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">Horas totais</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs font-medium gap-1">
                          <IconSum className="size-2.5" />
                          {rollups.loggedHours > 0
                            ? `${rollups.loggedHours}h / ${rollups.estimatedHours}h`
                            : `${rollups.estimatedHours}h est.`}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        Soma das subtarefas: {rollups.loggedHours}h registradas, {rollups.estimatedHours}h estimadas
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
