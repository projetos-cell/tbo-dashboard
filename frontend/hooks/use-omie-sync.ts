"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getOmieSyncLogs,
  cleanupStaleSyncs,
  getLastSuccessfulSync,
  triggerSync,
  testOmieConnection,
} from "@/services/omie-sync";

// ── helpers ──────────────────────────────────────────────────

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

// ── Sync Logs (with Realtime subscription) ───────────────────

export function useOmieSyncLogs() {
  const supabase = useSupabase();
  const tenantId = useTenantId();
  const qc = useQueryClient();

  // Cleanup stale syncs on mount
  useEffect(() => {
    if (!tenantId) return;
    cleanupStaleSyncs(supabase, tenantId).catch(() => {
      /* ignore cleanup errors */
    });
  }, [supabase, tenantId]);

  // Realtime subscription replaces 30s polling
  useEffect(() => {
    if (!tenantId) return;
    const channel = supabase
      .channel(`sync-log:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "omie_sync_log",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["omie-sync-logs", tenantId] });
          qc.invalidateQueries({ queryKey: ["omie-last-sync", tenantId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, tenantId, qc]);

  return useQuery({
    queryKey: ["omie-sync-logs", tenantId],
    queryFn: () => getOmieSyncLogs(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
    // Fallback polling at 60s in case Realtime disconnects
    refetchInterval: 60_000,
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

// ── Trigger Sync ─────────────────────────────────────────────

export function useTriggerSync() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: triggerSync,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["omie-sync-logs"] });
      qc.invalidateQueries({ queryKey: ["omie-last-sync"] });
      // Invalidate financial data queries so tables refresh
      qc.invalidateQueries({ queryKey: ["fin-payables"] });
      qc.invalidateQueries({ queryKey: ["fin-receivables"] });
      qc.invalidateQueries({ queryKey: ["fin-vendors"] });
      qc.invalidateQueries({ queryKey: ["fin-clients"] });
      qc.invalidateQueries({ queryKey: ["fin-categories"] });
      qc.invalidateQueries({ queryKey: ["fin-cost-centers"] });
    },
  });
}

// ── Test Connection ──────────────────────────────────────────

export function useTestOmieConnection() {
  return useMutation({
    mutationFn: testOmieConnection,
  });
}

// ── Invalidate sync logs ────────────────────────────────────

export function useInvalidateSyncLogs() {
  const qc = useQueryClient();
  return useCallback(
    () => qc.invalidateQueries({ queryKey: ["omie-sync-logs"] }),
    [qc]
  );
}
