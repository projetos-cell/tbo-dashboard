"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getFieldDefinitions,
  createFieldDefinition,
  deleteFieldDefinition,
  getTaskCustomFieldValues,
  upsertTaskCustomFieldValue,
} from "@/features/tasks/services/task-custom-fields";
import { fieldDefinitionKeys, taskKeys } from "@/lib/query/task-keys";
import type {
  CustomFieldDefinition,
  CreateFieldDefinitionInput,
  TaskCustomFieldValue,
} from "@/schemas/custom-field";

// ─── Field Definitions (org-level) ──────────────────

export function useFieldDefinitions() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<CustomFieldDefinition[]>({
    queryKey: fieldDefinitionKeys.list(tenantId ?? ""),
    queryFn: () => getFieldDefinitions(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateFieldDefinition() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (input: CreateFieldDefinitionInput) =>
      createFieldDefinition(supabase, {
        ...input,
        tenant_id: tenantId!,
        created_by: userId!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldDefinitionKeys.all });
    },
  });
}

export function useDeleteFieldDefinition() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFieldDefinition(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldDefinitionKeys.all });
    },
  });
}

// ─── Task Values (per task) ──────────────────────────

export function useTaskCustomFieldValues(taskId: string) {
  const supabase = createClient();

  return useQuery<TaskCustomFieldValue[]>({
    queryKey: taskKeys.customFields(taskId),
    queryFn: () => getTaskCustomFieldValues(supabase, taskId),
    staleTime: 1000 * 60 * 2,
    enabled: !!taskId,
  });
}

export function useUpsertCustomFieldValue() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TaskCustomFieldValue) =>
      upsertTaskCustomFieldValue(supabase, input),

    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: taskKeys.customFields(input.task_id),
      });
      const previous = queryClient.getQueryData<TaskCustomFieldValue[]>(
        taskKeys.customFields(input.task_id)
      );

      queryClient.setQueryData<TaskCustomFieldValue[]>(
        taskKeys.customFields(input.task_id),
        (old = []) => {
          const idx = old.findIndex((v) => v.field_id === input.field_id);
          if (idx >= 0) {
            const next = [...old];
            next[idx] = input;
            return next;
          }
          return [...old, input];
        }
      );

      return { previous, taskId: input.task_id };
    },

    onError: (_err, input, ctx) => {
      if (ctx?.previous !== undefined) {
        queryClient.setQueryData(
          taskKeys.customFields(input.task_id),
          ctx.previous
        );
      }
    },

    onSettled: (_data, _err, input) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.customFields(input.task_id),
      });
    },
  });
}
