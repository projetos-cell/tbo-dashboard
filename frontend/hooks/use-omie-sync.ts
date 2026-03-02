"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getOmieSyncLogs,
  cleanupStaleSyncs,
  getLastSuccessfulSync,
} from "@/services/omie-sync";

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

  // Cleanup stale syncs on mount
  useEffect(() => {
    if (!tenantId) return;
    cleanupStaleSyncs(supabase, tenantId).catch(() => {
      /* ignore cleanup errors */
    });
  }, [supabase, tenantId]);

  return useQuery({
    queryKey: ["omie-sync-logs", tenantId],
    queryFn: () => getOmieSyncLogs(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
    refetchInterval: 30_000, // polling a cada 30s
  });
}

// ── Last Successful Sync ────────────────────────────────────

export function useLastSuccessfulSync() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["omie-last-sync", tenantId],
    queryFn: () => getLastSuccessfulSync(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ── Invalidate sync logs ────────────────────────────────────

export function useInvalidateSyncLogs() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["omie-sync-logs"] });
}
