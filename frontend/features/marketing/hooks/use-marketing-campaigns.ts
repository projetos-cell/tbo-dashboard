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
  getCampaignPieces,
  createCampaignPiece,
  getCampaignBudget,
  createBudgetItem,
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
  return useMutation({
    mutationFn: (id: string) => deleteCampaign(createClient(), id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      toast.success("Campanha excluida");
    },
    onError: () => toast.error("Erro ao excluir campanha"),
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
