"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getDeliverables,
  createDeliverable,
  updateDeliverable,
  deleteDeliverable,
} from "@/services/entregas";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function useDeliverables() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["deliverables", tenantId],
    queryFn: () => getDeliverables(supabase, tenantId!),
    enabled: !!tenantId,
  });
}

export function useCreateDeliverable() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deliverable: Database["public"]["Tables"]["deliverables"]["Insert"]) =>
      createDeliverable(supabase, deliverable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliverables"] });
    },
  });
}

export function useUpdateDeliverable() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["deliverables"]["Update"];
    }) => updateDeliverable(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliverables"] });
    },
  });
}

export function useDeleteDeliverable() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDeliverable(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliverables"] });
    },
  });
}
