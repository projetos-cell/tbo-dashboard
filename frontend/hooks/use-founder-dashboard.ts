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
  periodLabel: "MTD",
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

  // Realtime — invalidate when legacy fin_payables or fin_receivables change
  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient();
    const queryKey = ["founder-dashboard", tenantId];
    const invalidate = () => qc.invalidateQueries({ queryKey });

    const channelAP = supabase
      .channel(`founder-dash-ap:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fin_payables",
          filter: `tenant_id=eq.${tenantId}`,
        },
        invalidate,
      )
      .subscribe();

    const channelAR = supabase
      .channel(`founder-dash-ar:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fin_receivables",
          filter: `tenant_id=eq.${tenantId}`,
        },
        invalidate,
      )
      .subscribe();

    const channelBank = supabase
      .channel(`founder-dash-bank:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fin_bank_accounts",
          filter: `tenant_id=eq.${tenantId}`,
        },
        invalidate,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelAP);
      supabase.removeChannel(channelAR);
      supabase.removeChannel(channelBank);
    };
  }, [tenantId, qc]);

  return query;
}
