"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { MyTasksTableHeader } from "./my-tasks-table-header";
import { MyTasksSectionRow } from "./my-tasks-section-row";
import { MyTaskTableRow } from "./my-task-table-row";
import { QuickAddTask } from "./quick-add-task";
import {
  useMyTasksSections,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useMoveTaskToSection,
  groupTasksBySection,
} from "@/features/tasks/hooks/use-my-tasks";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useUndoStack } from "@/hooks/use-undo-stack";
import { useUndoKeyboard } from "@/hooks/use-undo-keyboard";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
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
  type DragEndEvent,
  type DragStartEvent,
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
  const { data: sections = [] } = useMyTasksSections();
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const moveTask = useMoveTaskToSection();
  const tenantId = useAuthStore((s) => s.tenantId);
  const { toast } = useToast();
  const undo = useUndoStack();

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

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );
  const [activeTask, setActiveTask] = useState<MyTaskWithSection | null>(null);

  // ─── Client-side filter ───
  const filteredTasks = useMemo(
    () => applyFilters(tasks, filters as MyTasksFilters | undefined),
    [tasks, filters]
  );

  // ─── Client-side sort ───
  const sortedTasks = useMemo(() => {
    if (sortBy === "manual") return filteredTasks;
    const sorted = [...filteredTasks];
    sorted.sort((a, b) => compareTasks(a, b, sortBy, sortDirection));
    return sorted;
  }, [filteredTasks, sortBy, sortDirection]);

  // DnD disabled when non-manual sort or non-section grouping
  const dndDisabled = sortBy !== "manual" || groupBy !== "section";

  // ─── Grouping ───
  const useSectionGrouping = groupBy === "section";
  const grouped = useMemo(
    () =>
      useSectionGrouping
        ? groupTasksBySection(sortedTasks, sections)
        : null,
    [sortedTasks, sections, useSectionGrouping]
  );

  const dynamicGroups = useMemo(
    () =>
      !useSectionGrouping && groupBy !== "none"
        ? groupTasksDynamic(sortedTasks, groupBy, projectMap)
        : null,
    [sortedTasks, groupBy, useSectionGrouping, projectMap]
  );

  // Toggle section collapse
  const toggleCollapse = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  // Add new section
  const handleAddSection = useCallback(() => {
    if (!tenantId) return;
    const maxOrder = sections.reduce(
      (max, s) => Math.max(max, s.sort_order),
      0
    );
    createSection.mutate({
      tenant_id: tenantId,
      name: "Nova seção",
      sort_order: maxOrder + 1,
    });
  }, [tenantId, sections, createSection]);

  // DnD handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (dndDisabled) return;
      const task = tasks.find((t) => t.id === event.active.id);
      setActiveTask(task ?? null);
    },
    [tasks, dndDisabled]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      if (dndDisabled) return;
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      let targetSectionId: string | null = null;
      const overIdStr = over.id as string;
      const isSection = sections.some((s) => s.id === overIdStr);

      if (isSection) {
        targetSectionId = overIdStr;
      } else {
        const overTask = tasks.find((t) => t.id === overIdStr);
        if (overTask) {
          targetSectionId = overTask.my_section_id;
        }
      }

      if (targetSectionId === task.my_section_id) return;

      const oldSectionId = task.my_section_id;

      undo.push({
        type: "MOVE_TASK_SECTION",
        payload: { taskId, toSection: targetSectionId },
        inverse: { taskId, toSection: oldSectionId },
      });

      const targetTasks = tasks.filter(
        (t) => t.my_section_id === targetSectionId && t.id !== taskId
      );
      const maxOrder = targetTasks.reduce(
        (max, t) => Math.max(max, t.my_sort_order),
        0
      );

      moveTask.mutate({
        task_id: taskId,
        section_id: targetSectionId,
        sort_order: maxOrder + 1,
      });
    },
    [tasks, sections, moveTask, undo, dndDisabled]
  );

  // Ctrl+Z undo
  const handleUndo = useCallback(() => {
    const action = undo.pop();
    if (!action) return;

    const { taskId, toSection } = action.inverse as {
      taskId: string;
      toSection: string | null;
    };

    moveTask.mutate(
      { task_id: taskId, section_id: toSection, sort_order: 0 },
      {
        onSuccess: () => {
          toast({
            title: "Desfeito",
            description: "Tarefa movida de volta.",
          });
        },
      }
    );
  }, [undo, moveTask, toast]);

  useUndoKeyboard(handleUndo);

  // Sorted sections for rendering
  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.sort_order - b.sort_order),
    [sections]
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
