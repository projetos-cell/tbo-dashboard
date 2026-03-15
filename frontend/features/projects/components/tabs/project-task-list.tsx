"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  IconChevronRight,
  IconListCheck,
  IconPlus,
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
  IconAlignLeft,
  IconHash,
  IconSelect,
  IconCalendar,
  IconUsers,
  IconCheckbox,
  IconLink,
  IconAt,
  IconPhone,
  IconSearch,
  IconMathFunction,
  IconId,
  IconMapPin,
  IconClock,
  IconUserCircle,
  IconList,
  IconLoader,
  IconPaperclip,
  IconCornerDownRight,
  IconGripVertical,
  IconTrash,
  IconEdit,
} from "@tabler/icons-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useProjectTasks,
  useProjectSections,
  useCreateProjectSection,
  useUpdateProjectSection,
  useDeleteProjectSection,
  useMoveProjectTask,
  useReorderProjectTasks,
} from "@/features/projects/hooks/use-project-tasks";
import { useCreateTask } from "@/features/tasks/hooks/use-tasks";
import { useAuthStore } from "@/stores/auth-store";
import { useUndoStack } from "@/hooks/use-undo-stack";
import { useUndoKeyboard } from "@/hooks/use-undo-keyboard";
import { useToast } from "@/hooks/use-toast";
import { ProjectTaskRow } from "./project-task-row";
import {
  ProjectTasksToolbar,
  ProjectTasksSubToolbar,
  DEFAULT_TASK_FILTERS,
  type TaskListFilters,
  type TaskSortField,
} from "./project-tasks-toolbar";
import { TASK_STATUS, TASK_PRIORITY, type TaskStatusKey, type TaskPriorityKey } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type TaskRow = Database["public"]["Tables"]["os_tasks"]["Row"];

type SortDir = "asc" | "desc";

interface ProjectTaskListProps {
  projectId: string;
  onSelectTask: (taskId: string) => void;
  onAddTask: () => void;
}

// ─── Sort helpers ──────────────────────────────────────────────────────────────

function sortTasks(tasks: TaskRow[], field: TaskSortField, dir: SortDir): TaskRow[] {
  return [...tasks].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "title":
        cmp = (a.title ?? "").localeCompare(b.title ?? "", "pt-BR");
        break;
      case "status": {
        const statusOrder = Object.keys(TASK_STATUS);
        const ai = statusOrder.indexOf(a.status ?? "");
        const bi = statusOrder.indexOf(b.status ?? "");
        cmp = ai - bi;
        break;
      }
      case "priority": {
        const pa = a.priority ? TASK_PRIORITY[a.priority as TaskPriorityKey]?.sort ?? 99 : 99;
        const pb = b.priority ? TASK_PRIORITY[b.priority as TaskPriorityKey]?.sort ?? 99 : 99;
        cmp = pa - pb;
        break;
      }
      case "assignee_name":
        cmp = (a.assignee_name ?? "").localeCompare(b.assignee_name ?? "", "pt-BR");
        break;
      case "due_date":
        cmp = (a.due_date ?? "").localeCompare(b.due_date ?? "");
        break;
      case "created_at":
        cmp = (a.created_at ?? "").localeCompare(b.created_at ?? "");
        break;
    }
    return dir === "desc" ? -cmp : cmp;
  });
}

// ─── Group helpers ─────────────────────────────────────────────────────────────

function groupTasks(
  tasks: TaskRow[],
  groupBy: string,
  sections?: { id: string; title: string; color: string | null }[],
): { label: string; color?: string; items: TaskRow[] }[] {
  if (groupBy === "none") return [{ label: "", items: tasks }];

  const groups = new Map<string, TaskRow[]>();
  const order: string[] = [];

  for (const t of tasks) {
    let key: string;
    switch (groupBy) {
      case "status":
        key = t.status ?? "sem_status";
        break;
      case "priority":
        key = t.priority ?? "sem_prioridade";
        break;
      case "section":
        key = t.section_id ?? "sem_secao";
        break;
      case "assignee":
        key = t.assignee_name ?? "sem_responsavel";
        break;
      default:
        key = "all";
    }
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(t);
  }

  return order.map((key) => {
    let label = key;
    let color: string | undefined;
    if (groupBy === "status") {
      const status = TASK_STATUS[key as TaskStatusKey];
      if (status) {
        label = status.label;
        color = status.color;
      } else {
        label = "Sem status";
      }
    } else if (groupBy === "priority") {
      const prio = TASK_PRIORITY[key as TaskPriorityKey];
      if (prio) {
        label = prio.label;
        color = prio.color;
      } else {
        label = "Sem prioridade";
      }
    } else if (groupBy === "section") {
      const sec = sections?.find((s) => s.id === key);
      if (sec) {
        label = sec.title;
        color = sec.color ?? undefined;
      } else {
        label = "Sem seção";
      }
    } else if (groupBy === "assignee") {
      if (key === "sem_responsavel") {
        label = "Sem responsável";
      }
    }
    return { label, color, items: groups.get(key)! };
  });
}

