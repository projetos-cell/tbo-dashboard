"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { getPages, searchPages, getPageStats } from "@/services/conteudo";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function usePages() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["pages", tenantId],
    queryFn: () => getPages(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useSearchPages(query: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["pages", "search", tenantId, query],
    queryFn: () => searchPages(supabase, tenantId!, query),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && query.length >= 2,
  });
}

export function usePageStats() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["pages", "stats", tenantId],
    queryFn: () => getPageStats(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}
