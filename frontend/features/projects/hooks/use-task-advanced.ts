"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

import {
  getTaskDependencies,
  addTaskDependency,
  removeTaskDependency,
  getBlockingTasks,
} from "../services/task-dependencies";
import {
  getTimeEntries,
  getProjectTimeEntries,
  startTimer,
  stopTimer,
  getRunningTimer,
  getTimeStats,
} from "../services/task-time-tracking";
import {
  getChecklistItems,
  addChecklistItem,
  updateChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
} from "../services/task-checklists";
import {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
} from "../services/task-comments";
import {
  getTaskAttachments,
  uploadTaskAttachment,
  deleteTaskAttachment,
} from "../services/task-attachments";
import {
  getApprovalSteps,
  createApprovalWorkflow,
  updateApprovalStep,
} from "../services/task-approval-workflow";
import {
  getSavedFilters,
  saveFilter,
  deleteFilter,
} from "../services/saved-filters";
import { getCrossProjectFiles } from "../services/cross-project-files";
import type { TaskDependencyRow } from "../services/task-dependencies";
import type { ChecklistItem } from "../services/task-checklists";

// ─── Task Dependencies ──────────────────────────────────────────────────────

export function useTaskDependencies(projectId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["task-dependencies", projectId, tenantId],
    queryFn: () => getTaskDependencies(supabase, projectId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!projectId && !!tenantId,
  });
}

export function useBlockingTasks(taskId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["blocking-tasks", taskId, tenantId],
    queryFn: () => getBlockingTasks(supabase, taskId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!taskId && !!tenantId,
  });
}

export function useAddTaskDependency() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Omit<Parameters<typeof addTaskDependency>[1], "tenant_id">) =>
      addTaskDependency(supabase, { ...params, tenant_id: tenantId! }),
    onSuccess: (dep) => {
      queryClient.invalidateQueries({ queryKey: ["task-dependencies"] });
      queryClient.invalidateQueries({ queryKey: ["blocking-tasks", dep.task_id] });
      toast.success("Dependência adicionada");
    },
    onError: () => {
      toast.error("Erro ao adicionar dependência");
    },
  });
}

export function useRemoveTaskDependency() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeTaskDependency(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-dependencies"] });
      queryClient.invalidateQueries({ queryKey: ["blocking-tasks"] });
      toast.success("Dependência removida");
    },
    onError: () => {
      toast.error("Erro ao remover dependência");
    },
  });
}

// ─── Time Tracking ──────────────────────────────────────────────────────────

export function useTaskTimeEntries(taskId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["time-entries", "task", taskId, tenantId],
    queryFn: () => getTimeEntries(supabase, taskId!),
    staleTime: 1000 * 60 * 1,
    enabled: !!taskId && !!tenantId,
  });
}

export function useProjectTimeEntries(projectId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["time-entries", "project", projectId, tenantId],
    queryFn: () => getProjectTimeEntries(supabase, projectId!),
    staleTime: 1000 * 60 * 2,
    enabled: !!projectId && !!tenantId,
  });
}

export function useRunningTimer(userId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["running-timer", userId, tenantId],
    queryFn: () => getRunningTimer(supabase, userId!),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
    enabled: !!userId && !!tenantId,
  });
}

export function useStartTimer() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { task_id: string; user_id: string }) =>
      startTimer(supabase, { ...params, tenant_id: tenantId! }),
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ["time-entries", "task", entry.task_id] });
      queryClient.invalidateQueries({ queryKey: ["running-timer", entry.user_id] });
      toast.success("Cronômetro iniciado");
    },
    onError: () => {
      toast.error("Erro ao iniciar cronômetro");
    },
  });
}

export function useStopTimer() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => stopTimer(supabase, entryId),
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ["time-entries", "task", entry.task_id] });
      queryClient.invalidateQueries({ queryKey: ["running-timer", entry.user_id] });
      queryClient.invalidateQueries({ queryKey: ["time-entries", "project"] });
      toast.success("Cronômetro parado");
    },
    onError: () => {
      toast.error("Erro ao parar cronômetro");
    },
  });
}

export function useTimeStats(projectId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["time-stats", projectId, tenantId],
    queryFn: () => getTimeStats(supabase, projectId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!projectId && !!tenantId,
  });
}

// ─── Checklists ──────────────────────────────────────────────────────────────

export function useChecklistItems(taskId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["checklist-items", taskId, tenantId],
    queryFn: () => getChecklistItems(supabase, taskId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!taskId && !!tenantId,
  });
}

export function useAddChecklistItem(taskId: string) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { title: string; sort_order: number }) =>
      addChecklistItem(supabase, {
        tenant_id: tenantId!,
        task_id: taskId,
        ...params,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-items", taskId] });
    },
    onError: () => {
      toast.error("Erro ao adicionar item");
    },
  });
}

export function useUpdateChecklistItem(taskId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<ChecklistItem, "title" | "sort_order">> }) =>
      updateChecklistItem(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-items", taskId] });
    },
    onError: () => {
      toast.error("Erro ao atualizar item");
    },
  });
}

export function useToggleChecklistItem(taskId: string) {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleChecklistItem(supabase, id, userId!),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["checklist-items", taskId] });
      const prev = queryClient.getQueryData<ChecklistItem[]>(["checklist-items", taskId]);
      queryClient.setQueryData<ChecklistItem[]>(["checklist-items", taskId], (old) =>
        (old ?? []).map((item) =>
          item.id === id ? { ...item, is_completed: !item.is_completed } : item,
        ),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["checklist-items", taskId], ctx.prev);
      }
      toast.error("Erro ao atualizar item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-items", taskId] });
    },
  });
}

