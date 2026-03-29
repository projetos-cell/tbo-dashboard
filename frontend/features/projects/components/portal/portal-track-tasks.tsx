"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconCheck, IconClock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

type TaskFilter = "all" | "active" | "completed";

interface PortalTrackTasksProps {
  tasks: TaskRow[];
  sections?: { id: string; title: string; color: string | null }[];
}

const PRIORITY_COLORS: Record<string, string> = {
  urgente: "#ef4444",
  alta: "#f59e0b",
  media: "#3b82f6",
  baixa: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  em_andamento: "Em Andamento",
  revisao: "Revisao",
  concluida: "Concluida",
  a_fazer: "A Fazer",
  bloqueada: "Bloqueada",
};

export function PortalTrackTasks({ tasks, sections = [] }: PortalTrackTasksProps) {
  const [filter, setFilter] = useState<TaskFilter>("all");

  const parentTasks = useMemo(
    () => tasks.filter((t) => !t.parent_id),
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    let filtered = parentTasks;
    if (filter === "active") {
      filtered = filtered.filter((t) => !t.is_completed);
    } else if (filter === "completed") {
      filtered = filtered.filter((t) => t.is_completed);
    }
    return filtered
      .sort((a, b) => {
        // Incomplete first, then by priority, then by due date
        if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
        const priorities = ["urgente", "alta", "media", "baixa"];
        const aPri = priorities.indexOf(a.priority ?? "baixa");
        const bPri = priorities.indexOf(b.priority ?? "baixa");
        if (aPri !== bPri) return aPri - bPri;
        if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return 0;
      })
      .slice(0, 25);
  }, [parentTasks, filter]);

  const sectionMap = useMemo(() => {
    const map = new Map<string, { title: string; color: string | null }>();
    for (const s of sections) {
      map.set(s.id, { title: s.title, color: s.color });
    }
    return map;
  }, [sections]);

  const counts = useMemo(() => {
    const total = parentTasks.length;
    const completed = parentTasks.filter((t) => t.is_completed).length;
    const active = total - completed;
    return { total, completed, active };
  }, [parentTasks]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Tasks</CardTitle>
          <div className="flex items-center gap-1">
            {(["all", "active", "completed"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => setFilter(f)}
              >
                {f === "all"
                  ? `Todas (${counts.total})`
                  : f === "active"
                    ? `Ativas (${counts.active})`
                    : `Concluidas (${counts.completed})`}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {filteredTasks.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhuma task encontrada
          </p>
        ) : (
          filteredTasks.map((task) => {
            const section = task.section_id
              ? sectionMap.get(task.section_id)
              : null;
            const priorityColor =
              PRIORITY_COLORS[task.priority ?? "baixa"] ?? "#6b7280";
            const dueDate = task.due_date
              ? new Date(task.due_date + "T00:00:00").toLocaleDateString(
                  "pt-BR",
                  { day: "2-digit", month: "short" },
                )
              : null;

            return (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-border/40 px-3 py-2 transition-colors hover:bg-accent/30"
              >
                {/* Priority indicator */}
                <div
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: priorityColor }}
                  title={task.priority ?? "baixa"}
                />

                {/* Section label */}
                {section && (
                  <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </span>
                )}

                {/* Task title */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm",
                      task.is_completed &&
                        "text-muted-foreground line-through",
                    )}
                  >
                    {task.title}
                  </p>
                </div>

                {/* Due date */}
                {dueDate && (
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {dueDate}
                  </span>
                )}

                {/* Status */}
                {task.is_completed ? (
                  <IconCheck className="size-4 shrink-0 text-green-500" />
                ) : (
                  task.status && (
                    <Badge variant="outline" className="shrink-0 text-[9px]">
                      {STATUS_LABELS[task.status] ?? task.status}
                    </Badge>
                  )
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
