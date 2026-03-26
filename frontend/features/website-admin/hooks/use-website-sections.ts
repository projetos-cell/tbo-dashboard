"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getWebsiteSections,
  upsertWebsiteSection,
  updateWebsiteSection,
  deleteWebsiteSection,
  seedDefaultSections,
} from "../services/website-sections";
import type { WebsiteSectionUpsert } from "../types";
import { toast } from "sonner";

const QK = "website-sections";

export function useWebsiteSections(page?: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: [QK, tenantId, page],
    queryFn: () => getWebsiteSections(createClient(), page),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useUpsertWebsiteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WebsiteSectionUpsert) =>
      upsertWebsiteSection(createClient(), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success("Seção atualizada");
    },
    onError: () => toast.error("Erro ao atualizar seção"),
  });
}

export function useUpdateWebsiteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ title: string | null; subtitle: string | null; content: Record<string, unknown>; media_url: string | null; cta_label: string | null; cta_url: string | null; is_visible: boolean; sort_order: number }>;
    }) => updateWebsiteSection(createClient(), id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success("Seção atualizada");
    },
    onError: () => toast.error("Erro ao atualizar seção"),
  });
}

export function useDeleteWebsiteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWebsiteSection(createClient(), id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success("Seção removida");
    },
    onError: () => toast.error("Erro ao remover seção"),
  });
}

export function useSeedDefaultSections() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useMutation({
    mutationFn: (page: string) =>
      seedDefaultSections(createClient(), tenantId!, page),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
    },
  });
}
