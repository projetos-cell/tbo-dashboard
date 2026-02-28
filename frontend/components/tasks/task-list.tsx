"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { useUpdateTask } from "@/hooks/use-tasks";
import { useTablePreferences } from "@/hooks/use-table-preferences";
import type { ColumnDef } from "@/lib/column-types";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Circle } from "lucide-react";
import { useMemo, useCallback } from "react";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

const TABLE_ID = "tarefas";

interface TaskListProps {
  tasks: TaskRow[];
  onSelect: (task: TaskRow) => void;
}

export function TaskList({ tasks, onSelect }: TaskListProps) {
  const updateTask = useUpdateTask();
  const { prefs, save, reset } = useTablePreferences(TABLE_ID);

  const toggleComplete = useCallback(
    (task: TaskRow, e: React.MouseEvent) => {
      e.stopPropagation();
      updateTask.mutate({
        id: task.id,
        updates: {
          status: task.is_completed ? "pendente" : "concluida",
          is_completed: !task.is_completed,
        },
      });
    },
    [updateTask]
  );

  const columnDefs: ColumnDef<TaskRow>[] = useMemo(
    () => [
      {
        id: "check",
        label: "",
        width: "w-10",
        hideable: false,
        reorderable: false,
        cellRender: (row) => (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={(e) => toggleComplete(row, e)}
          >
            {row.is_completed ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        ),
      },
      {
        id: "title",
        label: "Titulo",
        hideable: false,
        cellRender: (row) => (
          <span className={row.is_completed ? "line-through opacity-60" : ""}>
            {row.title}
          </span>
        ),
      },
      {
        id: "status",
        label: "Status",
        responsive: "md" as const,
        cellRender: (row) => {
          const statusCfg = TASK_STATUS[row.status as keyof typeof TASK_STATUS];
          return statusCfg ? (
            <Badge
              variant="secondary"
              className="text-xs"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
            >
              {statusCfg.label}
            </Badge>
          ) : null;
        },
      },
      {
        id: "priority",
        label: "Prioridade",
        responsive: "md" as const,
        cellRender: (row) => {
          const priCfg = TASK_PRIORITY[row.priority as keyof typeof TASK_PRIORITY];
          return priCfg ? (
            <span className="text-xs font-medium" style={{ color: priCfg.color }}>
              {priCfg.label}
            </span>
          ) : null;
        },
      },
      {
        id: "assignee",
        label: "Responsavel",
        responsive: "lg" as const,
        cellRender: (row) => (
          <span className="text-sm text-muted-foreground">
            {row.assignee_name ?? "—"}
          </span>
        ),
      },
      {
        id: "due_date",
        label: "Prazo",
        responsive: "lg" as const,
        cellRender: (row) => {
          const overdue =
            row.due_date &&
            !row.is_completed &&
            row.due_date < new Date().toISOString().split("T")[0];
          return row.due_date ? (
            <span
              className={`text-sm ${overdue ? "font-medium text-red-600" : "text-muted-foreground"}`}
            >
              {format(new Date(row.due_date + "T12:00:00"), "dd MMM yyyy", {
                locale: ptBR,
              })}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
    ],
    [toggleComplete]
  );

  return (
    <DataTable
      tableId={TABLE_ID}
      columnDefs={columnDefs}
      data={tasks}
      rowKey={(row) => row.id}
      savedPrefs={prefs}
      onPrefsChange={save}
      onPrefsReset={reset}
      onRowClick={onSelect}
      emptyMessage="Nenhuma tarefa encontrada"
    />
  );
}
