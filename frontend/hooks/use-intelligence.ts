"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getIntelligenceKpis,
  getAiInsights,
  getIntelligenceTrends,
} from "@/services/intelligence";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function useIntelligenceKpis() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["intelligence", "kpis", tenantId],
    queryFn: () => getIntelligenceKpis(supabase),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAiInsights() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["intelligence", "ai-insights", tenantId],
    queryFn: () => getAiInsights(supabase),
    staleTime: 1000 * 60 * 10,
  });
}

export function useIntelligenceTrends() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["intelligence", "trends", tenantId],
    queryFn: () => getIntelligenceTrends(supabase),
    staleTime: 1000 * 60 * 5,
  });
}

export function useGenerateInsights() {
  const supabase = useSupabase();
  const tenantId = useTenantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Sessão não encontrada");

      const res = await fetch("/api/intelligence/generate-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `Erro ${res.status}`);
      }

      return res.json() as Promise<{ count: number; generatedAt: string }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intelligence", "ai-insights", tenantId] });
    },
  });
}
