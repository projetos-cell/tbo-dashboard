import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import {
  useProjectTasks, useProjectSections, useCreateProjectSection, useUpdateProjectSection,
  useDeleteProjectSection, useMoveProjectTask, useReorderProjectTasks,
  useReorderProjectSections,
} from "@/features/projects/hooks/use-project-tasks";
import { useCreateTask, useDeleteTask } from "@/features/tasks/hooks/use-tasks";
import { useAuthStore } from "@/stores/auth-store";
import { useUndoStack } from "@/hooks/use-undo-stack";
import { useUndoKeyboard } from "@/hooks/use-undo-keyboard";
import { useToast } from "@/hooks/use-toast";
import { type TaskListFilters, type TaskSortField } from "./project-tasks-toolbar";
import { useProjectTaskFilters } from "@/stores/task-filters-store";
import { useMultiSelect } from "@/hooks/use-multi-select";
import type { Database } from "@/lib/supabase/types";
import { sortTasks, groupTasks } from "./task-list-helpers";
import { useColumnPreferences } from "./use-column-preferences";

export function useTaskListState(projectId: string) {
  const { parents, subtasksMap, isLoading } = useProjectTasks(projectId);
  const { data: sections } = useProjectSections(projectId);
  const createTask = useCreateTask();
  const createSection = useCreateProjectSection(projectId);
  const updateSection = useUpdateProjectSection(projectId);
  const deleteSection = useDeleteProjectSection(projectId);
  const moveTask = useMoveProjectTask(projectId);
  const reorderTasks = useReorderProjectTasks(projectId);
  const reorderSections = useReorderProjectSections(projectId);
  const tenantId = useAuthStore((s) => s.tenantId);
  const { toast } = useToast();
  const undo = useUndoStack();

  const [filters, setFilters] = useProjectTaskFilters(projectId);

  // Auto-group by section when sections exist and user hasn't changed groupBy yet
  const didAutoGroup = useRef(false);
  useEffect(() => {
    if (!didAutoGroup.current && sections && sections.length > 0) {
      didAutoGroup.current = true;
      if (filters.groupBy === "none") setFilters({ ...filters, groupBy: "section" });
    }
  }, [sections, filters, setFilters]);
  const [newTaskTitle, setNewTaskTitle] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const newTaskRef = useRef<HTMLInputElement>(null);
  const newSectionRef = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<"task" | "section" | null>(null);
  const marqueeContainerRef = useRef<HTMLDivElement>(null);

  const allTaskIds = useMemo(() => parents.map((t) => t.id), [parents]);
  const cols = useColumnPreferences(projectId, allTaskIds, tenantId);

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

  useEffect(() => { if (newTaskTitle !== null && newTaskRef.current) newTaskRef.current.focus(); }, [newTaskTitle]);
  useEffect(() => { if (newSectionTitle !== null && newSectionRef.current) newSectionRef.current.focus(); }, [newSectionTitle]);

  const handleAddTaskInline = useCallback(() => setNewTaskTitle(""), []);

  const handleConfirmNewSection = useCallback(() => {
    const title = newSectionTitle?.trim();
    if (!title || !tenantId) { setNewSectionTitle(null); return; }
    const maxOrder = (sections ?? []).reduce((max, s) => Math.max(max, s.order_index), 0);
    createSection.mutate({ title, order_index: maxOrder + 1 }, { onSuccess: () => setNewSectionTitle(null), onError: () => setNewSectionTitle(null) });
  }, [newSectionTitle, tenantId, sections, createSection]);

  const handleRenameSectionConfirm = useCallback(() => {
    if (!editingSectionId) return;
    const title = editingSectionTitle.trim();
    if (title) updateSection.mutate({ id: editingSectionId, updates: { title } });
    setEditingSectionId(null); setEditingSectionTitle("");
  }, [editingSectionId, editingSectionTitle, updateSection]);

  const handleDeleteSection = useCallback((sectionId: string) => deleteSection.mutate(sectionId), [deleteSection]);

  const handleMoveSectionUp = useCallback((sectionId: string) => {
    if (!sections) return;
    const sorted = [...sections].sort((a, b) => a.order_index - b.order_index);
    const idx = sorted.findIndex((s) => s.id === sectionId);
    if (idx <= 0) return;
    const reordered = [...sorted];
    [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
    reorderSections.mutate(reordered.map((s, i) => ({ id: s.id, order_index: i })));
  }, [sections, reorderSections]);

  const handleMoveSectionDown = useCallback((sectionId: string) => {
    if (!sections) return;
    const sorted = [...sections].sort((a, b) => a.order_index - b.order_index);
    const idx = sorted.findIndex((s) => s.id === sectionId);
    if (idx === -1 || idx >= sorted.length - 1) return;
    const reordered = [...sorted];
    [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
    reorderSections.mutate(reordered.map((s, i) => ({ id: s.id, order_index: i })));
  }, [sections, reorderSections]);

  // Filtering & grouping — declared here so handleDragEnd can use the visual order
  const filtered = useMemo(() => {
    let items = parents.filter((t) => {
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.search) { const q = filters.search.toLowerCase(); if (!(t.title || "").toLowerCase().includes(q) && !(t.assignee_name || "").toLowerCase().includes(q)) return false; }
      return true;
    });
    if (filters.customFilters.length > 0) {
      items = items.filter((t) => filters.customFilters.every((f) => { switch (f.field) { case "status": return t.status === f.value; case "priority": return t.priority === f.value; default: return true; } }));
    }
    return items;
  }, [parents, filters]);

  const processed = useMemo(() => {
    const sorted = sortTasks(filtered, filters.sortField, filters.sortDir);
    return groupTasks(sorted, filters.groupBy, sections ?? undefined);
  }, [filtered, filters.sortField, filters.sortDir, filters.groupBy, sections]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    setActiveDragType(id.startsWith("section-") ? "section" : "task");
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    setActiveDragType(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // ─── SECTION DRAG ───
    if (activeIdStr.startsWith("section-") && overIdStr.startsWith("section-")) {
      const activeSectionId = activeIdStr.replace("section-", "");
      const overSectionId = overIdStr.replace("section-", "");
      if (!sections) return;
      const sorted = [...sections].sort((a, b) => a.order_index - b.order_index);
      const oldIndex = sorted.findIndex((s) => s.id === activeSectionId);
      const newIndex = sorted.findIndex((s) => s.id === overSectionId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      const reordered = [...sorted];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      reorderSections.mutate(reordered.map((s, i) => ({ id: s.id, order_index: i })));
      return;
    }

    // ─── TASK DRAG ───
    const taskId = activeIdStr;
    const overId = overIdStr;
    const task = parents.find((t) => t.id === taskId);
    if (!task) return;

    const isOverSection = overId.startsWith("section-header-");
    const targetSectionId = isOverSection ? overId.replace("section-header-", "") : (parents.find((t) => t.id === overId)?.section_id ?? null);

    if (targetSectionId !== task.section_id) {
      undo.push({ type: "MOVE_TASK_SECTION", payload: { taskId, toSection: targetSectionId }, inverse: { taskId, toSection: task.section_id } });
      const targetTasks = parents.filter((t) => t.section_id === targetSectionId && t.id !== taskId);
      const maxOrder = targetTasks.reduce((max, t) => Math.max(max, t.order_index), 0);
      const sec = sections?.find((s) => s.id === targetSectionId);
      const sectionDefaults = sec ? { default_status: sec.default_status, default_priority: sec.default_priority, default_assignee_id: sec.default_assignee_id } : undefined;
      moveTask.mutate({ taskId, sectionId: targetSectionId, orderIndex: maxOrder + 1, sectionDefaults });
      return;
    }

    // Use the current visual order (processed) so indices match what the user sees
    const group = processed.find((g) => g.items.some((t) => t.id === taskId));
    if (!group) return;
    const sectionTasks = group.items;
    const oldIndex = sectionTasks.findIndex((t) => t.id === taskId);
    const newIndex = sectionTasks.findIndex((t) => t.id === overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
    const reordered = [...sectionTasks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorderTasks.mutate(reordered.map((t, i) => ({ id: t.id, order_index: i })));
  }, [parents, processed, moveTask, reorderTasks, undo, sections, reorderSections]);

  const handleUndo = useCallback(() => {
    const action = undo.pop();
    if (!action) return;
    const { taskId, toSection } = action.inverse as { taskId: string; toSection: string | null };
    moveTask.mutate({ taskId, sectionId: toSection, orderIndex: 0 }, { onSuccess: () => toast({ title: "Desfeito", description: "Tarefa movida de volta." }) });
  }, [undo, moveTask, toast]);
  useUndoKeyboard(handleUndo);

  // New task
  const isSubmittingNewTask = useRef(false);
  const [smartTaskLoading, setSmartTaskLoading] = useState(false);

  const handleConfirmNewTask = useCallback(() => {
    if (isSubmittingNewTask.current || smartTaskLoading) return;
    const title = newTaskTitle?.trim();
    if (!title || !tenantId) { setNewTaskTitle(null); return; }
    isSubmittingNewTask.current = true;
    const currentUserId = useAuthStore.getState().user?.id ?? null;
    setNewTaskTitle(null);
    createTask.mutate(
      { title, project_id: projectId, tenant_id: tenantId, status: "pendente", created_by: currentUserId } as Database["public"]["Tables"]["os_tasks"]["Insert"],
      { onSettled: () => { isSubmittingNewTask.current = false; } },
    );
  }, [smartTaskLoading, newTaskTitle, tenantId, projectId, createTask]);

  const handleSmartTask = useCallback(async () => {
    const rawInput = newTaskTitle?.trim();
    if (!rawInput || !tenantId) return;
    setSmartTaskLoading(true);
    try {
      const res = await fetch("/api/ai/smart-task", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rawInput }) });
      const data = (await res.json()) as { title?: string; subtasks?: string[]; estimatedHours?: number | null };
      if (!data.title) { setSmartTaskLoading(false); return; }
      const currentUserId = useAuthStore.getState().user?.id ?? null;
      setNewTaskTitle(null);
      const parentTask = await createTask.mutateAsync({ title: data.title, project_id: projectId, tenant_id: tenantId, status: "pendente", created_by: currentUserId, estimated_hours: data.estimatedHours ?? undefined } as never);
      const parentId = (parentTask as { id?: string })?.id;
      if (parentId && data.subtasks && data.subtasks.length > 0) {
        for (const subTitle of data.subtasks) await createTask.mutateAsync({ title: subTitle, parent_id: parentId, project_id: projectId, tenant_id: tenantId, status: "pendente", is_completed: false } as never);
      }
      toast({ title: `Tarefa criada com IA — "${data.title}"`, description: data.subtasks?.length ? `${data.subtasks.length} subtarefas adicionadas` : undefined });
    } catch { toast({ title: "Erro ao detalhar com IA", variant: "destructive" }); }
    finally { setSmartTaskLoading(false); }
  }, [newTaskTitle, tenantId, projectId, createTask, toast]);

  const handleHeaderClick = useCallback((field: TaskSortField) => {
    if (filters.sortField === field) setFilters({ ...filters, sortDir: filters.sortDir === "asc" ? "desc" : "asc" });
    else setFilters({ ...filters, sortField: field, sortDir: "asc" });
  }, [filters, setFilters]);

  const flatTaskIds = useMemo(() => processed.flatMap((g) => g.items.map((t) => t.id)), [processed]);
  const multiSelect = useMultiSelect(flatTaskIds);
  const handleMarqueeSelect = useCallback((ids: string[]) => multiSelect.selectRange(ids), [multiSelect]);

  const deleteTask = useDeleteTask();
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const handleBulkDelete = useCallback(() => {
    const ids = [...multiSelect.selectedIds];
    if (ids.length === 0) return;
    for (const id of ids) deleteTask.mutate(id);
    toast({ title: `${ids.length} tarefa${ids.length > 1 ? "s" : ""} excluída${ids.length > 1 ? "s" : ""}` });
    multiSelect.clearSelection(); setConfirmBulkDelete(false);
  }, [multiSelect, deleteTask, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;
      if (e.key === "Escape" && multiSelect.count > 0) multiSelect.clearSelection();
      if ((e.key === "Delete" || e.key === "Backspace") && multiSelect.count > 0) { e.preventDefault(); setConfirmBulkDelete(true); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [multiSelect]);

  return {
    parents, subtasksMap, isLoading, sections,
    filters, setFilters, filtered, processed, flatTaskIds,
    ...cols, handleHeaderClick,
    sensors, activeId, activeDragType, handleDragStart, handleDragEnd,
    editingSectionId, editingSectionTitle, setEditingSectionId, setEditingSectionTitle,
    handleRenameSectionConfirm, handleDeleteSection, handleMoveSectionUp, handleMoveSectionDown,
    newTaskTitle, setNewTaskTitle, newTaskRef,
    newSectionTitle, setNewSectionTitle, newSectionRef,
    handleAddTaskInline, handleConfirmNewTask, handleConfirmNewSection,
    handleSmartTask, smartTaskLoading, createTaskIsPending: createTask.isPending,
    multiSelect, handleMarqueeSelect, marqueeContainerRef,
    confirmBulkDelete, setConfirmBulkDelete, handleBulkDelete,
  };
}
