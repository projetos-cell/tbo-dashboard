"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TaskDetail } from "@/features/tasks/components/task-detail";
import { TaskForm } from "@/features/tasks/components/task-form";
import { MyTasksListView } from "@/features/tasks/components/my-tasks-list-view";
import { MyTasksBoardView } from "@/features/tasks/components/my-tasks-board-view";
import {
  useMyTasks,
  useMyTasksSections,
  useMyTasksRealtime,
  useMyTasksPreferences,
  useUpdateMyTasksPreferences,
} from "@/features/tasks/hooks/use-my-tasks";
import { ErrorState, EmptyState } from "@/components/shared";
import type { Database } from "@/lib/supabase/types";
import { Plus, CheckSquare, Kanban, List, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];
type ViewMode = "list" | "board" | "calendar";

const VIEWS = [
  { value: "list" as const, icon: List, label: "Lista" },
  { value: "board" as const, icon: Kanban, label: "Board" },
  { value: "calendar" as const, icon: CalendarDays, label: "Calendário" },
] as const;

export default function MinhasTarefasPage() {
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Preferences (persisted per user)
  const { data: prefs } = useMyTasksPreferences();
  const updatePrefs = useUpdateMyTasksPreferences();

  const viewMode: ViewMode = (prefs?.view_mode as ViewMode) ?? "list";
  const showCompleted = prefs?.show_completed ?? false;

  const setViewMode = (mode: ViewMode) => {
    updatePrefs.mutate({ view_mode: mode });
  };
  const setShowCompleted = (show: boolean) => {
    updatePrefs.mutate({ show_completed: show });
  };

  // Data
  const { data: tasks, isLoading, error, refetch } = useMyTasks(showCompleted);
  const { data: sections } = useMyTasksSections();

  // Realtime subscription
  useMyTasksRealtime();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Minhas Tarefas</h1>
          <p className="text-sm text-gray-500">
            Organize e acompanhe suas tarefas pessoais
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Show completed toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="show-completed"
              checked={showCompleted}
              onCheckedChange={setShowCompleted}
            />
            <Label htmlFor="show-completed" className="text-xs text-gray-500">
              Concluídas
            </Label>
          </div>

          {/* View toggle */}
          <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
            {VIEWS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setViewMode(value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  viewMode === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : !tasks?.length && !sections?.length ? (
        <EmptyState
          icon={CheckSquare}
          title="Nenhuma tarefa atribuída"
          description="Quando tarefas forem atribuídas a você, elas aparecerão aqui organizadas em seções."
          cta={{
            label: "Nova Tarefa",
            onClick: () => setShowCreate(true),
          }}
        />
      ) : viewMode === "list" ? (
        <MyTasksListView
          tasks={tasks ?? []}
          onSelect={setSelectedTask}
        />
      ) : viewMode === "board" ? (
        <MyTasksBoardView
          tasks={tasks ?? []}
          onSelect={setSelectedTask}
        />
      ) : (
        // Calendar view placeholder
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              Visão calendário em breve
            </p>
          </div>
        </div>
      )}

      {/* Task Detail */}
      <TaskDetail
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => {
          if (!open) setSelectedTask(null);
        }}
      />

      {/* Task Form */}
      <TaskForm open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
