"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle";
import { TaskFilters } from "@/features/tasks/components/task-filters";
import { TaskList } from "@/features/tasks/components/task-list";
import { TaskCompactList } from "@/features/tasks/components/task-compact-list";
import { TaskBoard } from "@/features/tasks/components/task-board";
import { TaskDetail } from "@/features/tasks/components/task-detail";
import { TaskForm } from "@/features/tasks/components/task-form";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { ErrorState, EmptyState } from "@/components/shared";
import type { Database } from "@/lib/supabase/types";
import { Plus, CheckSquare } from "lucide-react";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

export default function TarefasPage() {
  const [view, setView] = useState<ViewMode>("board");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: tasks, isLoading, error, refetch } = useTasks();

  const filtered = useMemo(() => {
    if (!tasks) return [];
    let result = tasks;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.assignee_name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (priorityFilter) {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    return result;
  }, [tasks, search, statusFilter, priorityFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-sm text-gray-500">
            Gerencie as tarefas da equipe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle value={view} onChange={setView} />
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Nova Tarefa
          </Button>
        </div>
      </div>

      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : !tasks?.length ? (
        <EmptyState
          icon={CheckSquare}
          title="Nenhuma tarefa encontrada"
          description="Crie sua primeira tarefa para organizar o trabalho da equipe."
          cta={{ label: "Nova Tarefa", onClick: () => setShowCreate(true) }}
        />
      ) : view === "board" ? (
        <TaskBoard tasks={filtered} onSelect={setSelectedTask} />
      ) : view === "list" ? (
        <TaskCompactList tasks={filtered} onSelect={setSelectedTask} />
      ) : (
        <TaskList tasks={filtered} onSelect={setSelectedTask} />
      )}

      <TaskDetail
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => {
          if (!open) setSelectedTask(null);
        }}
      />

      <TaskForm open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
