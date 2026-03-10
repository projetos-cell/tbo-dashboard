"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { getRdSyncLogs, triggerRdSync, getRdConfig, saveRdConfig } from "@/features/comercial/services/rdstation";

export function useRdSyncLogs() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["rd-sync-logs", tenantId],
    queryFn: () => {
      const supabase = createClient();
      return getRdSyncLogs(supabase);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
    refetchInterval: 15_000,
  });
}

export function useTriggerRdSync() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => {
      const supabase = createClient();
      return triggerRdSync(supabase, tenantId!, userId!);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rd-sync-logs", tenantId] }),
  });
}

export function useRdConfig() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["rd-config", tenantId],
    queryFn: () => {
      const supabase = createClient();
      return getRdConfig(supabase);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useSaveRdConfig() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: { api_token?: string; enabled?: boolean; base_url?: string }) => {
      const supabase = createClient();
      return saveRdConfig(supabase, tenantId!, config);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rd-config", tenantId] }),
  });
}
