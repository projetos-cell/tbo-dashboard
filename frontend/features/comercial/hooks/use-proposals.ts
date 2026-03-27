"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import { toast } from "sonner";
import {
  getProposals,
  getProposalById,
  createProposal,
  updateProposal,
  deleteProposal,
  upsertProposalItems,
  type ProposalInsert,
  type ProposalUpdate,
  type ProposalItemInsert,
  type ProposalStatus,
} from "@/features/comercial/services/proposals";

export function useProposals(status?: ProposalStatus) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["proposals", tenantId, status],
    queryFn: async () => {
      const supabase = createClient();
      return getProposals(supabase, status);
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!tenantId,
  });
}

export function useProposal(id: string | null) {
  return useQuery({
    queryKey: ["proposal", id],
    queryFn: async () => {
      const supabase = createClient();
      return getProposalById(supabase, id!);
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });
}

export function useCreateProposal() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: async (input: Omit<ProposalInsert, "tenant_id">) => {
      const supabase = createClient();
      return createProposal(supabase, { ...input, tenant_id: tenantId! });
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
      toast.success(`Proposta "${data.name}" criada`);
      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "create",
        table: "proposals",
        recordId: data.id,
        after: data as unknown as Record<string, unknown>,
      });
    },
    onError: (err) => toast.error(`Erro ao criar proposta: ${err.message}`),
  });
}

export function useUpdateProposal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProposalUpdate }) => {
      const supabase = createClient();
      return updateProposal(supabase, id, updates);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
      qc.invalidateQueries({ queryKey: ["proposal", data.id] });
      toast.success("Proposta atualizada");
    },
    onError: (err) => toast.error(`Erro ao atualizar proposta: ${err.message}`),
  });
}

export function useDeleteProposal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      return deleteProposal(supabase, id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Proposta removida");
    },
    onError: (err) => toast.error(`Erro ao remover proposta: ${err.message}`),
  });
}

export function useUpsertProposalItems() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: async ({
      proposalId,
      items,
    }: {
      proposalId: string;
      items: Array<Omit<ProposalItemInsert, "proposal_id" | "tenant_id">>;
    }) => {
      const supabase = createClient();
      return upsertProposalItems(supabase, proposalId, tenantId!, items);
    },
    onSuccess: (_data, { proposalId }) => {
      qc.invalidateQueries({ queryKey: ["proposal", proposalId] });
    },
    onError: (err) => toast.error(`Erro ao salvar itens: ${err.message}`),
  });
}