export function useDeleteChecklistItem(taskId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteChecklistItem(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-items", taskId] });
    },
    onError: () => {
      toast.error("Erro ao deletar item");
    },
  });
}

// ─── Comments ────────────────────────────────────────────────────────────────

export function useTaskComments(taskId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["task-comments", taskId, tenantId],
    queryFn: () => getTaskComments(supabase, taskId!),
    staleTime: 1000 * 60 * 2,
    enabled: !!taskId && !!tenantId,
  });
}

export function useCreateComment(taskId: string) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { content: string; mentions?: string[]; parent_id?: string | null }) =>
      createComment(supabase, {
        tenant_id: tenantId!,
        task_id: taskId,
        author_id: userId!,
        ...params,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
    },
    onError: () => {
      toast.error("Erro ao enviar comentário");
    },
  });
}

export function useUpdateComment(taskId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateComment(supabase, id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
    },
    onError: () => {
      toast.error("Erro ao editar comentário");
    },
  });
}

export function useDeleteComment(taskId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteComment(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] });
      toast.success("Comentário removido");
    },
    onError: () => {
      toast.error("Erro ao remover comentário");
    },
  });
}

// ─── Attachments ─────────────────────────────────────────────────────────────

export function useTaskAttachments(taskId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["task-attachments", taskId, tenantId],
    queryFn: () => getTaskAttachments(supabase, taskId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!taskId && !!tenantId,
  });
}

export function useUploadAttachment(taskId: string) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      uploadTaskAttachment(supabase, {
        tenant_id: tenantId!,
        task_id: taskId,
        user_id: userId!,
        file,
      }),
    onSuccess: (attachment) => {
      queryClient.invalidateQueries({ queryKey: ["task-attachments", taskId] });
      toast.success(`Arquivo "${attachment.file_name}" anexado`);
    },
    onError: () => {
      toast.error("Erro ao anexar arquivo");
    },
  });
}

export function useDeleteAttachment(taskId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath: string | null }) =>
      deleteTaskAttachment(supabase, id, storagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-attachments", taskId] });
      toast.success("Arquivo removido");
    },
    onError: () => {
      toast.error("Erro ao remover arquivo");
    },
  });
}

// ─── Approval Workflow ───────────────────────────────────────────────────────

export function useApprovalSteps(taskId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["approval-steps", taskId, tenantId],
    queryFn: () => getApprovalSteps(supabase, taskId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!taskId && !!tenantId,
  });
}

export function useCreateApprovalWorkflow(taskId: string) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (steps: Parameters<typeof createApprovalWorkflow>[3]) =>
      createApprovalWorkflow(supabase, taskId, tenantId!, steps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-steps", taskId] });
      toast.success("Fluxo de aprovação criado");
    },
    onError: () => {
      toast.error("Erro ao criar fluxo de aprovação");
    },
  });
}

export function useUpdateApprovalStep(taskId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { status: "approved" | "rejected" | "skipped"; feedback?: string } }) =>
      updateApprovalStep(supabase, id, updates),
    onSuccess: (step) => {
      queryClient.invalidateQueries({ queryKey: ["approval-steps", taskId] });
      const label = step.status === "approved" ? "aprovada" : step.status === "rejected" ? "rejeitada" : "ignorada";
      toast.success(`Etapa ${label}`);
    },
    onError: () => {
      toast.error("Erro ao atualizar aprovação");
    },
  });
}

// ─── Saved Filters ───────────────────────────────────────────────────────────

export function useSavedFilters(viewKey: string) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["saved-filters", userId, viewKey, tenantId],
    queryFn: () => getSavedFilters(supabase, userId!, viewKey),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId && !!tenantId,
  });
}

export function useSaveFilter(viewKey: string) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Omit<Parameters<typeof saveFilter>[1], "tenant_id" | "user_id" | "view_key">) =>
      saveFilter(supabase, {
        tenant_id: tenantId!,
        user_id: userId!,
        view_key: viewKey,
        ...params,
      }),
    onSuccess: (filter) => {
      queryClient.invalidateQueries({ queryKey: ["saved-filters", userId, viewKey] });
      toast.success(`Filtro "${filter.name}" salvo`);
    },
    onError: () => {
      toast.error("Erro ao salvar filtro");
    },
  });
}

export function useDeleteFilter(viewKey: string) {
  const supabase = createClient();
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFilter(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-filters", userId, viewKey] });
      toast.success("Filtro removido");
    },
    onError: () => {
      toast.error("Erro ao remover filtro");
    },
  });
}

// ─── Cross-Project Files ─────────────────────────────────────────────────────

export function useCrossProjectFiles() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["cross-project-files", tenantId],
    queryFn: () => getCrossProjectFiles(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// Re-export types for convenience
export type { TaskDependencyRow } from "../services/task-dependencies";
export type { TimeEntry, TimeStats } from "../services/task-time-tracking";
export type { ChecklistItem } from "../services/task-checklists";
export type { TaskComment } from "../services/task-comments";
export type { TaskAttachment } from "../services/task-attachments";
export type { ApprovalStep } from "../services/task-approval-workflow";
export type { SavedFilter } from "../services/saved-filters";
export type { CrossProjectFile } from "../services/cross-project-files";
