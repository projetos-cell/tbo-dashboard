"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getOperationalIndicators,
  upsertOperationalIndicator,
  type OperationalIndicator,
  type UpsertOperationalIndicatorInput,
} from "@/features/financeiro/services/operational-indicators";

const QK_PREFIX = "fin-op-indicators";

// ── Single month ──────────────────────────────────────────────────────────────

export function useOperationalIndicators(month: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  const query = useQuery<OperationalIndicator | null>({
    queryKey: [QK_PREFIX, tenantId, month],
    queryFn: async () => {
      if (!tenantId) return null;
      const supabase = createClient();
      return getOperationalIndicators(supabase, tenantId, month);
    },
    enabled: !!tenantId && !!month,
    staleTime: 1000 * 60,
  });

  // Realtime: invalidate whenever the table changes for this tenant
  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`fin-op-indicators-rt:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "finance_operational_indicators",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: [QK_PREFIX, tenantId] });
          // Also refresh founder dashboard so KPIs recalculate
          qc.invalidateQueries({ queryKey: ["founder-dashboard", tenantId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, qc]);

  return query;
}

// ── Upsert mutation ───────────────────────────────────────────────────────────

export function useUpsertOperationalIndicator() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation<OperationalIndicator, Error, UpsertOperationalIndicatorInput>({
    mutationFn: async (input) => {
      if (!tenantId) throw new Error("Tenant não identificado.");
      if (!userId) throw new Error("Usuário não identificado.");
      const supabase = createClient();
      return upsertOperationalIndicator(supabase, tenantId, userId, input);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [QK_PREFIX, tenantId, variables.month] });
      qc.invalidateQueries({ queryKey: [QK_PREFIX, tenantId] });
      // Propagate to founder dashboard KPIs
      qc.invalidateQueries({ queryKey: ["founder-dashboard", tenantId] });
    },
  });
}
