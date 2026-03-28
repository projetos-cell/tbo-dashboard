"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

import {
  createProposalVersion,
  getProposalVersions,
} from "@/features/comercial/services/proposal-versions";

import {
  generateClientToken,
  getProposalByToken,
} from "@/features/comercial/services/proposal-client-link";

import {
  convertProposalToContract,
  convertProposalToProject,
  getConversionStatus,
} from "@/features/comercial/services/proposal-conversion";

import {
  getComplexityRules,
  createComplexityRule,
  updateComplexityRule,
  deleteComplexityRule,
  type ComplexityRuleInsert,
  type ComplexityRuleUpdate,
} from "@/features/comercial/services/pricing-complexity";

// ─── Version hooks ────────────────────────────────────────────────────────────

export function useProposalVersions(proposalId: string | null) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["proposal-versions", proposalId, tenantId],
    queryFn: async () => {
      const supabase = createClient();
      return getProposalVersions(supabase, proposalId!);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!proposalId && !!tenantId,
  });
}

export function useCreateProposalVersion() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (originalId: string) => {
      const supabase = createClient();
      return createProposalVersion(supabase, originalId);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
      qc.invalidateQueries({ queryKey: ["proposal-versions", data.parent_proposal_id ?? data.id] });
      toast.success(`Versão ${data.version} criada com sucesso`);
    },
    onError: (err: Error) => toast.error(`Erro ao criar versão: ${err.message}`),
  });
}

// ─── Client link hooks ────────────────────────────────────────────────────────

export function useGenerateClientToken() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: string) => {
      const supabase = createClient();
      return generateClientToken(supabase, proposalId);
    },
    onSuccess: (_token, proposalId) => {
      qc.invalidateQueries({ queryKey: ["proposal", proposalId] });
      qc.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Link do cliente gerado");
    },
    onError: (err: Error) => toast.error(`Erro ao gerar link: ${err.message}`),
  });
}

export function useProposalByToken(token: string | null) {
  return useQuery({
    queryKey: ["proposal-by-token", token],
    queryFn: async () => {
      const supabase = createClient();
      return getProposalByToken(supabase, token!);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!token,
    retry: false,
  });
}

// ─── Conversion hooks ─────────────────────────────────────────────────────────

export function useConversionStatus(proposalId: string | null) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["proposal-conversion", proposalId, tenantId],
    queryFn: async () => {
      const supabase = createClient();
      return getConversionStatus(supabase, proposalId!);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!proposalId && !!tenantId,
  });
}

export function useConvertToContract() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: async (proposalId: string) => {
      const supabase = createClient();
      return convertProposalToContract(supabase, proposalId, tenantId!);
    },
    onSuccess: (_data, proposalId) => {
      qc.invalidateQueries({ queryKey: ["proposal", proposalId] });
      qc.invalidateQueries({ queryKey: ["proposal-conversion", proposalId] });
      toast.success("Contrato criado a partir da proposta");
    },
    onError: (err: Error) => toast.error(`Erro ao criar contrato: ${err.message}`),
  });
}

export function useConvertToProject() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: async (proposalId: string) => {
      const supabase = createClient();
      return convertProposalToProject(supabase, proposalId, tenantId!);
    },
    onSuccess: (_data, proposalId) => {
      qc.invalidateQueries({ queryKey: ["proposal", proposalId] });
      qc.invalidateQueries({ queryKey: ["proposal-conversion", proposalId] });
      toast.success("Projeto criado a partir da proposta");
    },
    onError: (err: Error) => toast.error(`Erro ao criar projeto: ${err.message}`),
  });
}

// ─── Complexity rules hooks ───────────────────────────────────────────────────

export function useComplexityRules() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["complexity-rules", tenantId],
    queryFn: async () => {
      const supabase = createClient();
      return getComplexityRules(supabase);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateComplexityRule() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: async (input: Omit<ComplexityRuleInsert, "tenant_id">) => {
      const supabase = createClient();
      return createComplexityRule(supabase, { ...input, tenant_id: tenantId! });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complexity-rules"] });
      toast.success("Regra de complexidade criada");
    },
    onError: (err: Error) => toast.error(`Erro ao criar regra: ${err.message}`),
  });
}

export function useUpdateComplexityRule() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ComplexityRuleUpdate }) => {
      const supabase = createClient();
      return updateComplexityRule(supabase, id, updates);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complexity-rules"] });
      toast.success("Regra atualizada");
    },
    onError: (err: Error) => toast.error(`Erro ao atualizar regra: ${err.message}`),
  });
}

export function useDeleteComplexityRule() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      return deleteComplexityRule(supabase, id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complexity-rules"] });
      toast.success("Regra removida");
    },
    onError: (err: Error) => toast.error(`Erro ao remover regra: ${err.message}`),
  });
}
