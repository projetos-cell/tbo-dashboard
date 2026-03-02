"use client";

import { useMemo } from "react";
import {
  usePayables,
  useReceivables,
  useLatestBalanceSnapshot,
  useFinClients,
  useCostCenters,
} from "@/hooks/use-financial";
import {
  computeExecutiveKPIs,
  computeInboxAlerts,
  computeInsights,
} from "@/services/financial";

/**
 * Fetches all unfiltered financial data and computes KPIs, alerts, and insights.
 * Used by the dashboard, caixa, estrategico, clientes, and simulacoes tabs.
 */
export function useFinancialData() {
  const { data: allPayables = [] } = usePayables();
  const { data: allReceivables = [] } = useReceivables();
  const { data: balanceSnapshot } = useLatestBalanceSnapshot();
  const { data: clients = [] } = useFinClients();
  const { data: costCenters = [] } = useCostCenters();

  const initialBalance = balanceSnapshot?.balance ?? 0;

  const executiveKpis = useMemo(
    () => computeExecutiveKPIs(allPayables, allReceivables, initialBalance),
    [allPayables, allReceivables, initialBalance]
  );

  const alerts = useMemo(
    () => computeInboxAlerts(allPayables, allReceivables),
    [allPayables, allReceivables]
  );

  const insights = useMemo(
    () =>
      computeInsights(
        allPayables,
        allReceivables,
        clients,
        costCenters,
        initialBalance
      ),
    [allPayables, allReceivables, clients, costCenters, initialBalance]
  );

  return {
    allPayables,
    allReceivables,
    initialBalance,
    executiveKpis,
    alerts,
    insights,
  };
}
