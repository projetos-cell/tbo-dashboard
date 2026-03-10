"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getOmieSyncLogs,
  triggerOmieSync,
  testOmieConnection,
  type OmieSyncLog,
} from "@/features/financeiro/services/omie-sync";

// ── Query: Recent sync logs ──────────────────────────────────────────────────

export function useOmieSyncLogs() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  // Standard React Query fetch
  const query = useQuery<OmieSyncLog[]>({
    queryKey: ["omie-sync-logs", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const supabase = createClient();
      return getOmieSyncLogs(supabase);
    },
    enabled: !!tenantId,
    staleTime: 1000 * 30, // 30s — syncs change frequently
    refetchInterval: 1000 * 60, // Poll every 60s as fallback
  });

  // Realtime subscription on omie_sync_log
  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`omie-sync-realtime:${tenantId}`)
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, qc]);

  return query;
}

// ── Mutation: Trigger sync ───────────────────────────────────────────────────

export function useTriggerOmieSync() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: triggerOmieSync,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["omie-sync-logs", tenantId] });
    },
  });
}

// ── Mutation: Test connection ────────────────────────────────────────────────

export function useTestOmieConnection() {
  return useMutation({
    mutationFn: testOmieConnection,
  });
}