// ─── Column config ─────────────────────────────────────────────────────────────

interface ColumnConfig {
  id: TaskSortField | "check";
  label: string;
  width: string;
  sortable: boolean;
  hideOnMobile?: boolean;
}

const COLUMNS: ColumnConfig[] = [
  { id: "check", label: "", width: "w-[40px]", sortable: false },
  { id: "title", label: "Nome", width: "flex-1 min-w-[200px]", sortable: true },
  { id: "status", label: "Status", width: "w-[130px]", sortable: true },
  { id: "priority", label: "Prioridade", width: "w-[120px]", sortable: true, hideOnMobile: true },
  { id: "assignee_name", label: "Responsável", width: "w-[140px]", sortable: true, hideOnMobile: true },
  { id: "due_date", label: "Prazo", width: "w-[120px]", sortable: true, hideOnMobile: true },
];

// ─── Extra column definitions (for "+" button) ──────────────────────────────

interface ExtraColumn {
  id: string;
  label: string;
  field: string;
  type: "text" | "date" | "number" | "readonly";
  icon: typeof IconAlignLeft;
  width: string;
}

const SUGGESTED_EXTRA_COLUMNS: { key: string; label: string; icon: typeof IconAlignLeft }[] = [
  { key: "start_date", label: "Data de Início", icon: IconCalendar },
  { key: "section", label: "Seção", icon: IconList },
  { key: "created_at", label: "Criado em", icon: IconClock },
];

