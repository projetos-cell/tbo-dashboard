"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

export function TasksOverview({ tasks }: { tasks: TaskRow[] }) {
  const now = new Date().toISOString().split("T")[0];

  // Show overdue first, then pending/in progress, sorted by due_date
  const visible = tasks
    .filter((t) => !t.is_completed && t.status !== "cancelada")
    .sort((a, b) => {
      // Overdue first
      const aOverdue = a.due_date && a.due_date < now ? 0 : 1;
      const bOverdue = b.due_date && b.due_date < now ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      // Then by priority
      const priSort = TASK_PRIORITY as Record<string, { sort: number }>;
      const aPri = priSort[a.priority ?? ""]?.sort ?? 99;
      const bPri = priSort[b.priority ?? ""]?.sort ?? 99;
      if (aPri !== bPri) return aPri - bPri;
      // Then by due date
      return (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
    })
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Tarefas Pendentes</CardTitle>
        <Link href="/tarefas" className="text-sm text-muted-foreground hover:underline">
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma tarefa pendente
          </p>
        ) : (
          <div className="space-y-2">
            {visible.map((task) => {
              const statusCfg = TASK_STATUS[task.status as keyof typeof TASK_STATUS];
              const priCfg = TASK_PRIORITY[task.priority as keyof typeof TASK_PRIORITY];
              const overdue = task.due_date && isPast(new Date(task.due_date + "T23:59:59")) && !isToday(new Date(task.due_date + "T23:59:59"));

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {statusCfg && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                        >
                          {statusCfg.label}
                        </Badge>
                      )}
                      {priCfg && (
                        <span className="text-xs" style={{ color: priCfg.color }}>
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
                      className={`ml-2 whitespace-nowrap text-xs ${
                        overdue ? "font-medium text-red-600" : "text-muted-foreground"
                      }`}
                    >
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
