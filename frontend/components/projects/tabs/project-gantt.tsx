"use client";

import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface ProjectGanttProps {
  projectId: string;
}

export function ProjectGantt({ projectId }: ProjectGanttProps) {
  const { data: tasks, isLoading } = useTasks({ project_id: projectId });
  const updateTask = useUpdateTask();
  const containerRef = useRef<HTMLDivElement>(null);
  const [ganttInstance, setGanttInstance] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  // Tasks with dates only
  const ganttTasks = (tasks || []).filter(
    (t) => t.start_date || t.due_date
  );

  useEffect(() => {
    if (!containerRef.current || ganttTasks.length === 0) return;

    let mounted = true;

    async function initGantt() {
      try {
        // Dynamic import to avoid SSR issues
        const { default: Gantt } = await import("frappe-gantt");

        if (!mounted || !containerRef.current) return;

        // Clear previous
        containerRef.current.innerHTML = "";

        const frappeData = ganttTasks.map((task) => ({
          id: task.id,
          name: task.title || "Sem titulo",
          start: task.start_date || task.due_date || new Date().toISOString().split("T")[0],
          end: task.due_date || task.start_date || new Date().toISOString().split("T")[0],
          progress: task.is_completed ? 100 : 0,
          custom_class: task.is_completed
            ? "bar-completed"
            : task.priority === "alta" || task.priority === "urgente"
              ? "bar-high"
              : "",
        }));

        const gantt = new Gantt(containerRef.current, frappeData, {
          view_mode: "Week",
          date_format: "YYYY-MM-DD",
          on_date_change: (task: { id: string; _start: Date; _end: Date }) => {
            const startDate = task._start.toISOString().split("T")[0];
            const endDate = task._end.toISOString().split("T")[0];
            updateTask.mutate({
              id: task.id,
              updates: { start_date: startDate, due_date: endDate },
            });
          },
          on_progress_change: (task: { id: string; progress: number }) => {
            updateTask.mutate({
              id: task.id,
              updates: {
                is_completed: task.progress >= 100,
                status: task.progress >= 100 ? "concluida" : "em_andamento",
              },
            });
          },
        });

        setGanttInstance(gantt);
      } catch (err) {
        console.error("Failed to init Gantt:", err);
        setError("Nao foi possivel carregar o Gantt. Verifique as dependencias.");
      }
    }

    initGantt();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ganttTasks.length]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (ganttTasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            Nenhuma tarefa com datas para exibir no Gantt.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Adicione datas de inicio/fim nas tarefas para visualiza-las aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <div ref={containerRef} className="min-h-[300px]" />
      </CardContent>
    </Card>
  );
}
