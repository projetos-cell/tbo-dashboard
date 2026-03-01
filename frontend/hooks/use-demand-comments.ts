"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getDemandComments,
  createDemandComment,
  updateDemandComment,
  deleteDemandComment,
} from "@/services/demand-comments";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function useDemandComments(demandId: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["demand-comments", demandId],
    queryFn: () => getDemandComments(supabase, demandId, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!demandId,
  });
}

export function useCreateDemandComment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      comment: Database["public"]["Tables"]["demand_comments"]["Insert"]
    ) => createDemandComment(supabase, comment),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["demand-comments", variables.demand_id],
      });
    },
  });
}

export function useUpdateDemandComment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      content,
      demandId,
    }: {
      id: string;
      content: string;
      demandId: string;
    }) => updateDemandComment(supabase, id, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["demand-comments", variables.demandId],
      });
    },
  });
}

export function useDeleteDemandComment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, demandId }: { id: string; demandId: string }) =>
      deleteDemandComment(supabase, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["demand-comments", variables.demandId],
      });
    },
  });
}
