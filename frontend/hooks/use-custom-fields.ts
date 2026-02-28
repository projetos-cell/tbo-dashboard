"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getDefinitions,
  createDefinition,
  updateDefinition,
  deleteDefinition,
  getValues,
  upsertValue,
} from "@/services/custom-fields";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function useFieldDefinitions(projectId: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["field-definitions", projectId],
    queryFn: () => getDefinitions(supabase, projectId, tenantId!),
    enabled: !!tenantId && !!projectId,
  });
}

export function useFieldValues(taskId: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["field-values", taskId],
    queryFn: () => getValues(supabase, taskId, tenantId!),
    enabled: !!tenantId && !!taskId,
  });
}

export function useCreateFieldDefinition() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (def: Database["public"]["Tables"]["custom_field_definitions"]["Insert"]) =>
      createDefinition(supabase, def),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["field-definitions", variables.project_id],
      });
    },
  });
}

export function useUpdateFieldDefinition() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["custom_field_definitions"]["Update"];
      projectId: string;
    }) => updateDefinition(supabase, id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["field-definitions", variables.projectId],
      });
    },
  });
}

export function useDeleteFieldDefinition() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; projectId: string }) =>
      deleteDefinition(supabase, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["field-definitions", variables.projectId],
      });
    },
  });
}

export function useUpsertFieldValue() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: Database["public"]["Tables"]["custom_field_values"]["Insert"]) =>
      upsertValue(supabase, value),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["field-values", variables.task_id],
      });
    },
  });
}
