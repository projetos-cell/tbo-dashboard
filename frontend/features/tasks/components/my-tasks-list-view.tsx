"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MyTasksTableHeader } from "./my-tasks-table-header";
import { MyTaskTableRow } from "./my-task-table-row";
import { SectionGrouping, DynamicGrouping, FlatList } from "./my-tasks-table-body";
import { groupTasksBySection } from "@/features/tasks/hooks/use-my-tasks";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useSectionDnd } from "@/features/tasks/hooks/use-section-dnd";
import { useBulkSelection } from "@/hooks/use-bulk-selection";
import { BulkActionBar } from "@/components/shared/bulk-action-bar";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";
import type { ResolvedColumn } from "@/features/tasks/lib/my-tasks-columns";
import type { Database } from "@/lib/supabase/types";
import {
  applyFilters,
  compareTasks,
  groupTasksDynamic,
  type MyTasksFilters,
} from "@/features/tasks/lib/my-tasks-utils";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import {
  IconPlus,
  IconCircleCheck,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface MyTasksListViewProps {
  tasks: MyTaskWithSection[];
  columns: ResolvedColumn[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  groupBy?: string;
  filters?: Record<string, unknown>;
  onSelect: (task: TaskRow) => void;
  onSort?: (sortBy: string, direction: "asc" | "desc") => void;
  onResizeColumn?: (columnId: string, width: number) => void;
  onReorderColumns?: (columns: ResolvedColumn[]) => void;
}

export function MyTasksListView({
  tasks,
  columns,
  sortBy = "manual",
  sortDirection = "asc",
  groupBy = "section",
  filters,
  onSelect,
  onSort,
  onResizeColumn,
  onReorderColumns,
}: MyTasksListViewProps) {
  const dndDisabled = sortBy !== "manual" || groupBy !== "section";
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const {
    sections,
    sortedSections,
    activeTask,
    collapsedSections,
    toggleCollapse,
    handleAddSection,
    handleDragStart,
    handleDragEnd,
    updateSection,
    deleteSection,
  } = useSectionDnd({ tasks, dndDisabled });

  const { data: projects } = useProjects();
  const projectMap = useMemo(() => {
    const map = new Map<string, string>();
    if (projects) {
      for (const p of projects) map.set(p.id, p.name ?? p.id);
    }
    return map;
  }, [projects]);

  const filteredTasks = useMemo(
    () => applyFilters(tasks, filters as MyTasksFilters | undefined),
    [tasks, filters]
  );

  const sortedTasks = useMemo(() => {
    if (sortBy === "manual") return filteredTasks;
    const sorted = [...filteredTasks];
    sorted.sort((a, b) => compareTasks(a, b, sortBy, sortDirection));
    return sorted;
  }, [filteredTasks, sortBy, sortDirection]);

  // Bulk selection
  const {
    hasSelection,
    selectionCount,
    isAllSelected,
    isIndeterminate,
    toggle,
    toggleAll,
    deselectAll,
    isSelected,
    selectedItems,
  } = useBulkSelection({ items: sortedTasks, getKey: (t) => t.id });

  // Deselect when filter/grouping changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { deselectAll(); }, [filters, groupBy, sortBy]);

  const selectionCtx = useMemo(
    () => ({ isSelected, onToggle: toggle }),
    [isSelected, toggle]
  );

  const handleBulkComplete = useCallback(async () => {
    const ids = selectedItems.map((t) => t.id);
    queryClient.setQueriesData<MyTaskWithSection[]>(
      { queryKey: ["my-tasks"] },
      (old) => old?.map((t) => ids.includes(t.id) ? { ...t, status: "concluida", is_completed: true } : t)
    );
    await supabase.from("os_tasks").update({
      status: "concluida",
      is_completed: true,
      completed_at: new Date().toISOString(),
    }).in("id", ids);
    deselectAll();
    queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }, [selectedItems, deselectAll, queryClient, supabase]);

  const handleBulkReopen = useCallback(async () => {
    const ids = selectedItems.map((t) => t.id);
    queryClient.setQueriesData<MyTaskWithSection[]>(
      { queryKey: ["my-tasks"] },
      (old) => old?.map((t) => ids.includes(t.id) ? { ...t, status: "pendente", is_completed: false } : t)
    );
    await supabase.from("os_tasks").update({
      status: "pendente",
      is_completed: false,
      completed_at: null,
    }).in("id", ids);
    deselectAll();
    queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }, [selectedItems, deselectAll, queryClient, supabase]);

  const handleBulkDelete = useCallback(async () => {
    const ids = selectedItems.map((t) => t.id);
    queryClient.setQueriesData<MyTaskWithSection[]>(
      { queryKey: ["my-tasks"] },
      (old) => old?.filter((t) => !ids.includes(t.id))
    );
    await supabase.from("os_tasks").delete().in("id", ids);
    deselectAll();
    setBulkDeleteOpen(false);
    queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }, [selectedItems, deselectAll, queryClient, supabase]);

  const bulkActions = useMemo(() => [
    {
      label: "Concluir",
      icon: IconCircleCheck,
      onClick: handleBulkComplete,
      variant: "outline" as const,
    },
    {
      label: "Reabrir",
      icon: IconRefresh,
      onClick: handleBulkReopen,
      variant: "outline" as const,
    },
    {
      label: "Excluir",
      icon: IconTrash,
      onClick: () => setBulkDeleteOpen(true),
      variant: "destructive" as const,
    },
  ], [handleBulkComplete, handleBulkReopen]);

  const useSectionGrouping = groupBy === "section";

  const grouped = useMemo(
    () => (useSectionGrouping ? groupTasksBySection(sortedTasks, sections) : null),
    [sortedTasks, sections, useSectionGrouping]
  );

  const dynamicGroups = useMemo(
    () => (!useSectionGrouping && groupBy !== "none" ? groupTasksDynamic(sortedTasks, groupBy, projectMap) : null),
    [sortedTasks, groupBy, useSectionGrouping, projectMap]
  );

  // Mount the dnd-kit accessibility div to document.body only after hydration
  // to avoid the "<div> inside <table>" hydration mismatch from SSR
  const [dndAccessibilityContainer, setDndAccessibilityContainer] = useState<HTMLElement | undefined>(undefined);
  useEffect(() => {
    setDndAccessibilityContainer(document.body);
  }, []);

  return (
    <>
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      accessibility={{ container: dndAccessibilityContainer }}
    >
      <div className="rounded-lg border">
        <Table>
          <MyTasksTableHeader
            columns={columns}
            sortBy={sortBy === "manual" ? undefined : sortBy}
            sortDirection={sortDirection}
            onSort={onSort}
            onResizeColumn={onResizeColumn}
            onReorderColumns={onReorderColumns}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onToggleAll={toggleAll}
          />

          {useSectionGrouping && grouped && (
            <SectionGrouping
              sortedSections={sortedSections}
              grouped={grouped}
              collapsedSections={collapsedSections}
              columns={columns}
              projectMap={projectMap}
              onSelect={(t) => onSelect(t as TaskRow)}
              onToggleCollapse={toggleCollapse}
              onRenameSection={(id, name) => updateSection.mutate({ id, updates: { name } })}
              onDeleteSection={(id) => deleteSection.mutate(id)}
              dndDisabled={dndDisabled}
              selection={selectionCtx}
            />
          )}

          {dynamicGroups && (
            <DynamicGrouping
              groups={dynamicGroups}
              collapsedSections={collapsedSections}
              columns={columns}
              projectMap={projectMap}
              onSelect={(t) => onSelect(t as TaskRow)}
              onToggleCollapse={toggleCollapse}
              selection={selectionCtx}
            />
          )}

          {groupBy === "none" && (
            <FlatList
              tasks={sortedTasks}
              columns={columns}
              projectMap={projectMap}
              onSelect={(t) => onSelect(t as TaskRow)}
              selection={selectionCtx}
            />
          )}
        </Table>
      </div>

      {useSectionGrouping && (
        <Button variant="ghost" size="sm" className="mt-2 text-gray-500" onClick={handleAddSection}>
          <IconPlus className="mr-1.5 h-4 w-4" />
          Adicionar seção
        </Button>
      )}

      <DragOverlay>
        {activeTask ? (
          <table className="w-full">
            <tbody>
              <MyTaskTableRow task={activeTask} columns={columns} isDragOverlay />
            </tbody>
          </table>
        ) : null}
      </DragOverlay>
    </DndContext>

    {/* Bulk action floating bar */}

    <BulkActionBar
      count={selectionCount}
      actions={bulkActions}
      onClear={deselectAll}
    />

    {/* Bulk delete confirmation */}
    <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {selectionCount} {selectionCount === 1 ? "tarefa" : "tarefas"}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. As tarefas selecionadas serão excluídas permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBulkDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir {selectionCount} {selectionCount === 1 ? "tarefa" : "tarefas"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
