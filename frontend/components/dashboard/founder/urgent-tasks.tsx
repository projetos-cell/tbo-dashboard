"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface Props {
  tasks: TaskRow[];
}

export function UrgentTasks({ tasks }: Props) {
  const now = new Date().toISOString().split("T")[0];

  const urgent = tasks
    .filter(
      (t) =>
        !t.is_completed &&
        t.status !== "cancelada" &&
        (t.priority === "urgente" ||
          t.priority === "alta" ||
          (t.due_date && t.due_date <= now))
    )
    .sort((a, b) => {
      const aOverdue = a.due_date && a.due_date < now ? 0 : 1;
      const bOverdue = b.due_date && b.due_date < now ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      const priSort = TASK_PRIORITY as Record<string, { sort: number }>;
      const aPri = priSort[a.priority ?? ""]?.sort ?? 99;
      const bPri = priSort[b.priority ?? ""]?.sort ?? 99;
      return aPri - bPri;
    })
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Tarefas Urgentes ({urgent.length})
        </CardTitle>
        <Link
          href="/tarefas"
          className="text-sm text-muted-foreground hover:underline"
        >
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        {urgent.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma tarefa urgente
          </p>
        ) : (
          <div className="space-y-2">
            {urgent.map((task) => {
              const statusCfg =
                TASK_STATUS[task.status as keyof typeof TASK_STATUS];
              const priCfg =
                TASK_PRIORITY[task.priority as keyof typeof TASK_PRIORITY];
              const overdue =
                task.due_date &&
                isPast(new Date(task.due_date + "T23:59:59")) &&
                !isToday(new Date(task.due_date + "T23:59:59"));

              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 ${overdue ? "border-red-200 bg-red-50/50" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {statusCfg && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: statusCfg.bg,
                            color: statusCfg.color,
                          }}
                        >
                          {statusCfg.label}
                        </Badge>
                      )}
                      {priCfg && (
                        <span
                          className="text-xs font-medium"
                          style={{ color: priCfg.color }}
                        >
                          {priCfg.label}
                        </span>
                      )}
                      {task.assignee_name && (
                        <span className="text-xs text-muted-foreground">
                          {task.assignee_name}
                        </span>
                      )}
                    </div>
                  </div>
                  {task.due_date && (
                    <span
                      className={`ml-2 whitespace-nowrap text-xs ${overdue ? "font-bold text-red-600" : "text-muted-foreground"}`}
                    >
                      {overdue && "⚠ "}
                      {format(new Date(task.due_date + "T12:00:00"), "dd MMM", {
                        locale: ptBR,
                      })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
