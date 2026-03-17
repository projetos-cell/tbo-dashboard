"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignBriefings,
  createCampaignBriefing,
  updateCampaignBriefing,
  getCampaignPieces,
  createCampaignPiece,
  updateCampaignPiece,
  deleteCampaignPiece,
  getCampaignBudget,
  createBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
} from "../services/marketing-campaigns";
import type {
  MarketingCampaign,
  CampaignBriefing,
  CampaignPiece,
  CampaignBudget,
} from "../types/marketing";
import { toast } from "sonner";

// ── Campaigns ──────────────────────────────────────────────────────

export function useMarketingCampaigns() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["marketing-campaigns", tenantId],
    queryFn: () => getCampaigns(createClient()),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useMarketingCampaign(id: string | null) {
  return useQuery({
    queryKey: ["marketing-campaigns", id],
    queryFn: () => getCampaign(createClient(), id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateMarketingCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<MarketingCampaign, "id" | "created_at" | "updated_at">) =>
      createCampaign(createClient(), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      toast.success("Campanha criada com sucesso");
    },
    onError: () => toast.error("Erro ao criar campanha"),
  });
}

export function useUpdateMarketingCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MarketingCampaign> }) =>
      updateCampaign(createClient(), id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      toast.success("Campanha atualizada");
    },
    onError: () => toast.error("Erro ao atualizar campanha"),
  });
}

export function useDeleteMarketingCampaign() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useMutation({
    mutationFn: (id: string) => deleteCampaign(createClient(), id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["marketing-campaigns", tenantId] });
      const previous = qc.getQueryData<MarketingCampaign[]>(["marketing-campaigns", tenantId]);
      qc.setQueryData<MarketingCampaign[]>(
        ["marketing-campaigns", tenantId],
        (old) => old?.filter((c) => c.id !== id) ?? [],
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(["marketing-campaigns", tenantId], ctx.previous);
      }
      toast.error("Erro ao excluir campanha");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      toast.success("Campanha excluída");
    },
  });
}

// Feature #70 — Favoritar campanha com optimistic update
export function useToggleFavoriteCampaign() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useMutation({
    mutationFn: ({ id, is_favorited }: { id: string; is_favorited: boolean }) =>
      updateCampaign(createClient(), id, { is_favorited }),
    onMutate: async ({ id, is_favorited }) => {
      await qc.cancelQueries({ queryKey: ["marketing-campaigns", tenantId] });
      const previous = qc.getQueryData<MarketingCampaign[]>(["marketing-campaigns", tenantId]);
      qc.setQueryData<MarketingCampaign[]>(
        ["marketing-campaigns", tenantId],
        (old) => old?.map((c) => c.id === id ? { ...c, is_favorited } : c) ?? [],
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(["marketing-campaigns", tenantId], ctx.previous);
      }
      toast.error("Erro ao atualizar favorito");
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      toast.success(vars.is_favorited ? "Campanha favoritada" : "Favorito removido");
    },
  });
}

export function useDuplicateMarketingCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (campaign: MarketingCampaign) =>
      createCampaign(createClient(), {
        tenant_id: campaign.tenant_id,
        name: `${campaign.name} (cópia)`,
        description: campaign.description,
        status: "planejamento",
        start_date: null,
        end_date: null,
        budget: campaign.budget,
        spent: null,
        owner_id: campaign.owner_id,
        owner_name: campaign.owner_name,
        channels: campaign.channels,
        tags: campaign.tags,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      toast.success("Campanha duplicada com sucesso");
    },
    onError: () => toast.error("Erro ao duplicar campanha"),
  });
}

// ── Briefings ──────────────────────────────────────────────────────

export function useCampaignBriefings(campaignId: string | null) {
  return useQuery({
    queryKey: ["marketing-campaigns", campaignId, "briefings"],
    queryFn: () => getCampaignBriefings(createClient(), campaignId!),
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCampaignBriefing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CampaignBriefing, "id" | "created_at" | "updated_at">) =>
      createCampaignBriefing(createClient(), data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns", variables.campaign_id, "briefings"] });
      toast.success("Briefing criado");
    },
    onError: () => toast.error("Erro ao criar briefing"),
  });
}

export function useUpdateCampaignBriefing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, campaignId, data }: { id: string; campaignId: string; data: Partial<CampaignBriefing> }) =>
      updateCampaignBriefing(createClient(), id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns", variables.campaignId, "briefings"] });
      toast.success("Briefing atualizado");
    },
    onError: () => toast.error("Erro ao atualizar briefing"),
  });
}

// ── Pieces ─────────────────────────────────────────────────────────

export function useCampaignPieces(campaignId: string | null) {
  return useQuery({
    queryKey: ["marketing-campaigns", campaignId, "pieces"],
    queryFn: () => getCampaignPieces(createClient(), campaignId!),
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCampaignPiece() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CampaignPiece, "id" | "created_at" | "updated_at">) =>
      createCampaignPiece(createClient(), data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns", variables.campaign_id, "pieces"] });
      toast.success("Peca adicionada");
    },
    onError: () => toast.error("Erro ao adicionar peca"),
  });
}

export function useUpdateCampaignPiece() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, campaignId, data }: { id: string; campaignId: string; data: Partial<CampaignPiece> }) =>
      updateCampaignPiece(createClient(), id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns", variables.campaignId, "pieces"] });
      toast.success("Peca atualizada");
    },
    onError: () => toast.error("Erro ao atualizar peca"),
  });
}

export function useDeleteCampaignPiece() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, campaignId }: { id: string; campaignId: string }) =>
      deleteCampaignPiece(createClient(), id),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns", variables.campaignId, "pieces"] });
      toast.success("Peca excluida");
    },
    onError: () => toast.error("Erro ao excluir peca"),
  });
}

// ── Budget ─────────────────────────────────────────────────────────

export function useCampaignBudget(campaignId: string | null) {
  return useQuery({
    queryKey: ["marketing-campaigns", campaignId, "budget"],
    queryFn: () => getCampaignBudget(createClient(), campaignId!),
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateBudgetItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CampaignBudget, "id" | "created_at">) =>
      createBudgetItem(createClient(), data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns", variables.campaign_id, "budget"] });
      toast.success("Item de budget adicionado");
    },
    onError: () => toast.error("Erro ao adicionar item de budget"),
  });
}

export function useUpdateBudgetItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, campaignId, data }: { id: string; campaignId: string; data: Partial<CampaignBudget> }) =>
      updateBudgetItem(createClient(), id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns", variables.campaignId, "budget"] });
      toast.success("Item atualizado");
    },
    onError: () => toast.error("Erro ao atualizar item"),
  });
}

export function useDeleteBudgetItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, campaignId }: { id: string; campaignId: string }) =>
      deleteBudgetItem(createClient(), id),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns", variables.campaignId, "budget"] });
      toast.success("Item removido");
    },
    onError: () => toast.error("Erro ao remover item"),
  });
}
