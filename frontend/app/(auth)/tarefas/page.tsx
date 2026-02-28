"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskList } from "@/components/tasks/task-list";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskDetail } from "@/components/tasks/task-detail";
import { TaskForm } from "@/components/tasks/task-form";
import { useTasks } from "@/hooks/use-tasks";
import type { Database } from "@/lib/supabase/types";
import { Plus, LayoutList, Kanban } from "lucide-react";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

export default function TarefasPage() {
  const [view, setView] = useState<"list" | "board">("board");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: tasks, isLoading } = useTasks();

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
          <p className="text-sm text-muted-foreground">
            Gerencie as tarefas da equipe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as "list" | "board")}
          >
            <TabsList>
              <TabsTrigger value="board" className="gap-1.5">
                <Kanban className="h-4 w-4" /> Board
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5">
                <LayoutList className="h-4 w-4" /> Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
      ) : view === "board" ? (
        <TaskBoard tasks={filtered} onSelect={setSelectedTask} />
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
