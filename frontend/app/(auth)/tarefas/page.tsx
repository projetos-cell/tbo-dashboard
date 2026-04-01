"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { RequireRole } from "@/features/auth/components/require-role";
import type { Database } from "@/lib/supabase/types";
import {
  IconPlus,
  IconSquareCheck,
  IconLayoutKanban,
  IconList,
  IconCalendar,
} from "@tabler/icons-react";
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
    <RequireRole module="tarefas">
      <Suspense
        fallback={
          <div className="flex flex-col gap-0">
            <div className="flex items-center justify-between py-3 border-b">
              <Skeleton className="h-6 w-36" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-48 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
              </div>
            </div>
            <div className="space-y-px pt-4">
              <Skeleton className="h-8 w-40 mb-2" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        }
      >
        <MinhasTarefasContent />
      </Suspense>
    </RequireRole>
  );
}

function MinhasTarefasContent() {
  const { taskId, openTask, closeTask } = useTaskDetailParam();
  const [showCreate, setShowCreate] = useState(false);

  const handleSelectTask = useCallback(
    (task: TaskRow) => openTask(task.id),
    [openTask]
  );

  // Preferences
  const { data: prefs } = useMyTasksPreferences();
  const updatePrefs = useUpdateMyTasksPreferences();

  const viewMode: ViewMode = (prefs?.view_mode as ViewMode) ?? "list";
  const showCompleted = prefs?.show_completed ?? false;
  const sortBy = prefs?.sort_by ?? "manual";
  const sortDirection = (prefs?.sort_direction as "asc" | "desc") ?? "asc";
  const groupBy = prefs?.group_by ?? "section";
  const filters = (prefs?.filters as Record<string, unknown>) ?? {};
  const columnPrefs = (prefs?.columns as ColumnPref[] | undefined) ?? [];

  const setViewMode = (mode: ViewMode) => updatePrefs.mutate({ view_mode: mode });
  const setShowCompleted = (show: boolean) => updatePrefs.mutate({ show_completed: show });

  const allColumns = useMemo(
    () => resolveColumns(columnPrefs, MY_TASKS_COLUMNS),
    [columnPrefs]
  );
  const visibleColumns = useMemo(
    () => getVisibleColumns(allColumns, columnPrefs),
    [allColumns, columnPrefs]
  );

  const handleResizeColumn = useCallback(
    (columnId: string, width: number) => {
      const existing =
        columnPrefs.length > 0
          ? [...columnPrefs]
          : allColumns.map((c) => ({ id: c.id, visible: true, width: c.width }));
      const idx = existing.findIndex((p) => p.id === columnId);
      if (idx >= 0) existing[idx] = { ...existing[idx], width };
      updatePrefs.mutate({ columns: existing });
    },
    [columnPrefs, allColumns, updatePrefs]
  );

  const handleSort = useCallback(
    (newSortBy: string, direction: "asc" | "desc") => {
      updatePrefs.mutate({ sort_by: newSortBy, sort_direction: direction });
    },
    [updatePrefs]
  );

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

  const handleColumnUpdate = useCallback(
    (prefs: ColumnPref[]) => updatePrefs.mutate({ columns: prefs }),
    [updatePrefs]
  );

  const handleToolbarUpdate = useCallback(
    (updates: Record<string, unknown>) => updatePrefs.mutate(updates),
    [updatePrefs]
  );

  // Data
  const { data: tasks, isLoading, error, refetch } = useMyTasks(showCompleted);
  const { data: sections } = useMyTasksSections();
  useMyTasksRealtime();

  return (
    <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
    <div className="min-h-[calc(100dvh-64px)] p-5 flex flex-col gap-0">
      {/* ── Gradient Header Bar ─────────────────────────────── */}
      <div className="relative overflow-hidden p-4 mb-4" style={{ background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #c45a1a 100%)", borderRadius: "16px", boxShadow: "0 8px 32px rgba(196,90,26,0.15)" }}>
        <div className="absolute inset-0 opacity-[0.04]"><div className="absolute -top-8 -right-8 size-32 border-[2px] border-white rounded-full" /><div className="absolute bottom-0 left-10 size-16 border-[2px] border-white rounded-full" /></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-0.5 rounded-md border border-white/20 bg-white/10 p-0.5">
            {VIEWS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setViewMode(value)}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all",
                  viewMode === value
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/60 hover:text-white/80"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
          <Button size="sm" className="h-8 bg-white/15 hover:bg-white/25 text-white border-white/20" onClick={() => setShowCreate(true)}>
            <IconPlus className="mr-1.5 h-3.5 w-3.5" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* ─── Row 2: Controls ─── */}
      <div className="flex items-center justify-end border-b pb-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              showCompleted
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <IconSquareCheck className="h-3.5 w-3.5" />
            Concluídas
          </button>

          <MyTasksToolbar
            sortBy={sortBy}
            sortDirection={sortDirection}
            groupBy={groupBy}
            filters={filters}
            onUpdate={handleToolbarUpdate}
            viewMode={viewMode}
          />

          {viewMode === "list" && (
            <MyTasksColumnConfig
              columns={allColumns}
              columnPrefs={columnPrefs}
              onUpdate={handleColumnUpdate}
            />
          )}
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="pt-4">
        {isLoading ? (
          <div className="space-y-px">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : !tasks?.length && !sections?.length ? (
          <EmptyState
            icon={IconSquareCheck}
            title="Nenhuma tarefa atribuída"
            description="Quando tarefas forem atribuídas a você, elas aparecerão aqui."
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
          <MyTasksBoardView tasks={tasks ?? []} onSelect={handleSelectTask} />
        ) : (
          <MyTasksCalendarView tasks={tasks ?? []} onSelect={handleSelectTask} />
        )}
      </div>

      {/* Detail Sheet + Form */}
      <TaskDetailSheet taskId={taskId} open={!!taskId} onClose={closeTask} />
      <TaskForm open={showCreate} onOpenChange={setShowCreate} />
    </div>
    </div>
  );
}
