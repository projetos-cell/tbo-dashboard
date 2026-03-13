"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { MyTasksTableHeader } from "./my-tasks-table-header";
import { MyTaskTableRow } from "./my-task-table-row";
import { SectionGrouping, DynamicGrouping, FlatList } from "./my-tasks-table-body";
import { groupTasksBySection } from "@/features/tasks/hooks/use-my-tasks";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useSectionDnd } from "@/features/tasks/hooks/use-section-dnd";
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
import { IconPlus } from "@tabler/icons-react";

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

  const useSectionGrouping = groupBy === "section";

  const grouped = useMemo(
    () => (useSectionGrouping ? groupTasksBySection(sortedTasks, sections) : null),
    [sortedTasks, sections, useSectionGrouping]
  );

  const dynamicGroups = useMemo(
    () => (!useSectionGrouping && groupBy !== "none" ? groupTasksDynamic(sortedTasks, groupBy, projectMap) : null),
    [sortedTasks, groupBy, useSectionGrouping, projectMap]
  );

  return (
    <DndContext collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="rounded-lg border">
        <Table>
          <MyTasksTableHeader
            columns={columns}
            sortBy={sortBy === "manual" ? undefined : sortBy}
            sortDirection={sortDirection}
            onSort={onSort}
            onResizeColumn={onResizeColumn}
            onReorderColumns={onReorderColumns}
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
            />
          )}

          {groupBy === "none" && (
            <FlatList
              tasks={sortedTasks}
              columns={columns}
              projectMap={projectMap}
              onSelect={(t) => onSelect(t as TaskRow)}
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
  );
}
