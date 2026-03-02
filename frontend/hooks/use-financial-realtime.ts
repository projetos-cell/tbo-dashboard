"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Subscribes to Supabase Realtime for financial tables.
 * On any INSERT / UPDATE / DELETE → invalidates the matching React Query key
 * so tables and KPIs refresh automatically.
 *
 * Tables monitored:
 *  - fin_payables   → ["fin-payables"]
 *  - fin_receivables → ["fin-receivables"]
 */
export function useFinancialRealtime() {
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`fin-realtime:${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fin_payables",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["fin-payables"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fin_receivables",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["fin-receivables"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, qc]);
}