const PROPERTY_TYPES = [
  { icon: IconAlignLeft, label: "Texto", type: "text" },
  { icon: IconHash, label: "Número", type: "number" },
  { icon: IconSelect, label: "Selecionar", type: "select" },
  { icon: IconList, label: "Seleção múltipla", type: "multi_select" },
  { icon: IconLoader, label: "Status", type: "status" },
  { icon: IconCalendar, label: "Data", type: "date" },
  { icon: IconUsers, label: "Pessoa", type: "person" },
  { icon: IconPaperclip, label: "Arquivos e mídia", type: "files" },
  { icon: IconCheckbox, label: "Caixa de seleção", type: "checkbox" },
  { icon: IconLink, label: "URL", type: "url" },
  { icon: IconAt, label: "E-mail", type: "email" },
  { icon: IconPhone, label: "Telefone", type: "phone" },
  { icon: IconCornerDownRight, label: "Relação", type: "relation" },
  { icon: IconSearch, label: "Rollup", type: "rollup" },
  { icon: IconMathFunction, label: "Fórmula", type: "formula" },
  { icon: IconId, label: "ID", type: "id" },
  { icon: IconMapPin, label: "Local", type: "location" },
  { icon: IconClock, label: "Criado em", type: "created_at" },
  { icon: IconClock, label: "Última edição", type: "updated_at" },
  { icon: IconUserCircle, label: "Criado por", type: "created_by" },
  { icon: IconUserCircle, label: "Última edição por", type: "updated_by" },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function ProjectTaskList({
  projectId,
  onSelectTask,
  onAddTask,
}: ProjectTaskListProps) {
  const { parents, subtasksMap, isLoading } = useProjectTasks(projectId);
  const { data: sections } = useProjectSections(projectId);
  const createTask = useCreateTask();
  const createSection = useCreateProjectSection(projectId);
  const updateSection = useUpdateProjectSection(projectId);
  const deleteSection = useDeleteProjectSection(projectId);
  const moveTask = useMoveProjectTask(projectId);
  const reorderTasks = useReorderProjectTasks(projectId);
  const tenantId = useAuthStore((s) => s.tenantId);
  const { toast } = useToast();
  const undo = useUndoStack();
  const [filters, setFilters] = useState<TaskListFilters>(DEFAULT_TASK_FILTERS);
  const [newTaskTitle, setNewTaskTitle] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const newTaskRef = useRef<HTMLInputElement>(null);
  const newSectionRef = useRef<HTMLInputElement>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [extraColumns, setExtraColumns] = useState<ExtraColumn[]>([]);
  const [propertySearch, setPropertySearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    if (newTaskTitle !== null && newTaskRef.current) {
      newTaskRef.current.focus();
    }
  }, [newTaskTitle]);

  useEffect(() => {
    if (newSectionTitle !== null && newSectionRef.current) {
      newSectionRef.current.focus();
    }
  }, [newSectionTitle]);

  const handleAddTaskInline = () => {
    setNewTaskTitle("");
  };

  const handleAddSection = useCallback(() => {
    setNewSectionTitle("");
  }, []);

  const handleConfirmNewSection = useCallback(() => {
    const title = newSectionTitle?.trim();
    if (!title || !tenantId) {
      setNewSectionTitle(null);
      return;
    }
    const maxOrder = (sections ?? []).reduce((max, s) => Math.max(max, s.order_index), 0);
    createSection.mutate(
      { title, order_index: maxOrder + 1 },
      {
        onSuccess: () => setNewSectionTitle(null),
        onError: () => setNewSectionTitle(null),
      },
    );
  }, [newSectionTitle, tenantId, sections, createSection]);

  const handleRenameSectionConfirm = useCallback(() => {
    if (!editingSectionId) return;
    const title = editingSectionTitle.trim();
    if (title) {
      updateSection.mutate({ id: editingSectionId, updates: { title } });
    }
    setEditingSectionId(null);
    setEditingSectionTitle("");
  }, [editingSectionId, editingSectionTitle, updateSection]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    deleteSection.mutate(sectionId);
  }, [deleteSection]);

  // DnD handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    const task = parents.find((t) => t.id === taskId);
    if (!task) return;

    // Determine target section — if dropped on a section header, use that section
    const isOverSection = overId.startsWith("section-header-");
    let targetSectionId: string | null = null;

    if (isOverSection) {
      targetSectionId = overId.replace("section-header-", "");
    } else {
      const overTask = parents.find((t) => t.id === overId);
      if (overTask) targetSectionId = overTask.section_id;
    }

    const oldSectionId = task.section_id;

    // If moving between sections, use moveTask
    if (targetSectionId !== oldSectionId) {
      undo.push({
        type: "MOVE_TASK_SECTION",
        payload: { taskId, toSection: targetSectionId },
        inverse: { taskId, toSection: oldSectionId },
      });

      const targetTasks = parents.filter(
        (t) => t.section_id === targetSectionId && t.id !== taskId,
      );
      const maxOrder = targetTasks.reduce((max, t) => Math.max(max, t.order_index), 0);

      moveTask.mutate({
        taskId,
        sectionId: targetSectionId,
        orderIndex: maxOrder + 1,
      });
      return;
    }

    // Reorder within same section
    const sectionTasks = parents
      .filter((t) => t.section_id === targetSectionId)
      .sort((a, b) => a.order_index - b.order_index);

    const oldIndex = sectionTasks.findIndex((t) => t.id === taskId);
    const newIndex = sectionTasks.findIndex((t) => t.id === overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reordered = [...sectionTasks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    reorderTasks.mutate(
      reordered.map((t, i) => ({ id: t.id, order_index: i })),
    );
  }, [parents, moveTask, reorderTasks, undo]);

  // Undo handler
  const handleUndo = useCallback(() => {
    const action = undo.pop();
    if (!action) return;
    const { taskId, toSection } = action.inverse as { taskId: string; toSection: string | null };
    moveTask.mutate(
      { taskId, sectionId: toSection, orderIndex: 0 },
      {
        onSuccess: () => {
          toast({ title: "Desfeito", description: "Tarefa movida de volta." });
        },
      },
    );
  }, [undo, moveTask, toast]);

  useUndoKeyboard(handleUndo);

  const handleConfirmNewTask = () => {
    const title = newTaskTitle?.trim();
    if (!title || !tenantId) {
      setNewTaskTitle(null);
      return;
    }
    createTask.mutate(
      {
        title,
        project_id: projectId,
        tenant_id: tenantId,
        status: "pendente",
      } as Database["public"]["Tables"]["os_tasks"]["Insert"],
      {
        onSuccess: () => setNewTaskTitle(null),
        onError: () => setNewTaskTitle(null),
      }
    );
  };

  const filteredPropertyTypes = useMemo(() => {
    if (!propertySearch.trim()) return PROPERTY_TYPES;
    const q = propertySearch.toLowerCase();
    return PROPERTY_TYPES.filter((p) => p.label.toLowerCase().includes(q));
  }, [propertySearch]);

  const addExtraColumn = useCallback((type: string, label: string, icon: typeof IconAlignLeft) => {
    const id = `extra_${type}_${Date.now()}`;
    setExtraColumns((prev) => [...prev, {
      id,
      label,
      field: "custom",
      type: "readonly" as const,
      icon,
      width: "w-[130px]",
    }]);
    setAddMenuOpen(false);
    setPropertySearch("");
  }, []);

  const removeExtraColumn = useCallback((id: string) => {
    setExtraColumns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Column sort state (synced with filters)
  const handleHeaderClick = useCallback(
    (field: TaskSortField) => {
      if (filters.sortField === field) {
        setFilters((f) => ({ ...f, sortDir: f.sortDir === "asc" ? "desc" : "asc" }));
      } else {
        setFilters((f) => ({ ...f, sortField: field, sortDir: "asc" }));
      }
    },
    [filters.sortField],
  );

  // Apply filters
  const filtered = useMemo(() => {
    let items = parents.filter((t) => {
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !(t.title || "").toLowerCase().includes(q) &&
          !(t.assignee_name || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });

    // Custom filters
    if (filters.customFilters.length > 0) {
      items = items.filter((t) =>
        filters.customFilters.every((f) => {
          switch (f.field) {
            case "status":
              return t.status === f.value;
            case "priority":
              return t.priority === f.value;
            default:
              return true;
          }
        }),
      );
    }

    return items;
  }, [parents, filters]);

  // Sort + group
  const processed = useMemo(() => {
    const sorted = sortTasks(filtered, filters.sortField, filters.sortDir);
    return groupTasks(sorted, filters.groupBy, sections ?? undefined);
  }, [filtered, filters.sortField, filters.sortDir, filters.groupBy, sections]);

  const SortIcon = ({ field }: { field: TaskSortField }) => {
    if (filters.sortField !== field) return <IconArrowsSort className="size-3 opacity-0 group-hover:opacity-40" />;
    return filters.sortDir === "asc" ? (
      <IconArrowUp className="size-3 text-foreground" />
    ) : (
      <IconArrowDown className="size-3 text-foreground" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProjectTasksToolbar
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={parents.length}
        filteredCount={filtered.length}
        onAddTask={handleAddTaskInline}
      />

      <ProjectTasksSubToolbar
        filters={filters}
        onFiltersChange={setFilters}
      />

      {filtered.length === 0 && newTaskTitle === null ? (
        <EmptyState
          icon={IconListCheck}
          title="Nenhuma tarefa encontrada"
          description={
            parents.length === 0
              ? "Crie a primeira tarefa para começar."
              : "Ajuste os filtros para ver mais tarefas."
          }
          cta={
            parents.length === 0
              ? { label: "Nova Tarefa", onClick: handleAddTaskInline }
              : undefined
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto rounded-lg border border-border/60">
            {/* Sortable header */}
            <div className="flex items-center gap-0 border-b border-border/60 bg-muted/40 px-3 py-2">
              {/* Drag handle column */}
              <div className="w-[28px]" />
              {COLUMNS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  className={cn(
                    "group flex items-center gap-1 px-2 text-xs font-medium text-muted-foreground select-none",
                    col.width,
                    col.sortable && "cursor-pointer hover:text-foreground",
                    col.hideOnMobile && "hidden md:flex",
                  )}
                  onClick={() => col.sortable && col.id !== "check" && handleHeaderClick(col.id as TaskSortField)}
                  disabled={!col.sortable}
                >
                  {col.label}
                  {col.sortable && col.id !== "check" && <SortIcon field={col.id as TaskSortField} />}
                </button>
              ))}

              {/* Extra dynamic column headers */}
              {extraColumns.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  className={cn(
                    "group flex items-center gap-1 px-2 text-xs font-medium text-muted-foreground select-none hidden md:flex cursor-pointer hover:text-foreground",
                    col.width,
                  )}
                  onClick={() => removeExtraColumn(col.id)}
                  title={`Remover "${col.label}"`}
                >
                  <col.icon className="size-3 opacity-60" />
                  <span className="truncate">{col.label}</span>
                </button>
              ))}

              {/* "+" Add property column */}
              <Popover open={addMenuOpen} onOpenChange={setAddMenuOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-6 w-8 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Adicionar propriedade"
                  >
                    <IconPlus className="size-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 p-0" sideOffset={4}>
                  {/* Suggested */}
                  <div className="border-b border-border/60 p-2">
                    <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Sugeridas
                    </p>
                    <div className="grid grid-cols-2 gap-0.5">
                      {SUGGESTED_EXTRA_COLUMNS.map((prop) => {
                        const alreadyAdded = extraColumns.some((c) => c.id.includes(prop.key));
                        return (
                          <button
                            key={prop.key}
                            type="button"
                            disabled={alreadyAdded}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                              alreadyAdded ? "cursor-not-allowed opacity-40" : "hover:bg-muted",
                            )}
                            onClick={() => addExtraColumn(prop.key, prop.label, prop.icon)}
                          >
                            <prop.icon className="size-4 text-muted-foreground" />
                            <span className="truncate">{prop.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Search + all types */}
                  <div className="p-2">
                    <div className="mb-1.5 flex items-center gap-1.5 px-2">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Selecionar tipo
                      </p>
                      <div className="relative flex-1">
                        <IconSearch className="absolute left-1.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={propertySearch}
                          onChange={(e) => setPropertySearch(e.target.value)}
                          className="h-5 w-full rounded border-0 bg-transparent pl-5 text-xs outline-none placeholder:text-muted-foreground"
                          placeholder=""
                        />
                      </div>
                    </div>
                    <div className="grid max-h-[280px] grid-cols-2 gap-0.5 overflow-y-auto">
                      {filteredPropertyTypes.map((prop) => (
                        <button
                          key={prop.type}
                          type="button"
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                          onClick={() => addExtraColumn(prop.type, prop.label, prop.icon)}
                        >
                          <prop.icon className="size-4 text-muted-foreground" />
                          <span className="truncate">{prop.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Body */}
            {processed.every((g) => g.items.length === 0) ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhuma tarefa encontrada
              </p>
            ) : (
              processed.map((group) => {
                const taskIds = group.items.map((t) => t.id);
                const sectionObj = (sections ?? []).find((s) => s.title === group.label);

                return (
                  <div key={group.label || "all"}>
                    {group.label && (
                      <SectionHeader
                        label={group.label}
                        color={group.color}
                        count={group.items.length}
                        sectionId={sectionObj?.id}
                        isEditing={editingSectionId === sectionObj?.id}
                        editValue={editingSectionTitle}
                        onStartEdit={() => {
                          if (sectionObj) {
                            setEditingSectionId(sectionObj.id);
                            setEditingSectionTitle(sectionObj.title);
                          }
                        }}
                        onEditChange={setEditingSectionTitle}
                        onEditConfirm={handleRenameSectionConfirm}
                        onEditCancel={() => { setEditingSectionId(null); setEditingSectionTitle(""); }}
                        onDelete={sectionObj ? () => handleDeleteSection(sectionObj.id) : undefined}
                      />
                    )}
                    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                      {group.items.map((task) => (
                        <SortableTaskRow
                          key={task.id}
                          task={task}
                          subtasks={subtasksMap.get(task.id) ?? []}
                          onSelect={onSelectTask}
                          extraColumns={extraColumns}
                          sections={sections ?? undefined}
                        />
                      ))}
                    </SortableContext>
                  </div>
                );
              })
            )}

            {/* Inline new task input */}
            {newTaskTitle !== null && (
              <div className="flex items-center gap-0 border-b border-border/30 px-3 py-2">
                <div className="w-[28px]" />
                <div className="w-[40px] flex items-center justify-center px-1">
                  <IconPlus className="size-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 px-2">
                  <input
                    ref={newTaskRef}
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleConfirmNewTask();
                      if (e.key === "Escape") setNewTaskTitle(null);
                    }}
                    onBlur={handleConfirmNewTask}
                    placeholder="Nome da tarefa... (Enter para criar, Esc para cancelar)"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    disabled={createTask.isPending}
                  />
                </div>
              </div>
            )}

            {/* Inline new section input */}
            {newSectionTitle !== null && (
              <div className="flex items-center gap-2 border-b border-border/40 bg-muted/20 px-5 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                <input
                  ref={newSectionRef}
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmNewSection();
                    if (e.key === "Escape") setNewSectionTitle(null);
                  }}
                  onBlur={handleConfirmNewSection}
                  placeholder="Nome da seção..."
                  className="flex-1 bg-transparent text-xs font-semibold outline-none placeholder:text-muted-foreground/50"
                />
              </div>
            )}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="rounded-md border border-border bg-background px-3 py-2 shadow-lg text-sm opacity-80">
                {parents.find((t) => t.id === activeId)?.title ?? ""}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Bottom action buttons */}
      <div className="flex items-center gap-2">
        {newTaskTitle === null && (
          <button
            type="button"
            onClick={handleAddTaskInline}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <IconPlus className="size-3.5" />
            Adicionar tarefa
          </button>
        )}
        {newSectionTitle === null && (
          <button
            type="button"
            onClick={handleAddSection}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <IconPlus className="size-3.5" />
            Adicionar seção
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sortable Task Row ────────────────────────────────────────────────────────

function SortableTaskRow({
  task,
  subtasks,
  onSelect,
  extraColumns,
  sections,
}: {
  task: TaskRow;
  subtasks: TaskRow[];
  onSelect: (id: string) => void;
  extraColumns: ExtraColumn[];
  sections?: { id: string; title: string; color: string | null }[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch">
      <div
        {...attributes}
        {...listeners}
        className="flex w-[28px] shrink-0 cursor-grab items-center justify-center text-muted-foreground/30 hover:text-muted-foreground active:cursor-grabbing"
      >
        <IconGripVertical className="size-3.5" />
      </div>
      <div className="flex-1">
        <ProjectTaskRow
          task={task}
          subtasks={subtasks}
          onSelect={onSelect}
          extraColumns={extraColumns}
          sections={sections}
        />
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  label,
  color,
  count,
  sectionId,
  isEditing,
  editValue,
  onStartEdit,
  onEditChange,
  onEditConfirm,
  onEditCancel,
  onDelete,
}: {
  label: string;
  color?: string;
  count: number;
  sectionId?: string;
  isEditing: boolean;
  editValue: string;
  onStartEdit: () => void;
  onEditChange: (v: string) => void;
  onEditConfirm: () => void;
  onEditCancel: () => void;
  onDelete?: () => void;
}) {
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [isEditing]);

  return (
    <div
      className="group flex items-center gap-2 border-b border-border/40 bg-muted/20 px-5 py-2"
      id={sectionId ? `section-header-${sectionId}` : undefined}
    >
      {color && (
        <div
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      {isEditing ? (
        <input
          ref={editRef}
          type="text"
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEditConfirm();
            if (e.key === "Escape") onEditCancel();
          }}
          onBlur={onEditConfirm}
          className="flex-1 bg-transparent text-xs font-semibold outline-none"
        />
      ) : (
        <>
          <span className="text-xs font-semibold">{label}</span>
          <span className="text-xs text-muted-foreground">({count})</span>
          {sectionId && (
            <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={onStartEdit}
                className="flex size-5 items-center justify-center rounded hover:bg-accent/50 transition-colors"
                title="Renomear seção"
              >
                <IconEdit className="size-3" />
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex size-5 items-center justify-center rounded text-destructive hover:bg-destructive/10 transition-colors"
                  title="Excluir seção"
                >
                  <IconTrash className="size-3" />
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
