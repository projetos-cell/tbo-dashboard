"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { getOmieSyncLogs, triggerOmieSync } from "@/services/omie-sync";

// ── helpers ──────────────────────────────────────────────────

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

// ── Sync Logs ────────────────────────────────────────────────

export function useOmieSyncLogs() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["omie-sync-logs", tenantId],
    queryFn: () => getOmieSyncLogs(supabase, tenantId!),
    enabled: !!tenantId,
    refetchInterval: 15_000, // polling a cada 15s para acompanhar sync em andamento
  });
}

// ── Trigger Sync ─────────────────────────────────────────────

export function useTriggerOmieSync() {
  const supabase = useSupabase();
  const tenantId = useTenantId();
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => triggerOmieSync(supabase, tenantId!, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["omie-sync-logs"] });
    },
  });
}
