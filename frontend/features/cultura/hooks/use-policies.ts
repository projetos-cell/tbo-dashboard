"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import {
  getPolicies,
  getPolicy,
  getPolicyById,
  createPolicy,
  updatePolicy,
  archivePolicy,
  deletePolicy,
  duplicatePolicy,
  getPolicyRevisions,
  type PolicyFilters,
} from "@/features/cultura/services/policies";
import type { Database } from "@/lib/supabase/types";

type PolicyInsert = Database["public"]["Tables"]["policies"]["Insert"];
type PolicyUpdate = Database["public"]["Tables"]["policies"]["Update"];

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function usePolicies(filters?: PolicyFilters) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["policies", tenantId, filters],
    queryFn: () => getPolicies(supabase, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function usePolicy(slug: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["policy", slug],
    queryFn: () => getPolicy(supabase, slug),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!slug,
  });
}

export function usePolicyById(id: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["policy-by-id", id],
    queryFn: () => getPolicyById(supabase, id),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!id,
  });
}

export function usePolicyRevisions(policyId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["policy-revisions", policyId],
    queryFn: () => getPolicyRevisions(supabase, policyId),
    staleTime: 1000 * 60 * 5,
    enabled: !!policyId,
  });
}

export function useCreatePolicy() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<PolicyInsert, "slug"> & { slug?: string }) =>
      createPolicy(supabase, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast.success("Política criada");
    },
    onError: () => toast.error("Erro ao criar política"),
  });
}

export function useUpdatePolicy() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
      editedBy,
      changeNote,
    }: {
      id: string;
      updates: PolicyUpdate;
      editedBy?: string;
      changeNote?: string;
    }) => updatePolicy(supabase, id, updates, editedBy, changeNote),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      queryClient.invalidateQueries({ queryKey: ["policy"] });
      queryClient.invalidateQueries({ queryKey: ["policy-by-id", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["policy-revisions", variables.id] });
      toast.success("Política atualizada");
    },
    onError: () => toast.error("Erro ao atualizar política"),
  });
}

export function useArchivePolicy() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) =>
      archivePolicy(supabase, id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast.success("Política arquivada");
    },
    onError: () => toast.error("Erro ao arquivar política"),
  });
}

export function useDeletePolicy() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePolicy(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast.success("Política excluída");
    },
    onError: () => toast.error("Erro ao excluir política"),
  });
}

export function useDuplicatePolicy() {
  const supabase = useSupabase();
  const tenantId = useTenantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      duplicatePolicy(supabase, id, tenantId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast.success("Política duplicada");
    },
    onError: () => toast.error("Erro ao duplicar política"),
  });
}
