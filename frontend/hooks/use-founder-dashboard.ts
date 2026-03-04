"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getFounderDashboardSnapshot,
  type FounderDashboardSnapshot,
} from "@/services/founder-dashboard";

const EMPTY_SNAPSHOT: FounderDashboardSnapshot = {
  receitaRealizada: 0,
  margemReal: 0,
  margemPct: 0,
  runway: 0,
  caixaAtual: 0,
  burnRate: 0,
  breakEven: 0,
  caixaPrevisto30d: 0,
  arNext30: 0,
  apNext30: 0,
  unitRevenue: [],
  topProjectsByMargin: [],
  topClientsByRevenue: [],
  concentracaoTop3: 0,
  alerts: [],
  forecast90d: { total: 0, months: [] },
};

export function useFounderDashboard() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  const query = useQuery<FounderDashboardSnapshot>({
    queryKey: ["founder-dashboard", tenantId],
    queryFn: async () => {
      if (!tenantId) return EMPTY_SNAPSHOT;
      const supabase = createClient();
      return getFounderDashboardSnapshot(supabase, tenantId);
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });

  // Realtime — invalidate when transactions change
  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`founder-dash-realtime:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "finance_transactions",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          qc.invalidateQueries({
            queryKey: ["founder-dashboard", tenantId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, qc]);

  return query;
}
