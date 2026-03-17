"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getContentItems,
  getContentItem,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  getContentBriefs,
  createContentBrief,
  updateContentBrief,
  getContentAssets,
  uploadContentAsset,
  deleteContentAsset,
  getContentApprovals,
  updateApprovalStatus,
} from "../services/marketing-content";
import type {
  ContentItem,
  ContentBrief,
  ContentAsset,
  ContentApproval,
} from "../types/marketing";
import { toast } from "sonner";

// ── Content Items ──────────────────────────────────────────────────

export function useContentItems() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["marketing-content", tenantId],
    queryFn: () => getContentItems(createClient()),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useContentItem(id: string | null) {
  return useQuery({
    queryKey: ["marketing-content", id],
    queryFn: () => getContentItem(createClient(), id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateContentItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ContentItem, "id" | "created_at" | "updated_at">) =>
      createContentItem(createClient(), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-content"] });
      toast.success("Conteudo criado");
    },
    onError: () => toast.error("Erro ao criar conteudo"),
  });
}

export function useUpdateContentItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContentItem> }) =>
      updateContentItem(createClient(), id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-content"] });
      toast.success("Conteudo atualizado");
    },
    onError: () => toast.error("Erro ao atualizar conteudo"),
  });
}

export function useDeleteContentItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContentItem(createClient(), id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-content"] });
      toast.success("Conteudo excluido");
    },
    onError: () => toast.error("Erro ao excluir conteudo"),
  });
}

// ── Briefs ─────────────────────────────────────────────────────────

export function useContentBriefs() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["marketing-content-briefs", tenantId],
    queryFn: () => getContentBriefs(createClient()),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateContentBrief() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ContentBrief, "id" | "created_at" | "updated_at">) =>
      createContentBrief(createClient(), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-content-briefs"] });
      toast.success("Brief criado");
    },
    onError: () => toast.error("Erro ao criar brief"),
  });
}

export function useUpdateContentBrief() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContentBrief> }) =>
      updateContentBrief(createClient(), id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-content-briefs"] });
      toast.success("Brief atualizado");
    },
    onError: () => toast.error("Erro ao atualizar brief"),
  });
}

// ── Assets ─────────────────────────────────────────────────────────

export function useContentAssets() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["marketing-content-assets", tenantId],
    queryFn: () => getContentAssets(createClient()),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useUploadContentAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ContentAsset, "id" | "created_at">) =>
      uploadContentAsset(createClient(), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-content-assets"] });
      toast.success("Asset enviado");
    },
    onError: () => toast.error("Erro ao enviar asset"),
  });
}

export function useDeleteContentAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContentAsset(createClient(), id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-content-assets"] });
      toast.success("Asset excluido");
    },
    onError: () => toast.error("Erro ao excluir asset"),
  });
}

// ── Approvals ──────────────────────────────────────────────────────

export function useContentApprovals() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["marketing-content-approvals", tenantId],
    queryFn: () => getContentApprovals(createClient()),
    staleTime: 1000 * 60 * 2,
    enabled: !!tenantId,
  });
}

export function useUpdateApprovalStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, feedback }: { id: string; status: ContentApproval["status"]; feedback?: string }) =>
      updateApprovalStatus(createClient(), id, status, feedback),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-content-approvals"] });
      toast.success("Status de aprovacao atualizado");
    },
    onError: () => toast.error("Erro ao atualizar aprovacao"),
  });
}
