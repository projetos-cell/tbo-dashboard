"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  listResearch,
  getResearchById,
  createResearch,
  updateResearch,
  deleteResearch,
  listSources,
  createSource,
  deleteSource,
} from "@/services/mercado";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

// ── Research ──────────────────────────────────────────────────

export function useMarketResearch(filters?: {
  category?: string;
  status?: string;
  search?: string;
}) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["market-research", tenantId, filters],
    queryFn: () => listResearch(supabase, tenantId!, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useMarketResearchById(id: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["market-research-detail", id],
    queryFn: () => getResearchById(supabase, id!),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}

export function useCreateResearch() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (r: Database["public"]["Tables"]["market_research"]["Insert"]) =>
      createResearch(supabase, r),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["market-research"] }),
  });
}

export function useUpdateResearch() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["market_research"]["Update"];
    }) => updateResearch(supabase, id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["market-research"] });
      qc.invalidateQueries({ queryKey: ["market-research-detail"] });
    },
  });
}

export function useDeleteResearch() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResearch(supabase, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["market-research"] }),
  });
}

// ── Sources ───────────────────────────────────────────────────

export function useMarketSources(researchId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["market-sources", researchId],
    queryFn: () => listSources(supabase, researchId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!researchId,
  });
}

export function useCreateSource() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (source: Database["public"]["Tables"]["market_sources"]["Insert"]) =>
      createSource(supabase, source),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["market-sources"] }),
  });
}

export function useDeleteSource() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSource(supabase, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["market-sources"] }),
  });
}
