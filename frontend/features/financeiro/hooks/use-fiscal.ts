/**
 * use-fiscal.ts
 * React Query hooks para o motor fiscal (NF-e, configuração de impostos, relatório).
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import {
  getTaxConfig,
  listNotasFiscais,
  createNotaFiscal,
  updateNotaFiscal,
  cancelarNF,
  getFiscalMonthlyReport,
  upsertTaxConfig,
  type NotaFiscalFilters,
  type NotaFiscalCreateInput,
  type TaxConfig,
  type NotaFiscalStatus,
} from "@/features/financeiro/services/fiscal-engine";
import { useAuthStore } from "@/stores/auth-store";

// ── Supabase client ──────────────────────────────────────────────────────────

function useSb() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const FISCAL_KEYS = {
  taxConfig: ["fiscal", "tax-config"] as const,
  notas: (filters: NotaFiscalFilters) => ["fiscal", "notas", filters] as const,
  report: (competencia: string) => ["fiscal", "report", competencia] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Configuração fiscal do tenant */
export function useTaxConfig() {
  const sb = useSb();
  return useQuery({
    queryKey: FISCAL_KEYS.taxConfig,
    queryFn: () => getTaxConfig(sb),
    staleTime: 5 * 60 * 1000,
  });
}

/** Lista paginada de notas fiscais */
export function useNotasFiscais(filters: NotaFiscalFilters = {}) {
  const sb = useSb();
  return useQuery({
    queryKey: FISCAL_KEYS.notas(filters),
    queryFn: () => listNotasFiscais(sb, filters),
    staleTime: 30_000,
  });
}

/** Relatório fiscal mensal */
export function useFiscalMonthlyReport(competencia: string) {
  const sb = useSb();
  return useQuery({
    queryKey: FISCAL_KEYS.report(competencia),
    queryFn: () => getFiscalMonthlyReport(sb, competencia),
    staleTime: 60_000,
    enabled: !!competencia,
  });
}

/** Criar NF-e com cálculo automático de impostos */
export function useCreateNotaFiscal() {
  const sb = useSb();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenantId ?? "");

  return useMutation({
    mutationFn: (input: NotaFiscalCreateInput) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      return createNotaFiscal(sb, tenantId, user.id, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fiscal"] });
    },
  });
}

/** Atualizar NF-e */
export function useUpdateNotaFiscal() {
  const sb = useSb();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<NotaFiscalCreateInput> & { status?: NotaFiscalStatus };
    }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      return updateNotaFiscal(sb, id, user.id, patch);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fiscal"] });
    },
  });
}

/** Cancelar NF-e */
export function useCancelarNotaFiscal() {
  const sb = useSb();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) => {
      if (!user?.id) throw new Error("Usuário não autenticado");
      return cancelarNF(sb, id, user.id, motivo);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fiscal"] });
    },
  });
}

/** Salvar configuração fiscal do tenant */
export function useUpsertTaxConfig() {
  const sb = useSb();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId ?? "");

  return useMutation({
    mutationFn: (
      payload: Partial<Omit<TaxConfig, "id" | "tenant_id" | "created_at" | "updated_at">>
    ) => upsertTaxConfig(sb, tenantId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FISCAL_KEYS.taxConfig });
    },
  });
}
