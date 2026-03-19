"use client";

// ── use-boletos — React Query hooks for finance_boletos ───────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  listBoletos,
  getBoletosSummary,
  createBoleto,
  updateBoleto,
  cancelBoleto,
  markRemessaSent,
  markOverdueBoletos,
} from "@/features/financeiro/services/boleto-service";
import { createBoletoData } from "@/features/financeiro/services/boleto-generator";
import type { BoletoFilters, BoletoGenerateParams } from "@/lib/supabase/types/boletos";

const QUERY_KEYS = {
  list: (tenantId: string, filters: BoletoFilters) =>
    ["boletos", tenantId, filters] as const,
  summary: (tenantId: string) => ["boletos-summary", tenantId] as const,
};

// ── List ──────────────────────────────────────────────────────────────────────

export function useBoletos(filters: BoletoFilters = {}) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();

  return useQuery({
    queryKey: QUERY_KEYS.list(tenantId ?? "", filters),
    queryFn: () => listBoletos(supabase, tenantId!, filters),
    enabled: !!tenantId,
  });
}

// ── Summary ───────────────────────────────────────────────────────────────────

export function useBoletosSummary() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();

  return useQuery({
    queryKey: QUERY_KEYS.summary(tenantId ?? ""),
    queryFn: () => getBoletosSummary(supabase, tenantId!),
    enabled: !!tenantId,
  });
}

// ── Generate + Create ─────────────────────────────────────────────────────────

export function useGenerateBoleto() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: BoletoGenerateParams) => {
      const { nossoNumero, barcode, digitableLine } = createBoletoData(params);

      return createBoleto(supabase, {
        tenant_id: params.tenantId,
        invoice_id: params.invoiceId ?? null,
        barcode,
        digitable_line: digitableLine,
        due_date: params.dueDate,
        amount: params.amount,
        nosso_numero: nossoNumero,
        payer_name: params.payerName,
        payer_document: params.payerDocument,
        payer_address: params.payerAddress,
        instructions: params.instructions ?? null,
        created_by: userId ?? null,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["boletos", tenantId ?? ""],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.summary(tenantId ?? ""),
      });
    },
  });
}

// ── Cancel boleto ─────────────────────────────────────────────────────────────

export function useCancelBoleto() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelBoleto(supabase, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["boletos", tenantId ?? ""],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.summary(tenantId ?? ""),
      });
    },
  });
}

// ── Mark remessa sent ─────────────────────────────────────────────────────────

export function useMarkRemessaSent() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => markRemessaSent(supabase, ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["boletos", tenantId ?? ""],
      });
    },
  });
}

// ── Upload retorno file ───────────────────────────────────────────────────────

export function useUploadRetorno() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tenant_id", tenantId ?? "");

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL not set");

      const res = await fetch(
        `${supabaseUrl}/functions/v1/process-bank-return`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`process-bank-return failed: ${body}`);
      }

      return res.json() as Promise<{
        totalRecords: number;
        paid: number;
        errors: number;
        updated: number;
        skipped: number;
      }>;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["boletos", tenantId ?? ""],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.summary(tenantId ?? ""),
      });
    },
  });
}

// ── Mark overdue ──────────────────────────────────────────────────────────────

export function useMarkOverdue() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markOverdueBoletos(supabase, tenantId!),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["boletos", tenantId ?? ""],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.summary(tenantId ?? ""),
      });
    },
  });
}

// ── Update boleto ─────────────────────────────────────────────────────────────

export function useUpdateBoleto() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: Parameters<typeof updateBoleto>[2] extends infer P
      ? { id: string; payload: P }
      : never) =>
      updateBoleto(supabase, id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["boletos", tenantId ?? ""],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.summary(tenantId ?? ""),
      });
    },
  });
}
