"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_STATUS } from "@/lib/constants";
import {
  usePropertyOptions,
  useCreatePropertyOption,
  useUpdatePropertyOption,
  useReorderPropertyOptions,
} from "@/features/projects/hooks/use-project-properties";
import { TaskCard } from "./task-card";
import { SortableTaskCard } from "./sortable-task-card";
import { useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { useUndoStack } from "@/hooks/use-undo-stack";
import { useUndoKeyboard } from "@/hooks/use-undo-keyboard";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { IconPlus, IconLayoutKanban, IconGripVertical } from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";
import type { PropertyCategory } from "@/features/projects/services/project-properties";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

interface SectionInfo {
  id: string;
  title: string;
  color: string | null;
}

interface TaskBoardProps {
  tasks: TaskRow[];
  onSelect: (task: TaskRow) => void;
  sections?: SectionInfo[];
  groupBy?: string;
}

/* ── Inline add column ─────────────────────────────────────────────── */

const PRESET_COLORS = [
  "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6b7280", "#0ea5e9",
];

function colorToBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.12)`;
}

function AddColumnInline({ nextOrder }: { nextOrder: number }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#6b7280");
  const [category, setCategory] = useState<PropertyCategory>("in_progress");
  const createOption = useCreatePropertyOption();

  function submit() {
    const trimmed = label.trim();
    if (!trimmed) return;

    const key = trimmed
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    createOption.mutate({
      property: "status",
      key,
      label: trimmed,
      color,
      bg: colorToBg(color),
      category,
      sort_order: nextOrder,
    });

    setLabel("");
    setColor("#6b7280");
    setCategory("in_progress");
    setOpen(false);
  }

  if (!open) {
    return (
      <div className="flex w-[280px] min-w-[280px] shrink-0 flex-col">
        <Button
          variant="ghost"
          className="h-auto flex-col gap-2 rounded-lg border border-dashed border-muted-foreground/20 py-8 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
          onClick={() => setOpen(true)}
        >
          <IconPlus className="size-5" />
          <span className="text-xs font-medium">Adicionar coluna</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-[280px] min-w-[280px] shrink-0 flex-col">
      <div className="rounded-lg border bg-card p-3 space-y-3">
        <Input
          placeholder="Nome do status..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") setOpen(false);
          }}
          autoFocus
        />

        <div className="flex flex-wrap gap-1">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={cn(
                "size-5 rounded-full transition-all",
                color === c && "ring-2 ring-offset-1 ring-primary",
              )}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <Select value={category} onValueChange={(v) => setCategory(v as PropertyCategory)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">A fazer</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="done">Concluídos</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="h-7 text-xs flex-1"
            onClick={submit}
            disabled={!label.trim() || createOption.isPending}
          >
            Criar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Editable column header ────────────────────────────────────────── */

function EditableColumnHeader({
  optionId,
  label,
  color,
  count,
  dragHandleProps,
}: {
  optionId: string;
  label: string;
  color: string;
  count: number;
  dragHandleProps?: Record<string, unknown>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateOption = useUpdatePropertyOption("status");

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleConfirm = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== label) {
      updateOption.mutate({ id: optionId, updates: { label: trimmed } });
    }
    setIsEditing(false);
  };

  return (
    <div className="mb-3 flex items-center gap-2">
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="flex shrink-0 cursor-grab items-center text-muted-foreground/30 hover:text-muted-foreground active:cursor-grabbing"
        >
          <IconGripVertical className="size-3.5" />
        </div>
      )}
      <div
        className="h-2.5 w-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
            if (e.key === "Escape") { setEditValue(label); setIsEditing(false); }
          }}
          onBlur={handleConfirm}
          className="flex-1 bg-transparent text-sm font-medium outline-none border-b border-primary/40"
        />
      ) : (
        <h3
          className="text-sm font-medium cursor-pointer hover:underline decoration-muted-foreground/30 underline-offset-2"
          onClick={() => { setEditValue(label); setIsEditing(true); }}
          title="Clique para renomear"
        >
          {label}
        </h3>
      )}
      <Badge variant="secondary" className="ml-auto text-xs">
        {count}
      </Badge>
    </div>
  );
}

/* ── Sortable column wrapper ────────────────────────────────────────── */

interface ColumnDef {
  id: string;
  key: string;
  label: string;
  color: string;
}

function SortableColumn({
  col,
  children,
  dragHandleSlot,
}: {
  col: ColumnDef;
  children: React.ReactNode;
  dragHandleSlot: (listeners: Record<string, unknown>, isDragging: boolean) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `col-${col.id}` });

  const style = {
    transform: CSS.Transform.toString(transform ? { ...transform, scaleY: 1, scaleX: 1 } : null),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex w-[280px] min-w-[280px] shrink-0 flex-col"
      role="group"
      aria-label={col.label}
    >
      {dragHandleSlot(listeners ?? {}, isDragging)}
      {children}
    </div>
  );
}

/* ── Board ──────────────────────────────────────────────────────────── */

export function TaskBoard({ tasks, onSelect, sections, groupBy }: TaskBoardProps) {
  const updateTask = useUpdateTask();
  const reorderOptions = useReorderPropertyOptions("status");
  const [activeTask, setActiveTask] = useState<TaskRow | null>(null);
  const [activeDragType, setActiveDragType] = useState<"task" | "column" | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState(tasks);
  const undo = useUndoStack();
  const { toast } = useToast();

  const { data: statusOptions = [] } = usePropertyOptions("status");

  // Merge dynamic options with TASK_STATUS fallback so ALL statuses have a column
  const columns = useMemo(() => {
    if (statusOptions.length === 0) {
      return Object.entries(TASK_STATUS).map(([key, cfg]) => ({
        id: key,
        key,
        label: cfg.label,
        color: cfg.color,
      }));
    }

    const dynamicCols = statusOptions.map((opt) => ({
      id: opt.id,
      key: opt.key,
      label: opt.label,
      color: opt.color,
    }));

    // Add missing TASK_STATUS entries that aren't covered by dynamic options
    const dynamicKeys = new Set(dynamicCols.map((c) => c.key));
    const missingCols = Object.entries(TASK_STATUS)
      .filter(([key]) => !dynamicKeys.has(key))
      .map(([key, cfg]) => ({
        id: key,
        key,
        label: cfg.label,
        color: cfg.color,
      }));

    // Prepend missing statuses (e.g. "Pendente") before dynamic ones
    return [...missingCols, ...dynamicCols];
  }, [statusOptions]);

  const columnKeys = useMemo(() => new Set(columns.map((c) => c.key)), [columns]);
  const columnSortableIds = useMemo(() => columns.map((c) => `col-${c.id}`), [columns]);

  // Sync when props change (unless mid-mutation)
  if (tasks !== localTasks && !updateTask.isPending) {
    setLocalTasks(tasks);
  }

  const tasksByStatus = useMemo(() => {
    const result: Record<string, TaskRow[]> = {};
    for (const col of columns) {
      result[col.key] = localTasks.filter((t) => t.status === col.key);
    }
    return result;
  }, [columns, localTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    if (id.startsWith("col-")) {
      setActiveDragType("column");
      setActiveColumnId(id.replace("col-", ""));
      setActiveTask(null);
    } else {
      setActiveDragType("task");
      setActiveColumnId(null);
      const task = localTasks.find((t) => t.id === id);
      setActiveTask(task ?? null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const prevDragType = activeDragType;
    setActiveTask(null);
    setActiveDragType(null);
    setActiveColumnId(null);

    if (!over || active.id === over.id) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // ─── COLUMN DRAG ───
    if (prevDragType === "column" && activeIdStr.startsWith("col-") && overIdStr.startsWith("col-")) {
      const activeColId = activeIdStr.replace("col-", "");
      const overColId = overIdStr.replace("col-", "");
      const oldIndex = columns.findIndex((c) => c.id === activeColId);
      const newIndex = columns.findIndex((c) => c.id === overColId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      const reordered = arrayMove(columns, oldIndex, newIndex);
      reorderOptions.mutate(reordered.map((c, i) => ({ id: c.id, sort_order: i })));
      return;
    }

    // ─── TASK DRAG ───
    const taskId = activeIdStr;
    let targetStatus = overIdStr;

    // If dropped on a col-* droppable, extract the column key
    if (targetStatus.startsWith("col-")) {
      const colId = targetStatus.replace("col-", "");
      const col = columns.find((c) => c.id === colId);
      if (col) targetStatus = col.key;
      else return;
    }

    if (!columnKeys.has(targetStatus)) {
      const overTask = localTasks.find((t) => t.id === targetStatus);
      if (overTask) targetStatus = overTask.status;
    }

    const task = localTasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;

    const oldStatus = task.status;

    undo.push({
      type: "MOVE_TASK",
      payload: { taskId, fromStatus: oldStatus, toStatus: targetStatus },
      inverse: { taskId, fromStatus: targetStatus, toStatus: oldStatus },
    });

    setLocalTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    );

    updateTask.mutate(
      { id: taskId, updates: { status: targetStatus } },
      {
        onError: () => {
          setLocalTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: oldStatus } : t))
          );
          toast({
            title: "Erro ao mover tarefa",
            description: "Não foi possível atualizar o status. Tente novamente.",
            variant: "destructive",
          });
        },
      }
    );
  }

  const handleUndo = useCallback(() => {
    const action = undo.pop();
    if (!action) return;

    const { taskId, toStatus } = action.inverse as {
      taskId: string;
      fromStatus: string;
      toStatus: string;
    };

    undo.setUndoing(true);

    setLocalTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: toStatus } : t))
    );

    updateTask.mutate(
      { id: taskId, updates: { status: toStatus } },
      {
        onSuccess: () => {
          undo.setUndoing(false);
          toast({ title: "Desfeito", description: "Movimento revertido com sucesso." });
        },
        onError: () => {
          undo.setUndoing(false);
          const original = action.payload as { toStatus: string };
          setLocalTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, status: original.toStatus } : t
            )
          );
          toast({
            title: "Erro ao desfazer",
            description: "Não foi possível reverter o movimento.",
            variant: "destructive",
          });
        },
      }
    );
  }, [undo, updateTask, toast]);

  useUndoKeyboard(handleUndo);

  const activeColumn = activeColumnId ? columns.find((c) => c.id === activeColumnId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4" role="region" aria-label="Board de tarefas">
        <SortableContext items={columnSortableIds} strategy={horizontalListSortingStrategy}>
          {columns.map((col) => {
            const columnTasks = tasksByStatus[col.key] ?? [];

            return (
              <SortableColumn
                key={col.id}
                col={col}
                dragHandleSlot={(listeners, isDragging) => (
                  <EditableColumnHeader
                    optionId={col.id}
                    label={col.label}
                    color={col.color}
                    count={columnTasks.length}
                    dragHandleProps={listeners}
                  />
                )}
              >
                <SortableContext
                  id={col.key}
                  items={columnTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2 min-h-[100px]">
                    {columnTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/20 py-8 text-center">
                        <IconLayoutKanban className="mb-2 h-6 w-6 text-muted-foreground/30" />
                        <p className="text-xs text-muted-foreground">
                          Nenhuma tarefa
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground/50">
                          Arraste um card para cá
                        </p>
                      </div>
                    ) : groupBy === "section" && sections && sections.length > 0 ? (
                      // Group cards by section within this status column
                      (() => {
                        const bySection = new Map<string | null, TaskRow[]>();
                        for (const t of columnTasks) {
                          const key = t.section_id ?? null;
                          const list = bySection.get(key) ?? [];
                          list.push(t);
                          bySection.set(key, list);
                        }
                        const orderedSections = sections.filter((s) => bySection.has(s.id));
                        const noSection = bySection.get(null);

                        return (
                          <>
                            {orderedSections.map((sec) => {
                              const secTasks = bySection.get(sec.id) ?? [];
                              return (
                                <div key={sec.id}>
                                  <div className="flex items-center gap-1.5 px-1 py-1">
                                    <div
                                      className="h-2 w-2 rounded-full shrink-0"
                                      style={{ backgroundColor: sec.color ?? "#6b7280" }}
                                    />
                                    <span className="text-[11px] font-semibold text-muted-foreground">
                                      {sec.title}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground/60">
                                      ({secTasks.length})
                                    </span>
                                  </div>
                                  {secTasks.map((task) => (
                                    <div key={task.id} className="mb-2">
                                      <SortableTaskCard
                                        task={task}
                                        onClick={() => onSelect(task)}
                                      />
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                            {noSection && noSection.length > 0 && (
                              <div>
                                <div className="flex items-center gap-1.5 px-1 py-1">
                                  <span className="text-[11px] font-semibold text-muted-foreground/60">
                                    Sem seção
                                  </span>
                                  <span className="text-[10px] text-muted-foreground/40">
                                    ({noSection.length})
                                  </span>
                                </div>
                                {noSection.map((task) => (
                                  <div key={task.id} className="mb-2">
                                    <SortableTaskCard
                                      task={task}
                                      onClick={() => onSelect(task)}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()
                    ) : (
                      columnTasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onClick={() => onSelect(task)}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </SortableColumn>
            );
          })}
        </SortableContext>

        <AddColumnInline nextOrder={columns.length} />
      </div>
      <DragOverlay>
        {activeDragType === "column" && activeColumn ? (
          <div className="flex w-[280px] items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-xl opacity-90">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeColumn.color }} />
            <span className="text-sm font-medium">{activeColumn.label}</span>
          </div>
        ) : activeDragType === "task" && activeTask ? (
          <TaskCard task={activeTask} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
