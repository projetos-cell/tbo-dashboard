"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getMarketingKPIs,
  getFunnelData,
  getChannelAttribution,
  getMarketingReports,
  getMarketingReport,
  createMarketingReport,
} from "../services/marketing-analytics";
import type { MarketingReport } from "../types/marketing";
import { toast } from "sonner";

export function useMarketingKPIs(period?: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["marketing-kpis", tenantId, period ?? "mes_atual"],
    queryFn: () => getMarketingKPIs(createClient(), period),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useFunnelData(period?: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["marketing-funnel", tenantId, period ?? "mes_atual"],
    queryFn: () => getFunnelData(createClient(), period),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useChannelAttribution() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["marketing-attribution", tenantId],
    queryFn: () => getChannelAttribution(createClient()),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useMarketingReports() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["marketing-reports", tenantId],
    queryFn: () => getMarketingReports(createClient()),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useMarketingReport(id: string | null) {
  return useQuery({
    queryKey: ["marketing-reports", id],
    queryFn: () => getMarketingReport(createClient(), id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateMarketingReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<MarketingReport, "id" | "created_at">) =>
      createMarketingReport(createClient(), data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketing-reports"] });
      toast.success("Relatorio criado");
    },
    onError: () => toast.error("Erro ao criar relatorio"),
  });
}
