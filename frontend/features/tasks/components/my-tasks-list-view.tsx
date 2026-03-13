"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { MyTasksTableHeader } from "./my-tasks-table-header";
import { MyTasksSectionRow } from "./my-tasks-section-row";
import { MyTaskTableRow } from "./my-task-table-row";
import { QuickAddTask } from "./quick-add-task";
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
  type DynamicGroup,
} from "@/features/tasks/lib/my-tasks-utils";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { IconPlus } from "@tabler/icons-react";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

// ─── Droppable section wrapper ──────────────────────────────
function DroppableSection({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <tbody
      ref={setNodeRef}
      className={isOver ? "bg-primary/5 ring-1 ring-primary/20" : ""}
    >
      {children}
    </tbody>
  );
}

// ─── Main List View ─────────────────────────────────────────
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
  // DnD disabled when non-manual sort or non-section grouping
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

  // Projects lookup
  const { data: projects } = useProjects();
  const projectMap = useMemo(() => {
    const map = new Map<string, string>();
    if (projects) {
      for (const p of projects) {
        map.set(p.id, p.name ?? p.id);
      }
    }
    return map;
  }, [projects]);

  // ─── Client-side filter + sort ───
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

  // ─── Grouping ───
  const useSectionGrouping = groupBy === "section";
  const grouped = useMemo(
    () => (useSectionGrouping ? groupTasksBySection(sortedTasks, sections) : null),
    [sortedTasks, sections, useSectionGrouping]
  );

  const dynamicGroups = useMemo(
    () =>
      !useSectionGrouping && groupBy !== "none"
        ? groupTasksDynamic(sortedTasks, groupBy, projectMap)
        : null,
    [sortedTasks, groupBy, useSectionGrouping, projectMap]
  );

  const colSpan = columns.length;

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
          />

          {/* ─── Section-based grouping (default) ─── */}
          {useSectionGrouping &&
            grouped &&
            sortedSections.map((section) => {
              const sectionTasks = grouped.get(section.id) ?? [];
              const isCollapsed = collapsedSections.has(section.id);

              return (
                <DroppableSection key={section.id} id={section.id}>
                  <MyTasksSectionRow
                    section={section}
                    taskCount={sectionTasks.length}
                    isCollapsed={isCollapsed}
                    onToggle={() => toggleCollapse(section.id)}
                    onRename={(name) =>
                      updateSection.mutate({
                        id: section.id,
                        updates: { name },
                      })
                    }
                    onDelete={() => deleteSection.mutate(section.id)}
                  />

                  {!isCollapsed && (
                    <SortableContext
                      id={section.id}
                      items={sectionTasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {sectionTasks.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={colSpan}
                            className="py-3 text-center text-xs text-gray-400"
                          >
                            Nenhuma tarefa nesta seção
                          </TableCell>
                        </TableRow>
                      )}
                      {sectionTasks.map((task) => (
                        <MyTaskTableRow
                          key={task.id}
                          task={task}
                          columns={columns}
                          projectName={
                            task.project_id
                              ? projectMap.get(task.project_id)
                              : undefined
                          }
                          onClick={() => onSelect(task as TaskRow)}
                          dndDisabled={dndDisabled}
                        />
                      ))}
                      <TableRow className="hover:bg-transparent border-0">
                        <TableCell colSpan={colSpan} className="py-0 px-0">
                          <QuickAddTask
                            sectionId={section.id}
                            sortOrder={
                              sectionTasks.length > 0
                                ? sectionTasks[sectionTasks.length - 1]
                                    .my_sort_order + 1
                                : 0
                            }
                          />
                        </TableCell>
                      </TableRow>
                    </SortableContext>
                  )}
                </DroppableSection>
              );
            })}

          {/* ─── Unassigned tasks (section grouping) ─── */}
          {useSectionGrouping && grouped?.has("__unassigned__") && (
            <TableBody>
              <TableRow className="bg-muted/20 hover:bg-muted/30">
                <TableCell
                  colSpan={colSpan}
                  className="py-1.5 px-2 text-sm font-semibold text-gray-500"
                >
                  Sem seção ({grouped.get("__unassigned__")!.length})
                </TableCell>
              </TableRow>
              {grouped.get("__unassigned__")!.map((task) => (
                <MyTaskTableRow
                  key={task.id}
                  task={task}
                  columns={columns}
                  projectName={
                    task.project_id
                      ? projectMap.get(task.project_id)
                      : undefined
                  }
                  onClick={() => onSelect(task as TaskRow)}
                  dndDisabled={dndDisabled}
                />
              ))}
            </TableBody>
          )}

          {/* ─── Dynamic grouping (non-section) ─── */}
          {dynamicGroups &&
            dynamicGroups.map((group) => {
              const isCollapsed = collapsedSections.has(group.id);

              return (
                <TableBody key={group.id}>
                  <TableRow
                    className="bg-muted/30 hover:bg-muted/40 border-b cursor-pointer"
                    onClick={() => toggleCollapse(group.id)}
                  >
                    <TableCell
                      colSpan={colSpan}
                      className="py-1.5 px-2 text-sm font-semibold text-gray-700"
                    >
                      {group.label}{" "}
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        ({group.tasks.length})
                      </span>
                    </TableCell>
                  </TableRow>
                  {!isCollapsed &&
                    group.tasks.map((task) => (
                      <MyTaskTableRow
                        key={task.id}
                        task={task}
                        columns={columns}
                        projectName={
                          task.project_id
                            ? projectMap.get(task.project_id)
                            : undefined
                        }
                        onClick={() => onSelect(task as TaskRow)}
                        dndDisabled
                      />
                    ))}
                </TableBody>
              );
            })}

          {/* ─── No grouping ─── */}
          {groupBy === "none" && (
            <TableBody>
              {sortedTasks.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={colSpan}
                    className="py-8 text-center text-sm text-gray-400"
                  >
                    Nenhuma tarefa encontrada
                  </TableCell>
                </TableRow>
              )}
              {sortedTasks.map((task) => (
                <MyTaskTableRow
                  key={task.id}
                  task={task}
                  columns={columns}
                  projectName={
                    task.project_id
                      ? projectMap.get(task.project_id)
                      : undefined
                  }
                  onClick={() => onSelect(task as TaskRow)}
                  dndDisabled
                />
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      {/* Add section button (only in section grouping mode) */}
      {useSectionGrouping && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-gray-500"
          onClick={handleAddSection}
        >
          <IconPlus className="mr-1.5 h-4 w-4" />
          Adicionar seção
        </Button>
      )}

      <DragOverlay>
        {activeTask ? (
          <table className="w-full">
            <tbody>
              <MyTaskTableRow
                task={activeTask}
                columns={columns}
                isDragOverlay
              />
            </tbody>
          </table>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
