"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getFounderDashboardSnapshot,
  type FounderDashboardSnapshot,
} from "@/features/founder-dashboard/services/founder-dashboard";
import {
  resolvePeriodBounds,
  type PeriodValue,
} from "@/features/founder-dashboard/components/period-filter";

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
  allClientsByRevenue: [],
  concentracaoTop3: 0,
  alerts: [],
  forecast90d: { total: 0, months: [] },
  monthlyTrend: [],
  periodLabel: "MTD",
  mrrReceita: 0,
  pontualReceita: 0,
  pmr: null,
  pmp: null,
  inadimplenciaTotal: 0,
  inadimplenciaPct: 0,
  inadimplenciaCount: 0,
  clientMargins: [],
  receitaPorColaborador: 0,
  headcount: 0,
  expiringContracts: [],
  forecastProposalsTotal: 0,
  folhaPagamento: 0,
  custosOperacionais: 0,
  folhaPct: 0,
  operacionalPct: 0,
  churnRate: 0,
  churnHistory: [],
};

export function useFounderDashboard(period?: PeriodValue) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  // Resolve period bounds so they become part of the query key
  const bounds = period ? resolvePeriodBounds(period) : undefined;

  const query = useQuery<FounderDashboardSnapshot>({
    queryKey: ["founder-dashboard", tenantId, bounds?.from, bounds?.to],
    queryFn: async () => {
      if (!tenantId) return EMPTY_SNAPSHOT;
      const supabase = createClient();
      return getFounderDashboardSnapshot(supabase, tenantId, bounds);
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });

  // Realtime — invalidate when finance_transactions or fin_bank_accounts change
  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient();
    const queryKey = ["founder-dashboard", tenantId];
    const invalidate = () => qc.invalidateQueries({ queryKey });

    const channelTx = supabase
      .channel(`founder-dash-tx:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "finance_transactions",
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
          table: "finance_bank_accounts",
          filter: `tenant_id=eq.${tenantId}`,
        },
        invalidate,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelTx);
      supabase.removeChannel(channelBank);
    };
  }, [tenantId, qc]);

  return query;
}
