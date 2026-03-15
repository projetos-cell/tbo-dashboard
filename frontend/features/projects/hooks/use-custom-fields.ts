import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  getProjectCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  getTaskFieldValues,
  upsertTaskFieldValue,
  getViewPreferences,
  upsertViewPreferences,
  type CustomField,
  type TaskFieldValue,
  type CreateCustomFieldInput,
} from "../services/custom-fields";

// ─── Custom Fields ──────────────────────────────────────────────────────────────

export function useProjectCustomFields(projectId: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["custom-fields", tenantId, projectId],
    queryFn: () => getProjectCustomFields(tenantId!, projectId),
    enabled: !!tenantId && !!projectId,
  });
}

export function useCreateCustomField(projectId: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: CreateCustomFieldInput) =>
      createCustomField(tenantId!, input),
    onSuccess: (field) => {
      queryClient.invalidateQueries({ queryKey: ["custom-fields", tenantId, projectId] });
      toast({ title: `Campo "${field.name}" criado` });
    },
    onError: () => {
      toast({ title: "Erro ao criar campo", variant: "destructive" });
    },
  });
}

export function useUpdateCustomField(projectId: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<CustomField, "name" | "type" | "config_json" | "order_index" | "is_visible">> }) =>
      updateCustomField(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-fields", tenantId, projectId] });
    },
  });
}

export function useDeleteCustomField(projectId: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteCustomField(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-fields", tenantId, projectId] });
      toast({ title: "Campo removido" });
    },
    onError: () => {
      toast({ title: "Erro ao remover campo", variant: "destructive" });
    },
  });
}

// ─── Task Field Values ──────────────────────────────────────────────────────────

export function useTaskFieldValues(taskIds: string[]) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["task-field-values", tenantId, taskIds],
    queryFn: () => getTaskFieldValues(tenantId!, taskIds),
    enabled: !!tenantId && taskIds.length > 0,
  });
}

export function useUpsertTaskFieldValue() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, fieldId, value }: { taskId: string; fieldId: string; value: unknown }) =>
      upsertTaskFieldValue(tenantId!, taskId, fieldId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-field-values"] });
    },
  });
}

// ─── Build values map: Map<taskId, Map<fieldId, value>> ─────────────────────────

export function buildFieldValuesMap(values: TaskFieldValue[]): Map<string, Map<string, unknown>> {
  const map = new Map<string, Map<string, unknown>>();
  for (const v of values) {
    if (!map.has(v.task_id)) map.set(v.task_id, new Map());
    map.get(v.task_id)!.set(v.field_id, v.value_json);
  }
  return map;
}

// ─── View Preferences ───────────────────────────────────────────────────────────

export function useViewPreferences(projectId: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["view-preferences", userId, projectId],
    queryFn: () => getViewPreferences(userId!, projectId),
    enabled: !!userId && !!projectId,
  });
}

export function useSaveViewPreferences(projectId: string) {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prefs: { column_widths?: Record<string, number>; column_order?: string[]; hidden_columns?: string[] }) =>
      upsertViewPreferences(userId!, projectId, prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["view-preferences", userId, projectId] });
    },
  });
}
