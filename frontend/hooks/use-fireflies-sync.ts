"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { getFirefliesSyncLogs, triggerFirefliesSync, getFirefliesConfig, saveFirefliesConfig } from "@/services/fireflies-sync";

const supabase = createClient();

export function useFirefliesSyncLogs() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["fireflies-sync-logs", tenantId],
    queryFn: () => getFirefliesSyncLogs(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
    refetchInterval: 15_000,
  });
}

export function useTriggerFirefliesSync() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => triggerFirefliesSync(supabase, tenantId!, userId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fireflies-sync-logs", tenantId] }),
  });
}

export function useFirefliesConfig() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["fireflies-config", tenantId],
    queryFn: () => getFirefliesConfig(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useSaveFirefliesConfig() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: { api_key?: string; enabled?: boolean; auto_sync?: boolean }) =>
      saveFirefliesConfig(supabase, tenantId!, config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fireflies-config", tenantId] }),
  });
}
