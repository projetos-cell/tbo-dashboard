"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import {
  getClients,
  getClientById,
  createClient as createClientService,
  updateClient,
  getClientInteractions,
  createInteraction,
} from "@/features/clientes/services/clients";

export function useClients(filters?: {
  status?: string;
  search?: string;
  segment?: string;
}) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["clients", tenantId, filters],
    queryFn: () => getClients(supabase, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useClient(id: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["client", id],
    queryFn: () => getClientById(supabase, id!),
    staleTime: 1000 * 60 * 5,
    enabled: !!id && !!tenantId,
  });
}

export function useCreateClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Database["public"]["Tables"]["clients"]["Insert"]) =>
      createClientService(supabase, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["clients"]["Update"];
    }) => updateClient(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client"] });
    },
  });
}

export function useClientInteractions(clientId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["client-interactions", clientId],
    queryFn: () => getClientInteractions(supabase, clientId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!clientId && !!tenantId,
  });
}

export function useCreateInteraction() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Database["public"]["Tables"]["client_interactions"]["Insert"]) =>
      createInteraction(supabase, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["client-interactions", variables.client_id],
      });
    },
  });
}

// ── Import from Omie + CRM ────────────────────────────────────────────────────

export interface ImportResult {
  success: boolean;
  omie_imported: number;
  crm_imported: number;
  merged: number;
  classified: Record<string, number>;
  projects_linked: number;
  errors: string[];
}

export function useImportClients() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<ImportResult> => {
      if (!tenantId) throw new Error("Tenant não encontrado");
      const res = await fetch("/api/clients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(err.error ?? `Erro ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
