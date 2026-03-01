"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  listPayables,
  createPayable,
  updatePayable,
  deletePayable,
  listReceivables,
  createReceivable,
  updateReceivable,
  deleteReceivable,
  listCategories,
  listCostCenters,
  createCostCenter,
  updateCostCenter,
  listVendors,
  createVendor,
  updateVendor,
  listFinClients,
  createFinClient,
  updateFinClient,
  listBankTransactions,
  listBankImports,
  listReconciliationRules,
  createReconciliationRule,
  updateReconciliationRule,
  deleteReconciliationRule,
  listFinTransactions,
  listMonthlyClosings,
  getLatestBalanceSnapshot,
  createBalanceSnapshot,
} from "@/services/financial";
import { logAuditTrail } from "@/lib/audit-trail";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

// ── Payables ──────────────────────────────────────────────────

export function usePayables(filters?: {
  status?: string;
  cost_center_id?: string;
  search?: string;
}) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["fin-payables", tenantId, filters],
    queryFn: () => listPayables(supabase, tenantId!, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreatePayable() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Database["public"]["Tables"]["fin_payables"]["Insert"]) =>
      createPayable(supabase, p),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["fin-payables"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "create",
        table: "fin_payables",
        recordId: (data as Record<string, unknown>)?.id as string ?? "unknown",
        after: variables as unknown as Record<string, unknown>,
      });
    },
  });
}

export function useUpdatePayable() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["fin_payables"]["Update"];
    }) => updatePayable(supabase, id, updates),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["fin-payables"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "update",
        table: "fin_payables",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },
  });
}

export function useDeletePayable() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePayable(supabase, id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["fin-payables"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "delete",
        table: "fin_payables",
        recordId: id,
        before: { id },
      });
    },
  });
}

// ── Receivables ───────────────────────────────────────────────

export function useReceivables(filters?: {
  status?: string;
  client_id?: string;
  search?: string;
}) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["fin-receivables", tenantId, filters],
    queryFn: () => listReceivables(supabase, tenantId!, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateReceivable() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (r: Database["public"]["Tables"]["fin_receivables"]["Insert"]) =>
      createReceivable(supabase, r),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["fin-receivables"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "create",
        table: "fin_receivables",
        recordId: (data as Record<string, unknown>)?.id as string ?? "unknown",
        after: variables as unknown as Record<string, unknown>,
      });
    },
  });
}

export function useUpdateReceivable() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["fin_receivables"]["Update"];
    }) => updateReceivable(supabase, id, updates),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["fin-receivables"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "update",
        table: "fin_receivables",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },
  });
}

export function useDeleteReceivable() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReceivable(supabase, id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["fin-receivables"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "delete",
        table: "fin_receivables",
        recordId: id,
        before: { id },
      });
    },
  });
}

// ── Lookups ───────────────────────────────────────────────────

export function useFinCategories(type?: string) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["fin-categories", tenantId, type],
    queryFn: () => listCategories(supabase, tenantId!, type),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCostCenters() {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["fin-cost-centers", tenantId],
    queryFn: () => listCostCenters(supabase, tenantId!),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCostCenter() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cc: Database["public"]["Tables"]["fin_cost_centers"]["Insert"]) =>
      createCostCenter(supabase, cc),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["fin-cost-centers"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "create",
        table: "fin_cost_centers",
        recordId: (data as Record<string, unknown>)?.id as string ?? "unknown",
        after: variables as unknown as Record<string, unknown>,
      });
    },
  });
}

export function useUpdateCostCenter() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["fin_cost_centers"]["Update"];
    }) => updateCostCenter(supabase, id, updates),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["fin-cost-centers"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "update",
        table: "fin_cost_centers",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },
  });
}

export function useVendors(search?: string) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["fin-vendors", tenantId, search],
    queryFn: () => listVendors(supabase, tenantId!, search),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateVendor() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: Database["public"]["Tables"]["fin_vendors"]["Insert"]) =>
      createVendor(supabase, v),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["fin-vendors"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "create",
        table: "fin_vendors",
        recordId: (data as Record<string, unknown>)?.id as string ?? "unknown",
        after: variables as unknown as Record<string, unknown>,
      });
    },
  });
}

export function useUpdateVendor() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["fin_vendors"]["Update"];
    }) => updateVendor(supabase, id, updates),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["fin-vendors"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "update",
        table: "fin_vendors",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },
  });
}

export function useFinClients(search?: string) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["fin-clients", tenantId, search],
    queryFn: () => listFinClients(supabase, tenantId!, search),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateFinClient() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (c: Database["public"]["Tables"]["fin_clients"]["Insert"]) =>
      createFinClient(supabase, c),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["fin-clients"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "create",
        table: "fin_clients",
        recordId: (data as Record<string, unknown>)?.id as string ?? "unknown",
        after: variables as unknown as Record<string, unknown>,
      });
    },
  });
}

export function useUpdateFinClient() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["fin_clients"]["Update"];
    }) => updateFinClient(supabase, id, updates),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["fin-clients"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "update",
        table: "fin_clients",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },
  });
}

// ── Bank Transactions ────────────────────────────────────────

export function useBankTransactions(filters?: { import_id?: string; match_status?: string }) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["bank-transactions", tenantId, filters],
    queryFn: () => listBankTransactions(supabase, tenantId!, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useBankImports() {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["bank-imports", tenantId],
    queryFn: () => listBankImports(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ── Reconciliation Rules ─────────────────────────────────────

export function useReconciliationRules() {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["reconciliation-rules", tenantId],
    queryFn: () => listReconciliationRules(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateReconciliationRule() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rule: Database["public"]["Tables"]["reconciliation_rules"]["Insert"]) =>
      createReconciliationRule(supabase, rule),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["reconciliation-rules"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "create",
        table: "reconciliation_rules",
        recordId: (data as Record<string, unknown>)?.id as string ?? "unknown",
        after: variables as unknown as Record<string, unknown>,
      });
    },
  });
}

export function useUpdateReconciliationRule() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["reconciliation_rules"]["Update"];
    }) => updateReconciliationRule(supabase, id, updates),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["reconciliation-rules"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "update",
        table: "reconciliation_rules",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },
  });
}

export function useDeleteReconciliationRule() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReconciliationRule(supabase, id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["reconciliation-rules"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "delete",
        table: "reconciliation_rules",
        recordId: id,
        before: { id },
      });
    },
  });
}

// ── Financial Transactions ───────────────────────────────────

export function useFinTransactions(filters?: { category_id?: string; type?: string; month?: string }) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["fin-transactions", tenantId, filters],
    queryFn: () => listFinTransactions(supabase, tenantId!, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ── Monthly Closings ─────────────────────────────────────────

export function useMonthlyClosings() {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["monthly-closings", tenantId],
    queryFn: () => listMonthlyClosings(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ── Balance Snapshots ────────────────────────────────────────

export function useLatestBalanceSnapshot() {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["balance-snapshot", tenantId],
    queryFn: () => getLatestBalanceSnapshot(supabase, tenantId!),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBalanceSnapshot() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (snapshot: Database["public"]["Tables"]["fin_balance_snapshots"]["Insert"]) =>
      createBalanceSnapshot(supabase, snapshot),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ["balance-snapshot"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "create",
        table: "fin_balance_snapshots",
        recordId: (data as Record<string, unknown>)?.id as string ?? "unknown",
        after: variables as unknown as Record<string, unknown>,
      });
    },
  });
}
