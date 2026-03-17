"use client";

import { useState, useMemo, useRef, useEffect, useCallback, type MouseEvent as ReactMouseEvent } from "react";
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
  IconColumns,
  IconEye,
  IconEyeOff,
  IconTemplate,
  IconSparkles,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { TaskTemplatePicker } from "@/features/tasks/components/task-template-picker";
import type { TaskTemplate } from "@/features/tasks/services/task-templates";
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
import { useCreateTask, useDeleteTask } from "@/features/tasks/hooks/use-tasks";

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
import { useMultiSelect } from "@/hooks/use-multi-select";
import { SelectionMarquee } from "@/components/shared/selection-marquee";
import type { Database } from "@/lib/supabase/types";
import {
  useProjectCustomFields,
  useCreateCustomField,
  useDeleteCustomField,
  useTaskFieldValues,
  useUpsertTaskFieldValue,
  buildFieldValuesMap,
  useViewPreferences,
  useSaveViewPreferences,
} from "@/features/projects/hooks/use-custom-fields";
import type { CustomField } from "@/features/projects/services/custom-fields";

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
  defaultWidth: number;
  minWidth: number;
  sortable: boolean;
  hideOnMobile?: boolean;
  flex?: boolean;
  resizable?: boolean;
}

const COLUMNS: ColumnConfig[] = [
  { id: "check", label: "", defaultWidth: 40, minWidth: 40, sortable: false },
  { id: "title", label: "Nome", defaultWidth: 0, minWidth: 200, sortable: true, flex: true },
  { id: "status", label: "Status", defaultWidth: 130, minWidth: 80, sortable: true, resizable: true },
  { id: "priority", label: "Prioridade", defaultWidth: 120, minWidth: 80, sortable: true, hideOnMobile: true, resizable: true },
  { id: "assignee_name", label: "Responsável", defaultWidth: 140, minWidth: 80, sortable: true, hideOnMobile: true, resizable: true },
  { id: "due_date", label: "Prazo", defaultWidth: 160, minWidth: 80, sortable: true, hideOnMobile: true, resizable: true },
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

// ─── Custom field icon helper ────────────────────────────────────────────────

function CustomFieldIcon({ type }: { type: string }) {
  const iconMap: Record<string, typeof IconAlignLeft> = {
    text: IconAlignLeft,
    number: IconHash,
    select: IconSelect,
    multi_select: IconList,
    date: IconCalendar,
    person: IconUsers,
    checkbox: IconCheckbox,
    url: IconLink,
    email: IconAt,
  };
  const Icon = iconMap[type] ?? IconAlignLeft;
  return <Icon className="size-3 opacity-60" />;
}

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
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [columnOrder, setColumnOrder] = useState<string[]>(COLUMNS.map((c) => c.id));

  // ── Multi-select (Shift+Click + Marquee) ─────────────────────────────────
  const marqueeContainerRef = useRef<HTMLDivElement>(null);

  // P01 — Custom fields per project
  const { data: customFields } = useProjectCustomFields(projectId);
  const createCustomFieldMutation = useCreateCustomField(projectId);
  const deleteCustomFieldMutation = useDeleteCustomField(projectId);
  const upsertFieldValue = useUpsertTaskFieldValue();
  const allTaskIds = useMemo(() => parents.map((t) => t.id), [parents]);
  const { data: fieldValuesRaw } = useTaskFieldValues(allTaskIds);
  const fieldValuesMap = useMemo(
    () => buildFieldValuesMap(fieldValuesRaw ?? []),
    [fieldValuesRaw],
  );
  const handleFieldChange = useCallback((taskId: string, fieldId: string, value: unknown) => {
    upsertFieldValue.mutate({ taskId, fieldId, value });
  }, [upsertFieldValue]);

  // F01 — Persist view preferences
  const userId = useAuthStore((s) => s.user?.id);
  const { data: viewPrefs, isLoading: prefsLoading } = useViewPreferences(projectId);
  const saveViewPrefs = useSaveViewPreferences(projectId);
  const prefsLoaded = useRef(false);

  // Load saved preferences once
  useEffect(() => {
    if (prefsLoaded.current || prefsLoading || !viewPrefs) return;
    prefsLoaded.current = true;
    if (viewPrefs.column_widths && Object.keys(viewPrefs.column_widths).length > 0) {
      setColumnWidths(viewPrefs.column_widths);
    }
    if (viewPrefs.column_order && viewPrefs.column_order.length > 0) {
      setColumnOrder(viewPrefs.column_order);
    }
    if (viewPrefs.hidden_columns && viewPrefs.hidden_columns.length > 0) {
      setHiddenColumns(new Set(viewPrefs.hidden_columns));
    }
  }, [viewPrefs, prefsLoading]);

  // Debounced save for column widths
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedSaveWidths = useCallback(
    (widths: Record<string, number>) => {
      if (!userId) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveViewPrefs.mutate({ column_widths: widths });
      }, 500);
    },
    [userId, saveViewPrefs],
  );

  const visibleColumns = useMemo(
    () => columnOrder.map((id) => COLUMNS.find((c) => c.id === id)!).filter((c) => c && !hiddenColumns.has(c.id)),
    [columnOrder, hiddenColumns],
  );

  const toggleColumnVisibility = useCallback((colId: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) {
        next.delete(colId);
      } else {
        next.add(colId);
      }
      if (userId) saveViewPrefs.mutate({ hidden_columns: Array.from(next) });
      return next;
    });
  }, [userId, saveViewPrefs]);

  const moveColumnUp = useCallback((colId: string) => {
    setColumnOrder((prev) => {
      const idx = prev.indexOf(colId);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      if (userId) saveViewPrefs.mutate({ column_order: next });
      return next;
    });
  }, [userId, saveViewPrefs]);

  const moveColumnDown = useCallback((colId: string) => {
    setColumnOrder((prev) => {
      const idx = prev.indexOf(colId);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      if (userId) saveViewPrefs.mutate({ column_order: next });
      return next;
    });
  }, [userId, saveViewPrefs]);

  // T07 — Handle template selection
  const handleSelectTemplate = useCallback(
    (template: TaskTemplate) => {
      if (!tenantId) return;
      // Create main task from template
      createTask.mutate(
        {
          title: template.title,
          description: template.description,
          project_id: projectId,
          tenant_id: tenantId,
          status: "pendente",
          priority: template.priority,
          estimated_hours: template.estimated_hours,
        } as Database["public"]["Tables"]["os_tasks"]["Insert"],
        {
          onSuccess: (createdTask) => {
            // Create subtasks from template
            if (template.subtasks_json?.length > 0) {
              for (let i = 0; i < template.subtasks_json.length; i++) {
                const sub = template.subtasks_json[i];
                createTask.mutate({
                  title: sub.title,
                  project_id: projectId,
                  tenant_id: tenantId,
                  parent_id: createdTask.id,
                  status: "pendente",
                  priority: sub.priority ?? template.priority,
                  order_index: i,
                } as Database["public"]["Tables"]["os_tasks"]["Insert"]);
              }
            }
          },
        },
      );
    },
    [tenantId, projectId, createTask],
  );

  const getColumnWidth = useCallback(
    (col: ColumnConfig) => columnWidths[col.id] ?? col.defaultWidth,
    [columnWidths],
  );

  // Ref to avoid stale closure in resize handler
  const columnWidthsRef = useRef(columnWidths);
  columnWidthsRef.current = columnWidths;

  const handleStartResize = useCallback(
    (colId: string, startX: number) => {
      const col = COLUMNS.find((c) => c.id === colId);
      if (!col) return;
      const initialWidth = columnWidthsRef.current[colId] ?? col.defaultWidth;

      const onMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - startX;
        const newWidth = Math.max(col.minWidth, initialWidth + delta);
        setColumnWidths((prev) => ({ ...prev, [colId]: newWidth }));
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        // F01 — persist widths after resize
        debouncedSaveWidths(columnWidthsRef.current);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [],
  );

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

      // A02: Look up section defaults
      const targetSection = sections?.find((s) => s.id === targetSectionId);
      const sectionDefaults = targetSection
        ? {
            default_status: targetSection.default_status,
            default_priority: targetSection.default_priority,
            default_assignee_id: targetSection.default_assignee_id,
          }
        : undefined;

      moveTask.mutate({
        taskId,
        sectionId: targetSectionId,
        orderIndex: maxOrder + 1,
        sectionDefaults,
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

  const isSubmittingNewTask = useRef(false);
  const [smartTaskLoading, setSmartTaskLoading] = useState(false);

  const handleConfirmNewTask = () => {
    // Guard against double-fire (Enter + onBlur)
    if (isSubmittingNewTask.current || smartTaskLoading) return;
    const title = newTaskTitle?.trim();
    if (!title || !tenantId) {
      setNewTaskTitle(null);
      return;
    }
    isSubmittingNewTask.current = true;
    const userId = useAuthStore.getState().user?.id ?? null;
    setNewTaskTitle(null);
    createTask.mutate(
      {
        title,
        project_id: projectId,
        tenant_id: tenantId,
        status: "pendente",
        created_by: userId,
      } as Database["public"]["Tables"]["os_tasks"]["Insert"],
      {
        onSettled: () => {
          isSubmittingNewTask.current = false;
        },
      }
    );
  };

  const handleSmartTask = useCallback(async () => {
    const rawInput = newTaskTitle?.trim();
    if (!rawInput || !tenantId) return;
    setSmartTaskLoading(true);
    try {
      const res = await fetch("/api/ai/smart-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput }),
      });
      const data = (await res.json()) as {
        title?: string;
        subtasks?: string[];
        estimatedHours?: number | null;
      };
      if (!data.title) {
        setSmartTaskLoading(false);
        return;
      }
      const userId = useAuthStore.getState().user?.id ?? null;
      setNewTaskTitle(null);
      const parentTask = await createTask.mutateAsync({
        title: data.title,
        project_id: projectId,
        tenant_id: tenantId,
        status: "pendente",
        created_by: userId,
        estimated_hours: data.estimatedHours ?? undefined,
      } as never);
      const parentId = (parentTask as { id?: string })?.id;
      if (parentId && data.subtasks && data.subtasks.length > 0) {
        for (const subTitle of data.subtasks) {
          await createTask.mutateAsync({
            title: subTitle,
            parent_id: parentId,
            project_id: projectId,
            tenant_id: tenantId,
            status: "pendente",
            is_completed: false,
          } as never);
        }
      }
      toast({
        title: `Tarefa criada com IA — "${data.title}"`,
        description: data.subtasks?.length
          ? `${data.subtasks.length} subtarefas adicionadas`
          : undefined,
      });
    } catch {
      toast({ title: "Erro ao detalhar com IA", variant: "destructive" });
    } finally {
      setSmartTaskLoading(false);
    }
  }, [newTaskTitle, tenantId, projectId, createTask, toast]);

  const filteredPropertyTypes = useMemo(() => {
    if (!propertySearch.trim()) return PROPERTY_TYPES;
    const q = propertySearch.toLowerCase();
    return PROPERTY_TYPES.filter((p) => p.label.toLowerCase().includes(q));
  }, [propertySearch]);

  const addExtraColumn = useCallback((type: string, label: string, icon: typeof IconAlignLeft) => {
    // Suggested built-in columns (start_date, section, created_at)
    const isSuggested = SUGGESTED_EXTRA_COLUMNS.some((s) => s.key === type);
    if (isSuggested) {
      const id = `extra_${type}_${Date.now()}`;
      setExtraColumns((prev) => [...prev, {
        id,
        label,
        field: type,
        type: "readonly" as const,
        icon,
        width: "w-[130px]",
      }]);
    } else if (tenantId) {
      // P01 — Create custom field in Supabase
      const maxOrder = (customFields ?? []).reduce((max, f) => Math.max(max, f.order_index), 0);
      createCustomFieldMutation.mutate({
        name: label,
        type: type as CustomField["type"],
        project_id: projectId,
        order_index: maxOrder + 1,
      });
    }
    setAddMenuOpen(false);
    setPropertySearch("");
  }, [tenantId, projectId, customFields, createCustomFieldMutation]);

  const removeExtraColumn = useCallback((id: string) => {
    // If it's a custom field (has uuid), delete from Supabase
    if (id.length === 36) {
      deleteCustomFieldMutation.mutate(id);
    } else {
      setExtraColumns((prev) => prev.filter((c) => c.id !== id));
    }
  }, [deleteCustomFieldMutation]);

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

  // Flat ordered IDs for multi-select range calculation
  const flatTaskIds = useMemo(
    () => processed.flatMap((g) => g.items.map((t) => t.id)),
    [processed],
  );
  const multiSelect = useMultiSelect(flatTaskIds);

  // Marquee callback: replace selection with intersected IDs
  const handleMarqueeSelect = useCallback(
    (ids: string[]) => {
      multiSelect.selectRange(ids);
    },
    [multiSelect],
  );

  // Bulk delete
  const deleteTask = useDeleteTask();
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const handleBulkDelete = useCallback(() => {
    const ids = [...multiSelect.selectedIds];
    if (ids.length === 0) return;
    for (const id of ids) {
      deleteTask.mutate(id);
    }
    toast({ title: `${ids.length} tarefa${ids.length > 1 ? "s" : ""} excluída${ids.length > 1 ? "s" : ""}` });
    multiSelect.clearSelection();
    setConfirmBulkDelete(false);
  }, [multiSelect, deleteTask, toast]);

  // Keyboard: Escape to clear, Delete/Backspace to delete selected
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;

      if (e.key === "Escape" && multiSelect.count > 0) {
        multiSelect.clearSelection();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && multiSelect.count > 0) {
        e.preventDefault();
        setConfirmBulkDelete(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [multiSelect]);

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
        {/* UX04 — Content-aware skeleton: toolbar */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        {/* UX04 — Content-aware skeleton: table header */}
        <div className="overflow-hidden rounded-lg border border-border/60">
          <div className="flex items-center gap-0 border-b border-border/60 bg-muted/40 px-3 py-2">
            <div className="w-[28px]" />
            <Skeleton className="mx-2 h-3 w-8" />
            <div className="flex-1 px-2"><Skeleton className="h-3 w-16" /></div>
            <Skeleton className="mx-2 h-3 w-14 hidden md:block" />
            <Skeleton className="mx-2 h-3 w-16 hidden md:block" />
            <Skeleton className="mx-2 h-3 w-20 hidden md:block" />
            <Skeleton className="mx-2 h-3 w-14 hidden md:block" />
          </div>
          {/* UX04 — Content-aware skeleton: task rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-0 border-b border-border/30 px-3 py-2.5 last:border-b-0"
            >
              <div className="w-[28px]" />
              <Skeleton className="mx-2 size-4 rounded-full" />
              <div className="flex-1 px-2">
                <Skeleton className="h-4 rounded" style={{ width: `${55 + (i % 3) * 15}%` }} />
              </div>
              <Skeleton className="mx-2 h-5 w-16 rounded-full hidden md:block" />
              <Skeleton className="mx-2 h-5 w-14 rounded-full hidden md:block" />
              <div className="mx-2 hidden items-center gap-1.5 md:flex">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <Skeleton className="mx-2 h-3 w-20 hidden md:block" />
            </div>
          ))}
        </div>
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

      {/* Multi-select floating toolbar */}
      {multiSelect.count > 1 && (
        <div className="sticky top-0 z-30 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 shadow-sm backdrop-blur-sm">
          <span className="text-sm font-medium">
            {multiSelect.count} tarefas selecionadas
          </span>
          <button
            type="button"
            className="flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
            onClick={() => setConfirmBulkDelete(true)}
          >
            <IconTrash className="size-3" />
            Excluir
          </button>
          <div className="flex-1" />
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={multiSelect.selectAll}
          >
            Selecionar todas ({flatTaskIds.length})
          </button>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={multiSelect.clearSelection}
          >
            Limpar
          </button>
        </div>
      )}

      {/* Bulk delete confirmation */}
      <AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {multiSelect.count} tarefas?</AlertDialogTitle>
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
              Excluir {multiSelect.count} tarefas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {filtered.length === 0 && newTaskTitle === null ? (
        <EmptyState
          icon={IconListCheck}
          title={
            parents.length === 0
              ? "Adicione a primeira tarefa do projeto"
              : "Nenhuma tarefa corresponde aos filtros"
          }
          description={
            parents.length === 0
              ? "Divida o trabalho em tarefas, atribua responsáveis e defina prazos."
              : "Ajuste os filtros ou limpe a busca para ver suas tarefas."
          }
          cta={
            parents.length === 0
              ? { label: "Criar Tarefa", onClick: handleAddTaskInline, icon: IconPlus }
              : undefined
          }
          compact
        />
      ) : (
          <div ref={marqueeContainerRef} className="relative overflow-x-auto rounded-lg border border-border/60">
            <SelectionMarquee
              containerRef={marqueeContainerRef}
              onSelect={handleMarqueeSelect}
              enabled={!activeId}
            />
            {/* Sortable header — outside DndContext to avoid sensor conflicts */}
            <div className="flex items-center gap-0 border-b border-border/60 bg-muted/40 px-3 py-2">
              {/* Drag handle column */}
              <div className="w-[28px]" />
              {visibleColumns.map((col) => (
                <div
                  key={col.id}
                  className={cn(
                    "group/col relative",
                    col.hideOnMobile && "hidden md:block",
                  )}
                  style={{
                    width: col.flex ? undefined : getColumnWidth(col),
                    flex: col.flex ? "1 1 0%" : "0 0 auto",
                    minWidth: col.flex ? col.minWidth : undefined,
                  }}
                >
                  <button
                    type="button"
                    className={cn(
                      "group flex w-full items-center gap-1 px-2 text-xs font-medium text-muted-foreground select-none",
                      col.sortable && "cursor-pointer hover:text-foreground",
                    )}
                    onClick={() => col.sortable && col.id !== "check" && handleHeaderClick(col.id as TaskSortField)}
                    disabled={!col.sortable}
                  >
                    {col.label}
                    {col.sortable && col.id !== "check" && <SortIcon field={col.id as TaskSortField} />}
                  </button>
                  {col.resizable && (
                    <div
                      className="absolute -right-1.5 top-0 z-10 flex h-full w-3 cursor-col-resize items-center justify-center opacity-0 transition-opacity hover:opacity-100 group-hover/col:opacity-60"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleStartResize(col.id, e.clientX);
                      }}
                    >
                      <div className="h-4 w-0.5 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
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

              {/* P01 — Custom field column headers */}
              {(customFields ?? []).map((field) => (
                <button
                  key={field.id}
                  type="button"
                  className="group flex items-center gap-1 px-2 text-xs font-medium text-muted-foreground select-none hidden md:flex cursor-pointer hover:text-foreground"
                  style={{ width: 130, flex: "0 0 auto" }}
                  onClick={() => removeExtraColumn(field.id)}
                  title={`Remover "${field.name}"`}
                >
                  <CustomFieldIcon type={field.type} />
                  <span className="truncate">{field.name}</span>
                  <IconTrash className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                </button>
              ))}

              {/* CF03 — Customize columns */}
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="flex h-6 w-8 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Personalizar colunas"
                  >
                    <IconColumns className="size-3.5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] sm:w-[360px]">
                  <SheetHeader>
                    <SheetTitle>Personalizar Colunas</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-1">
                    {columnOrder.map((colId, idx) => {
                      const col = COLUMNS.find((c) => c.id === colId);
                      if (!col || col.id === "check") return null;
                      const isHidden = hiddenColumns.has(colId);
                      return (
                        <div
                          key={colId}
                          className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
                        >
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => moveColumnUp(colId)}
                              className="flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                              disabled={idx === 0}
                            >
                              <IconArrowUp className="size-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveColumnDown(colId)}
                              className="flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                              disabled={idx === columnOrder.length - 1}
                            >
                              <IconArrowDown className="size-3" />
                            </button>
                          </div>
                          <span className="flex-1 text-sm">{col.label || col.id}</span>
                          {col.id !== "title" && (
                            <Switch
                              checked={!isHidden}
                              onCheckedChange={() => toggleColumnVisibility(colId)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>

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

            {/* Body — DndContext only wraps sortable rows, not the header */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
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
                            columnWidths={columnWidths}
                            customFields={customFields}
                            fieldValues={fieldValuesMap.get(task.id)}
                            onFieldChange={handleFieldChange}
                            isSelected={multiSelect.isSelected(task.id)}
                            onMultiSelectClick={(id, e) => multiSelect.handleClick(id, e)}
                            selectedIds={multiSelect.count > 1 ? multiSelect.selectedIds : undefined}
                            onClearSelection={multiSelect.clearSelection}
                          />
                        ))}
                      </SortableContext>
                    </div>
                  );
                })
              )}

              <DragOverlay>
                {activeId ? (
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-xl scale-[1.02] opacity-90">
                    {parents.find((t) => t.id === activeId)?.title ?? ""}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Inline new task input (AI03: smart task when >50 chars) */}
            {newTaskTitle !== null && (
              <div className="border-b border-border/30 px-3 py-2">
                <div className="flex items-center gap-0">
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
                        if (e.key === "Enter" && !smartTaskLoading) handleConfirmNewTask();
                        if (e.key === "Escape") setNewTaskTitle(null);
                      }}
                      onBlur={() => {
                        if (!smartTaskLoading) handleConfirmNewTask();
                      }}
                      placeholder="Nome da tarefa... (Enter para criar, Esc para cancelar)"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      disabled={createTask.isPending || smartTaskLoading}
                    />
                  </div>
                </div>
                {(newTaskTitle?.trim().length ?? 0) > 50 && (
                  <div className="flex items-center gap-1.5 pl-[68px] pt-1.5">
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 hover:bg-amber-100 transition-colors dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleSmartTask}
                      disabled={smartTaskLoading}
                    >
                      {smartTaskLoading ? (
                        <IconLoader className="size-3 animate-spin" />
                      ) : (
                        <IconSparkles className="size-3" />
                      )}
                      {smartTaskLoading ? "Detalhando..." : "Detalhar com IA"}
                    </button>
                  </div>
                )}
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
      )}

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
  columnWidths,
  customFields,
  fieldValues,
  onFieldChange,
  isSelected,
  onMultiSelectClick,
  selectedIds,
  onClearSelection,
}: {
  task: TaskRow;
  subtasks: TaskRow[];
  onSelect: (id: string) => void;
  extraColumns: ExtraColumn[];
  sections?: { id: string; title: string; color: string | null }[];
  columnWidths?: Record<string, number>;
  customFields?: CustomField[];
  fieldValues?: Map<string, unknown>;
  onFieldChange?: (taskId: string, fieldId: string, value: unknown) => void;
  isSelected?: boolean;
  onMultiSelectClick?: (id: string, e: ReactMouseEvent) => void;
  selectedIds?: Set<string>;
  onClearSelection?: () => void;
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
    <div
      ref={setNodeRef}
      style={style}
      data-select-id={task.id}
      className={cn(
        "flex items-stretch",
        isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/20",
      )}
      onClick={(e) => {
        if ((e.shiftKey || e.ctrlKey || e.metaKey) && onMultiSelectClick) {
          e.preventDefault();
          e.stopPropagation();
          onMultiSelectClick(task.id, e);
        }
      }}
    >
      <div
        {...attributes}
        {...listeners}
        data-drag-handle
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
          columnWidths={columnWidths}
          customFields={customFields}
          fieldValues={fieldValues}
          onFieldChange={onFieldChange}
          selectedIds={selectedIds}
          onClearSelection={onClearSelection}
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
