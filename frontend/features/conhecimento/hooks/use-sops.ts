"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import {
  getSops,
  getSop,
  getSopBySlug,
  createSop,
  updateSop,
  deleteSop,
  reorderSops,
  getSopSteps,
  createSopStep,
  updateSopStep,
  deleteSopStep,
  reorderSopSteps,
  getSopVersions,
} from "../services/sops";
import type {
  SOP,
  SOPInsert,
  SOPUpdate,
  SOPBu,
  SOPStepInsert,
  SOPStepUpdate,
} from "../types/sops";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

// ─── SOPs ────────────────────────────────────────────────────────

export function useSops(bu?: SOPBu, status?: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["sops", tenantId, bu, status],
    queryFn: () => getSops(supabase, bu, status),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useSop(id: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["sop", id],
    queryFn: () => getSop(supabase, id),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!id,
  });
}

export function useSopBySlug(slug: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["sop-slug", slug],
    queryFn: () => getSopBySlug(supabase, slug),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!slug,
  });
}

export function useCreateSop() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sop: SOPInsert) => createSop(supabase, sop),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      toast.success("SOP criado com sucesso");
    },
    onError: () => toast.error("Erro ao criar SOP"),
  });
}

export function useUpdateSop() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
      editedBy,
    }: {
      id: string;
      updates: SOPUpdate;
      editedBy?: string;
    }) => updateSop(supabase, id, updates, editedBy),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      queryClient.invalidateQueries({ queryKey: ["sop", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["sop-versions", variables.id] });
      toast.success("SOP atualizado");
    },
    onError: () => toast.error("Erro ao atualizar SOP"),
  });
}

export function useDeleteSop() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSop(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      toast.success("SOP excluído");
    },
    onError: () => toast.error("Erro ao excluir SOP"),
  });
}

export function useReorderSops(bu?: SOPBu) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return useMutation({
    mutationFn: (items: { id: string; order_index: number }[]) =>
      reorderSops(supabase, items),
    onMutate: async (newOrder) => {
      const key = ["sops", tenantId, bu, undefined];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SOP[]>(key);
      queryClient.setQueryData<SOP[]>(key, (old) => {
        if (!old) return old;
        const orderMap = new Map(newOrder.map(({ id, order_index }) => [id, order_index]));
        return [...old]
          .map((item) => ({ ...item, order_index: orderMap.get(item.id) ?? item.order_index }))
          .sort((a, b) => a.order_index - b.order_index);
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["sops", tenantId, bu, undefined], context.previous);
      }
      toast.error("Erro ao reordenar SOPs");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
    },
  });
}

// ─── Steps ───────────────────────────────────────────────────────

export function useSopSteps(sopId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["sop-steps", sopId],
    queryFn: () => getSopSteps(supabase, sopId),
    staleTime: 1000 * 60 * 5,
    enabled: !!sopId,
  });
}

export function useCreateSopStep() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (step: SOPStepInsert) => createSopStep(supabase, step),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sop-steps", variables.sop_id] });
      toast.success("Etapa adicionada");
    },
    onError: () => toast.error("Erro ao adicionar etapa"),
  });
}

export function useUpdateSopStep() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      sopId,
      updates,
    }: {
      id: string;
      sopId: string;
      updates: SOPStepUpdate;
    }) => updateSopStep(supabase, id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sop-steps", variables.sopId] });
      toast.success("Etapa atualizada");
    },
    onError: () => toast.error("Erro ao atualizar etapa"),
  });
}

export function useDeleteSopStep() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, sopId }: { id: string; sopId: string }) =>
      deleteSopStep(supabase, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sop-steps", variables.sopId] });
      toast.success("Etapa removida");
    },
    onError: () => toast.error("Erro ao remover etapa"),
  });
}

export function useReorderSopSteps(sopId: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: { id: string; order_index: number }[]) =>
      reorderSopSteps(supabase, items),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sop-steps", sopId] });
    },
  });
}

// ─── Versions ────────────────────────────────────────────────────

export function useSopVersions(sopId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["sop-versions", sopId],
    queryFn: () => getSopVersions(supabase, sopId),
    staleTime: 1000 * 60 * 5,
    enabled: !!sopId,
  });
}
