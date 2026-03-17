"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner"; // Feature #74 — Toasts padronizados
import {
  listAccounts,
  getAccount,
  listPosts,
  listIdeas,
  listMetrics,
  createPost,
  updatePost,
  deletePost,
  createIdea,
  updateIdea,
  deleteIdea,
  createAccount,
  updateAccount,
} from "@/services/rsm";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

// ── Accounts ──────────────────────────────────────────────────

export function useRsmAccounts() {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["rsm-accounts", tenantId],
    queryFn: () => listAccounts(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useRsmAccount(accountId: string) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["rsm-account", accountId],
    queryFn: () => getAccount(supabase, accountId),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!accountId,
  });
}

export function useRsmMetrics(accountId: string) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["rsm-metrics", accountId],
    queryFn: () => listMetrics(supabase, accountId),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!accountId,
  });
}

export function useCreateRsmAccount() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (a: Database["public"]["Tables"]["rsm_accounts"]["Insert"]) =>
      createAccount(supabase, a),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rsm-accounts"] });
      toast.success("Conta conectada com sucesso");
    },
    onError: () => toast.error("Erro ao conectar conta"),
  });
}

export function useUpdateRsmAccount() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  type AccountRow = Database["public"]["Tables"]["rsm_accounts"]["Row"];
  type UpdateVars = { id: string; updates: Database["public"]["Tables"]["rsm_accounts"]["Update"] };
  type Ctx = { prev: unknown };
  return useMutation<AccountRow, Error, UpdateVars, Ctx>({
    mutationFn: (vars: UpdateVars) => updateAccount(supabase, vars.id, vars.updates),
    onMutate: async (vars: UpdateVars): Promise<Ctx> => {
      await qc.cancelQueries({ queryKey: ["rsm-accounts"] });
      const prev = qc.getQueryData(["rsm-accounts"]);
      qc.setQueryData(
        ["rsm-accounts"],
        (old: AccountRow[] | undefined) =>
          old?.map((a) => (a.id === vars.id ? { ...a, ...vars.updates } : a)) ?? []
      );
      return { prev };
    },
    onError: (_err: Error, _vars: UpdateVars, ctx: Ctx | undefined) => {
      if (ctx?.prev) qc.setQueryData(["rsm-accounts"], ctx.prev);
      toast.error("Erro ao atualizar conta");
    },
    onSuccess: () => toast.success("Conta atualizada"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["rsm-accounts"] }),
  });
}

// ── Posts ──────────────────────────────────────────────────────

export function useRsmPosts(filters?: {
  accountId?: string;
  status?: string;
}) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["rsm-posts", tenantId, filters],
    queryFn: () => listPosts(supabase, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateRsmPost() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Database["public"]["Tables"]["rsm_posts"]["Insert"]) =>
      createPost(supabase, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rsm-posts"] });
      toast.success("Post criado com sucesso");
    },
    onError: () => toast.error("Erro ao criar post"),
  });
}

export function useUpdateRsmPost() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["rsm_posts"]["Update"];
    }) => updatePost(supabase, id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rsm-posts"] });
      toast.success("Post atualizado");
    },
    onError: () => toast.error("Erro ao atualizar post"),
  });
}

export function useDeleteRsmPost() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePost(supabase, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rsm-posts"] });
      toast.success("Post excluído");
    },
    onError: () => toast.error("Erro ao excluir post"),
  });
}

// ── Ideas ─────────────────────────────────────────────────────

export function useRsmIdeas(filters?: { status?: string }) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["rsm-ideas", tenantId, filters],
    queryFn: () => listIdeas(supabase, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateRsmIdea() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idea: Database["public"]["Tables"]["rsm_ideas"]["Insert"]) =>
      createIdea(supabase, idea),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rsm-ideas"] });
      toast.success("Ideia criada");
    },
    onError: () => toast.error("Erro ao criar ideia"),
  });
}

export function useUpdateRsmIdea() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["rsm_ideas"]["Update"];
    }) => updateIdea(supabase, id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rsm-ideas"] });
      toast.success("Ideia atualizada");
    },
    onError: () => toast.error("Erro ao atualizar ideia"),
  });
}

export function useDeleteRsmIdea() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIdea(supabase, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rsm-ideas"] });
      toast.success("Ideia excluída");
    },
    onError: () => toast.error("Erro ao excluir ideia"),
  });
}
