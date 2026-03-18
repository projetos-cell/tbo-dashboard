"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import { toast } from "sonner";
import {
  getMonthlyData,
  upsertMonthlyData,
  getRdMonthlySnapshot,
} from "@/features/comercial/services/commercial-monthly";
import type { Database } from "@/lib/supabase/types";

type MonthlyInsert = Database["public"]["Tables"]["commercial_monthly_data"]["Insert"];

export function useCommercialMonthly(yearMonth: string) {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["commercial-monthly", tenantId, yearMonth],
    queryFn: async () => {
      const supabase = createClient();
      return getMonthlyData(supabase, yearMonth);
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!tenantId && !!yearMonth,
  });
}

export function useRdMonthlySnapshot(yearMonth: string) {
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["rd-monthly-snapshot", tenantId, yearMonth],
    queryFn: async () => {
      const supabase = createClient();
      return getRdMonthlySnapshot(supabase, yearMonth);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!yearMonth,
  });
}

export function useUpsertCommercialMonthly() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MonthlyInsert) => {
      const supabase = createClient();
      return upsertMonthlyData(supabase, payload);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ["commercial-monthly"],
      });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "update",
        table: "commercial_monthly_data",
        recordId: variables.year_month,
        after: variables as unknown as Record<string, unknown>,
      });

      toast.success("Dados comerciais salvos");
    },
    onError: (err) => {
      toast.error(`Erro ao salvar dados: ${err.message}`);
    },
  });
}
