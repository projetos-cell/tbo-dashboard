"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TaskDetailSheet } from "@/features/tasks/components/task-detail-sheet";
import { TaskForm } from "@/features/tasks/components/task-form";
import { MyTasksListView } from "@/features/tasks/components/my-tasks-list-view";
import { MyTasksBoardView } from "@/features/tasks/components/my-tasks-board-view";
import { MyTasksCalendarView } from "@/features/tasks/components/my-tasks-calendar-view";
import { MyTasksToolbar } from "@/features/tasks/components/my-tasks-toolbar";
import { MyTasksColumnConfig } from "@/features/tasks/components/my-tasks-column-config";
import {
  useMyTasks,
  useMyTasksSections,
  useMyTasksRealtime,
  useMyTasksPreferences,
  useUpdateMyTasksPreferences,
} from "@/features/tasks/hooks/use-my-tasks";
import { useTaskDetailParam } from "@/features/tasks/hooks/use-task-detail";
import {
  resolveColumns,
  getVisibleColumns,
  MY_TASKS_COLUMNS,
  type ColumnPref,
} from "@/features/tasks/lib/my-tasks-columns";
import { ErrorState, EmptyState } from "@/components/shared";
import type { Database } from "@/lib/supabase/types";
import {
  IconPlus,
  IconSquareCheck,
  IconLayoutKanban,
  IconList,
  IconCalendar,
  IconCalendarDue,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];
type ViewMode = "list" | "board" | "calendar";

const VIEWS = [
  { value: "list" as const, icon: IconList, label: "Lista" },
  { value: "board" as const, icon: IconLayoutKanban, label: "Board" },
  { value: "calendar" as const, icon: IconCalendar, label: "Calendário" },
] as const;

export default function MinhasTarefasPage() {
  return (
    <Suspense fallback={<div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-10 w-full" />))}</div>}>
      <MinhasTarefasContent />
    </Suspense>
  );
}

function MinhasTarefasContent() {
  const { taskId, openTask, closeTask } = useTaskDetailParam();
  const [showCreate, setShowCreate] = useState(false);

  // Wrapper: list/board views call onSelect with TaskRow, we extract the id
  const handleSelectTask = useCallback(
    (task: TaskRow) => openTask(task.id),
    [openTask]
  );

  // Preferences (persisted per user)
  const { data: prefs } = useMyTasksPreferences();
  const updatePrefs = useUpdateMyTasksPreferences();

  const viewMode: ViewMode = (prefs?.view_mode as ViewMode) ?? "list";
  const showCompleted = prefs?.show_completed ?? false;
  const sortBy = prefs?.sort_by ?? "manual";
  const sortDirection = (prefs?.sort_direction as "asc" | "desc") ?? "asc";
  const groupBy = prefs?.group_by ?? "section";
  const filters = (prefs?.filters as Record<string, unknown>) ?? {};
  const columnPrefs = (prefs?.columns as ColumnPref[] | undefined) ?? [];

  const setViewMode = (mode: ViewMode) => {
    updatePrefs.mutate({ view_mode: mode });
  };
  const setShowCompleted = (show: boolean) => {
    updatePrefs.mutate({ show_completed: show });
  };

  // Resolve columns from prefs
  const allColumns = useMemo(
    () => resolveColumns(columnPrefs, MY_TASKS_COLUMNS),
    [columnPrefs]
  );
  const visibleColumns = useMemo(
    () => getVisibleColumns(allColumns, columnPrefs),
    [allColumns, columnPrefs]
  );

  // Column resize handler
  const handleResizeColumn = useCallback(
    (columnId: string, width: number) => {
      const existing = columnPrefs.length > 0 ? [...columnPrefs] : allColumns.map((c) => ({
        id: c.id,
        visible: true,
        width: c.width,
      }));

      const idx = existing.findIndex((p) => p.id === columnId);
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], width };
      }
      updatePrefs.mutate({ columns: existing });
    },
    [columnPrefs, allColumns, updatePrefs]
  );

  // Sort handler
  const handleSort = useCallback(
    (newSortBy: string, direction: "asc" | "desc") => {
      updatePrefs.mutate({ sort_by: newSortBy, sort_direction: direction });
    },
    [updatePrefs]
  );

  // Column reorder handler (from header DnD)
  const handleReorderColumns = useCallback(
    (reordered: typeof allColumns) => {
      const newPrefs: ColumnPref[] = reordered.map((c) => ({
        id: c.id,
        visible: true,
        width: c.width,
      }));
      updatePrefs.mutate({ columns: newPrefs });
    },
    [updatePrefs]
  );

  // Column config handler
  const handleColumnUpdate = useCallback(
    (prefs: ColumnPref[]) => {
      updatePrefs.mutate({ columns: prefs });
    },
    [updatePrefs]
  );

  // Toolbar update handler
  const handleToolbarUpdate = useCallback(
    (updates: Record<string, unknown>) => {
      updatePrefs.mutate(updates);
    },
    [updatePrefs]
  );

  // Data
  const { data: tasks, isLoading, error, refetch } = useMyTasks(showCompleted);
  const { data: sections } = useMyTasksSections();

  // Realtime subscription
  useMyTasksRealtime();

  return (
    <div className="space-y-4">
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
            <IconPlus className="mr-1.5 h-4 w-4" /> Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Quick group chips (V06) */}
      {viewMode === "list" && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleToolbarUpdate({ group_by: "due_date", sort_by: "due_date", sort_direction: "asc" })}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              groupBy === "due_date"
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <IconCalendarDue className="size-3.5" />
            Por prazo
          </button>
          <button
            type="button"
            onClick={() => handleToolbarUpdate({ group_by: "section", sort_by: "manual", sort_direction: "asc" })}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              groupBy === "section"
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <IconList className="size-3.5" />
            Por seção
          </button>
          <button
            type="button"
            onClick={() => handleToolbarUpdate({ group_by: "project_id", sort_by: "due_date", sort_direction: "asc" })}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              groupBy === "project_id"
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            Por projeto
          </button>
        </div>
      )}

      {/* Toolbar — Sort / Filter / Group / Columns */}
      {viewMode === "list" && (
        <div className="flex items-center gap-1 border-b pb-2">
          <MyTasksToolbar
            sortBy={sortBy}
            sortDirection={sortDirection}
            groupBy={groupBy}
            filters={filters}
            onUpdate={handleToolbarUpdate}
          />
          <div className="h-4 w-px bg-border mx-1" />
          <MyTasksColumnConfig
            columns={allColumns}
            columnPrefs={columnPrefs}
            onUpdate={handleColumnUpdate}
          />
        </div>
      )}

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
          icon={IconSquareCheck}
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
          columns={visibleColumns}
          sortBy={sortBy}
          sortDirection={sortDirection}
          groupBy={groupBy}
          filters={filters}
          onSelect={handleSelectTask}
          onSort={handleSort}
          onResizeColumn={handleResizeColumn}
          onReorderColumns={handleReorderColumns}
        />
      ) : viewMode === "board" ? (
        <MyTasksBoardView
          tasks={tasks ?? []}
          onSelect={handleSelectTask}
        />
      ) : (
        <MyTasksCalendarView
          tasks={tasks ?? []}
          onSelect={handleSelectTask}
        />
      )}

      {/* Task Detail Sheet (F02 — read-only panel with URL sync) */}
      <TaskDetailSheet
        taskId={taskId}
        open={!!taskId}
        onClose={closeTask}
      />

      {/* Task Form */}
      <TaskForm open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
