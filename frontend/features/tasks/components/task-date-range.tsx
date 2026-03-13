"use client";

import { useCallback } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { TaskDatePicker } from "./task-date-picker";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

// ─── Helpers ──────────────────────────────────────────────────

function getDateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.split("T")[0];
}

function compareDates(a: string, b: string): number {
  const da = getDateOnly(a)!;
  const db = getDateOnly(b)!;
  if (da < db) return -1;
  if (da > db) return 1;
  return 0;
}

// ─── Props ────────────────────────────────────────────────────

interface TaskDateRangeProps {
  task: TaskRow;
}

// ─── Component ────────────────────────────────────────────────

export function TaskDateRange({ task }: TaskDateRangeProps) {
  const { mutate: updateTask } = useUpdateTask();
  const today = new Date().toISOString().split("T")[0];

  // ── Status flags
  const dueOnly = getDateOnly(task.due_date);
  const isOverdue = !task.is_completed && dueOnly !== null && dueOnly < today;
  const isDueToday = dueOnly !== null && dueOnly === today && !task.is_completed;

  // ── Cross-validation: due_date must not be before start_date
  const startOnly = getDateOnly(task.start_date);
  const hasCrossError =
    startOnly !== null &&
    dueOnly !== null &&
    compareDates(dueOnly, startOnly) < 0;

  // ── Handlers — each field saves independently with optimistic update
  const handleStartDateChange = useCallback(
    (value: string | null) => {
      updateTask({
        id: task.id,
        updates: { start_date: value },
        previousTask: task,
      });
    },
    [task, updateTask]
  );

  const handleDueDateChange = useCallback(
    (value: string | null) => {
      updateTask({
        id: task.id,
        updates: { due_date: value },
        previousTask: task,
      });
    },
    [task, updateTask]
  );

  return (
    <div className="space-y-3">
      {/* Início */}
      <TaskDatePicker
        label="Início"
        value={task.start_date}
        onChange={handleStartDateChange}
        placeholder="Definir início"
      />

      {/* Prazo */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <TaskDatePicker
            label="Prazo"
            value={task.due_date}
            onChange={handleDueDateChange}
            placeholder="Definir prazo"
            overdue={isOverdue}
          />
          {isOverdue && (
            <Badge
              variant="destructive"
              className="text-[10px] px-1.5 py-0 h-4 shrink-0"
            >
              Atrasada
            </Badge>
          )}
          {isDueToday && !isOverdue && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 shrink-0 border-yellow-400 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-600"
            >
              Vence hoje
            </Badge>
          )}
        </div>
        {hasCrossError && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <IconAlertTriangle className="h-3 w-3 shrink-0" />
            Prazo deve ser posterior à data de início
          </p>
        )}
      </div>
    </div>
  );
}
