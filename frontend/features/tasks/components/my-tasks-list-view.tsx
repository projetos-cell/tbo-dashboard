"use client";

import { useState, useCallback, useMemo, Fragment } from "react";
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
import type { Database } from "@/lib/supabase/types";
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
import { Plus } from "lucide-react";

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
  onSelect: (task: TaskRow) => void;
}

export function MyTasksListView({ tasks, onSelect }: MyTasksListViewProps) {
  const { data: sections = [] } = useMyTasksSections();
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const moveTask = useMoveTaskToSection();
  const tenantId = useAuthStore((s) => s.tenantId);
  const { toast } = useToast();
  const undo = useUndoStack();

  // Projects lookup for project_id → name
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

  // Group tasks by section
  const grouped = useMemo(
    () => groupTasksBySection(tasks, sections),
    [tasks, sections]
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
      const task = tasks.find((t) => t.id === event.active.id);
      setActiveTask(task ?? null);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Determine target section
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
    [tasks, sections, moveTask, undo]
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

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="rounded-lg border">
        <Table>
          <MyTasksTableHeader />

          {sortedSections.map((section) => {
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
                    updateSection.mutate({ id: section.id, updates: { name } })
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
                          colSpan={6}
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
                        projectName={
                          task.project_id
                            ? projectMap.get(task.project_id)
                            : undefined
                        }
                        onClick={() => onSelect(task as TaskRow)}
                      />
                    ))}
                    <TableRow className="hover:bg-transparent border-0">
                      <TableCell colSpan={6} className="py-0 px-0">
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

          {/* Unassigned tasks (no section) */}
          {grouped.has("__unassigned__") && (
            <TableBody>
              <TableRow className="bg-muted/20 hover:bg-muted/30">
                <TableCell
                  colSpan={6}
                  className="py-1.5 px-2 text-sm font-semibold text-gray-500"
                >
                  Sem seção ({grouped.get("__unassigned__")!.length})
                </TableCell>
              </TableRow>
              {grouped.get("__unassigned__")!.map((task) => (
                <MyTaskTableRow
                  key={task.id}
                  task={task}
                  projectName={
                    task.project_id
                      ? projectMap.get(task.project_id)
                      : undefined
                  }
                  onClick={() => onSelect(task as TaskRow)}
                />
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      {/* Add section button */}
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 text-gray-500"
        onClick={handleAddSection}
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Adicionar seção
      </Button>

      <DragOverlay>
        {activeTask ? (
          <table className="w-full">
            <tbody>
              <MyTaskTableRow task={activeTask} isDragOverlay />
            </tbody>
          </table>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
