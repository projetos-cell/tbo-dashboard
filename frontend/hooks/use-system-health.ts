"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getSystemHealthSummary,
  getRecentSyncErrors,
  getIntegrationConfigs,
} from "@/services/system-health";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function useSystemHealth() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["system-health", tenantId],
    queryFn: () => getSystemHealthSummary(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
    refetchInterval: 60_000, // refresh every minute
  });
}

export function useRecentSyncErrors() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["system-health", "errors", tenantId],
    queryFn: () => getRecentSyncErrors(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useIntegrationConfigs() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["system-health", "integrations", tenantId],
    queryFn: () => getIntegrationConfigs(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}
