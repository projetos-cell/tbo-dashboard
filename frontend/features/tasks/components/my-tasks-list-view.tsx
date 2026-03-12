"use client";

import { useState, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MyTaskRow } from "./my-task-row";
import { QuickAddTask } from "./quick-add-task";
import {
  useMyTasksSections,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useReorderSections,
  useMoveTaskToSection,
  useBatchUpdateTaskOrder,
  groupTasksBySection,
} from "@/features/tasks/hooks/use-my-tasks";
import { useUndoStack } from "@/hooks/use-undo-stack";
import { useUndoKeyboard } from "@/hooks/use-undo-keyboard";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import type { MyTaskWithSection } from "@/features/tasks/services/my-tasks";
import type { MyTasksSection } from "@/features/tasks/services/my-tasks";
import type { Database } from "@/lib/supabase/types";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

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
    <div
      ref={setNodeRef}
      className={`min-h-[4px] rounded-md transition-colors ${
        isOver ? "bg-primary/5 ring-1 ring-primary/20" : ""
      }`}
    >
      {children}
    </div>
  );
}

// ─── Section header ─────────────────────────────────────────
function SectionHeader({
  section,
  taskCount,
  isCollapsed,
  onToggle,
  onRename,
  onDelete,
}: {
  section: MyTasksSection;
  taskCount: number;
  isCollapsed: boolean;
  onToggle: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);

  const handleSubmitRename = useCallback(() => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== section.name) {
      onRename(trimmed);
    }
    setIsEditing(false);
  }, [editName, section.name, onRename]);

  return (
    <div className="group flex items-center gap-2 py-2">
      <button
        onClick={onToggle}
        className="shrink-0 rounded p-0.5 text-gray-500 hover:bg-gray-100"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isEditing ? (
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSubmitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmitRename();
            if (e.key === "Escape") {
              setEditName(section.name);
              setIsEditing(false);
            }
          }}
          className="h-7 w-48 text-sm font-semibold"
          autoFocus
        />
      ) : (
        <h3
          className="cursor-pointer text-sm font-semibold text-gray-700"
          onDoubleClick={() => {
            if (!section.is_default) {
              setEditName(section.name);
              setIsEditing(true);
            }
          }}
        >
          {section.name}
        </h3>
      )}

      <Badge variant="secondary" className="h-5 text-[10px]">
        {taskCount}
      </Badge>

      {!section.is_default && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditName(section.name);
                setIsEditing(true);
              }}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Renomear
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Excluir seção
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
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
  const batchUpdate = useBatchUpdateTaskOrder();
  const tenantId = useAuthStore((s) => s.tenantId);
  const { toast } = useToast();
  const undo = useUndoStack();

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

      // Check if dropped on a section droppable
      const overIdStr = over.id as string;
      const isSection = sections.some((s) => s.id === overIdStr);

      if (isSection) {
        targetSectionId = overIdStr;
      } else {
        // Dropped on another task — use that task's section
        const overTask = tasks.find((t) => t.id === overIdStr);
        if (overTask) {
          targetSectionId = overTask.my_section_id;
        }
      }

      // If section didn't change, skip
      if (targetSectionId === task.my_section_id) return;

      const oldSectionId = task.my_section_id;

      // Undo stack
      undo.push({
        type: "MOVE_TASK_SECTION",
        payload: { taskId, toSection: targetSectionId },
        inverse: { taskId, toSection: oldSectionId },
      });

      // Calculate new sort order (append to end)
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
      <div className="space-y-1">
        {sortedSections.map((section) => {
          const sectionTasks = grouped.get(section.id) ?? [];
          const isCollapsed = collapsedSections.has(section.id);

          return (
            <div key={section.id} className="mb-4">
              <SectionHeader
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
                <DroppableSection id={section.id}>
                  <SortableContext
                    id={section.id}
                    items={sectionTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1 pl-6">
                      {sectionTasks.length === 0 && (
                        <p className="py-3 text-center text-xs text-gray-400">
                          Nenhuma tarefa nesta seção
                        </p>
                      )}
                      {sectionTasks.map((task) => (
                        <MyTaskRow
                          key={task.id}
                          task={task}
                          onClick={() => onSelect(task as TaskRow)}
                        />
                      ))}
                      <QuickAddTask
                        sectionId={section.id}
                        sortOrder={
                          sectionTasks.length > 0
                            ? sectionTasks[sectionTasks.length - 1]
                                .my_sort_order + 1
                            : 0
                        }
                      />
                    </div>
                  </SortableContext>
                </DroppableSection>
              )}
            </div>
          );
        })}

        {/* Unassigned tasks (no section) */}
        {grouped.has("__unassigned__") && (
          <div className="mb-4">
            <div className="flex items-center gap-2 py-2">
              <h3 className="text-sm font-semibold text-gray-500">
                Sem seção
              </h3>
              <Badge variant="secondary" className="h-5 text-[10px]">
                {grouped.get("__unassigned__")!.length}
              </Badge>
            </div>
            <div className="space-y-1 pl-6">
              {grouped.get("__unassigned__")!.map((task) => (
                <MyTaskRow
                  key={task.id}
                  task={task}
                  onClick={() => onSelect(task as TaskRow)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Add section button */}
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500"
          onClick={handleAddSection}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Adicionar seção
        </Button>
      </div>

      <DragOverlay>
        {activeTask ? (
          <MyTaskRow task={activeTask} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
