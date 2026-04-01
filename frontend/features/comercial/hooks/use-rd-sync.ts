"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getRdConfig,
  saveRdConfig,
  getRdSyncLogs,
  triggerRdSync,
  testRdConnection,
} from "@/features/comercial/services/rd-sync";

const supabase = createClient();

export function useRdConfig() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["rd-config", tenantId],
    queryFn: () => getRdConfig(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useSaveRdConfig() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: { api_token?: string; enabled?: boolean }) =>
      saveRdConfig(supabase, tenantId!, config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rd-config", tenantId] }),
  });
}

export function useRdSyncLogs() {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["rd-sync-logs", tenantId],
    queryFn: () => getRdSyncLogs(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
    refetchInterval: 15_000,
  });
}

export function useTriggerRdSync() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => triggerRdSync(tenantId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rd-sync-logs", tenantId] });
      qc.invalidateQueries({ queryKey: ["rd-config", tenantId] });
      qc.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useTestRdConnection() {
  return useMutation({
    mutationFn: (token: string) => testRdConnection(token),
  });
}
