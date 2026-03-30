"use client";

import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type {
  Vendor,
  VendorCategory,
  Pedido,
  PedidoItem,
  Aprovacao,
} from "../types";
import {
  getVendors,
  getVendorCategories,
  createVendor,
  updateVendor,
  deleteVendor,
  createVendorCategory,
  updateVendorCategory,
  deleteVendorCategory,
  reorderVendorCategories,
} from "../services/vendors";
import {
  getPedidos,
  getPedido,
  createPedido,
  updatePedido,
  deletePedido,
  reorderPedidos,
  getPedidoItens,
  upsertPedidoItens,
  getAprovacoes,
  criarAprovacao,
} from "../services/pedidos";

// ─── Keys ─────────────────────────────────────────────────────────────────────

const keys = {
  vendors: (tid: string | null) => ["compras-vendors", tid] as const,
  vendorCategories: (tid: string | null) => ["compras-vendor-categories", tid] as const,
  pedidos: (tid: string | null) => ["compras-pedidos", tid] as const,
  pedido: (id: string) => ["compras-pedido", id] as const,
  pedidoItens: (id: string) => ["compras-pedido-itens", id] as const,
  aprovacoes: (id: string) => ["compras-aprovacoes", id] as const,
};

// ─── Vendors ──────────────────────────────────────────────────────────────────

export function useVendors() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: keys.vendors(tenantId),
    queryFn: () => getVendors(supabase),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useVendorCategories() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: keys.vendorCategories(tenantId),
    queryFn: () => getVendorCategories(supabase),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateVendor() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (input: Omit<Vendor, "id" | "omie_id" | "omie_synced_at" | "created_at" | "updated_at">) =>
      createVendor(supabase, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: keys.vendors(tenantId) });
      const prev = qc.getQueryData<Vendor[]>(keys.vendors(tenantId));
      const optimistic: Vendor = { id: `temp-${Date.now()}`, omie_id: null, omie_synced_at: null, ...input };
      qc.setQueryData<Vendor[]>(keys.vendors(tenantId), (old) => [...(old ?? []), optimistic]);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.vendors(tenantId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.vendors(tenantId) });
    },
  });
}

export function useUpdateVendor() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Vendor> }) =>
      updateVendor(supabase, id, updates),
    onMutate: async ({ id, updates }) => {
      await qc.cancelQueries({ queryKey: keys.vendors(tenantId) });
      const prev = qc.getQueryData<Vendor[]>(keys.vendors(tenantId));
      qc.setQueryData<Vendor[]>(keys.vendors(tenantId), (old) =>
        old?.map((v) => (v.id === id ? { ...v, ...updates } : v))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.vendors(tenantId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.vendors(tenantId) });
    },
  });
}

export function useDeleteVendor() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (id: string) => deleteVendor(supabase, id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.vendors(tenantId) });
      const prev = qc.getQueryData<Vendor[]>(keys.vendors(tenantId));
      qc.setQueryData<Vendor[]>(keys.vendors(tenantId), (old) =>
        old?.filter((v) => v.id !== id)
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.vendors(tenantId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.vendors(tenantId) });
      qc.invalidateQueries({ queryKey: keys.pedidos(tenantId) });
    },
  });
}

// ─── Vendor Categories ────────────────────────────────────────────────────────

export function useCreateVendorCategory() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (input: Omit<VendorCategory, "id" | "created_at">) =>
      createVendorCategory(supabase, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: keys.vendorCategories(tenantId) });
      const prev = qc.getQueryData<VendorCategory[]>(keys.vendorCategories(tenantId));
      const optimistic: VendorCategory = { id: `temp-${Date.now()}`, ...input };
      qc.setQueryData<VendorCategory[]>(keys.vendorCategories(tenantId), (old) => [
        ...(old ?? []),
        optimistic,
      ]);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.vendorCategories(tenantId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.vendorCategories(tenantId) });
    },
  });
}

export function useUpdateVendorCategory() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<VendorCategory> }) =>
      updateVendorCategory(supabase, id, updates),
    onMutate: async ({ id, updates }) => {
      await qc.cancelQueries({ queryKey: keys.vendorCategories(tenantId) });
      const prev = qc.getQueryData<VendorCategory[]>(keys.vendorCategories(tenantId));
      qc.setQueryData<VendorCategory[]>(keys.vendorCategories(tenantId), (old) =>
        old?.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.vendorCategories(tenantId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.vendorCategories(tenantId) });
    },
  });
}

export function useDeleteVendorCategory() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (id: string) => deleteVendorCategory(supabase, id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.vendorCategories(tenantId) });
      const prev = qc.getQueryData<VendorCategory[]>(keys.vendorCategories(tenantId));
      qc.setQueryData<VendorCategory[]>(keys.vendorCategories(tenantId), (old) =>
        old?.filter((c) => c.id !== id)
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.vendorCategories(tenantId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.vendorCategories(tenantId) });
    },
  });
}

export function useReorderVendorCategories() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (items: { id: string; sort_order: number }[]) =>
      reorderVendorCategories(supabase, items),
    onMutate: async (items) => {
      await qc.cancelQueries({ queryKey: keys.vendorCategories(tenantId) });
      const prev = qc.getQueryData<VendorCategory[]>(keys.vendorCategories(tenantId));
      qc.setQueryData<VendorCategory[]>(keys.vendorCategories(tenantId), (old) => {
        if (!old) return old;
        const map = new Map(items.map((i) => [i.id, i.sort_order]));
        return [...old]
          .map((c) => ({ ...c, sort_order: map.get(c.id) ?? c.sort_order }))
          .sort((a, b) => a.sort_order - b.sort_order);
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.vendorCategories(tenantId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.vendorCategories(tenantId) });
    },
  });
}

// ─── Pedidos ──────────────────────────────────────────────────────────────────

export function usePedidos() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: keys.pedidos(tenantId),
    queryFn: () => getPedidos(supabase),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePedido(id: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: keys.pedido(id ?? ""),
    queryFn: () => getPedido(supabase, id!),
    enabled: !!id && !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreatePedido() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (input: Omit<Pedido, "id" | "created_at" | "updated_at" | "vendor">) =>
      createPedido(supabase, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: keys.pedidos(tenantId) });
      const prev = qc.getQueryData<Pedido[]>(keys.pedidos(tenantId));
      const optimistic: Pedido = { id: `temp-${Date.now()}`, vendor: null, ...input };
      qc.setQueryData<Pedido[]>(keys.pedidos(tenantId), (old) => [optimistic, ...(old ?? [])]);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.pedidos(tenantId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.pedidos(tenantId) });
    },
  });
}

export function useUpdatePedido() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pedido> }) =>
      updatePedido(supabase, id, updates),
    onMutate: async ({ id, updates }) => {
      await qc.cancelQueries({ queryKey: keys.pedidos(tenantId) });
      await qc.cancelQueries({ queryKey: keys.pedido(id) });
      const prevList = qc.getQueryData<Pedido[]>(keys.pedidos(tenantId));
      const prevSingle = qc.getQueryData<Pedido>(keys.pedido(id));
      qc.setQueryData<Pedido[]>(keys.pedidos(tenantId), (old) =>
        old?.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      qc.setQueryData<Pedido>(keys.pedido(id), (old) =>
        old ? { ...old, ...updates } : old
      );
      return { prevList, prevSingle };
    },
    onError: (_e, { id }, ctx) => {
      if (ctx?.prevList) qc.setQueryData(keys.pedidos(tenantId), ctx.prevList);
      if (ctx?.prevSingle) qc.setQueryData(keys.pedido(id), ctx.prevSingle);
    },
    onSettled: (_d, _e, { id }) => {
      qc.invalidateQueries({ queryKey: keys.pedidos(tenantId) });
      qc.invalidateQueries({ queryKey: keys.pedido(id) });
    },
  });
}

export function useDeletePedido() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (id: string) => deletePedido(supabase, id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.pedidos(tenantId) });
      const prev = qc.getQueryData<Pedido[]>(keys.pedidos(tenantId));
      qc.setQueryData<Pedido[]>(keys.pedidos(tenantId), (old) =>
        old?.filter((p) => p.id !== id)
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.pedidos(tenantId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.pedidos(tenantId) });
    },
  });
}

export function useReorderPedidos() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (items: { id: string; sort_order: number }[]) =>
      reorderPedidos(supabase, items),
    onMutate: async (items) => {
      await qc.cancelQueries({ queryKey: keys.pedidos(tenantId) });
      const prev = qc.getQueryData<Pedido[]>(keys.pedidos(tenantId));
      qc.setQueryData<Pedido[]>(keys.pedidos(tenantId), (old) => {
        if (!old) return old;
        const map = new Map(items.map((i) => [i.id, i.sort_order]));
        return [...old]
          .map((p) => ({ ...p, sort_order: map.get(p.id) ?? p.sort_order }))
          .sort((a, b) => a.sort_order - b.sort_order);
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.pedidos(tenantId), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.pedidos(tenantId) });
    },
  });
}

// ─── Pedido Items ─────────────────────────────────────────────────────────────

export function usePedidoItens(pedidoId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: keys.pedidoItens(pedidoId ?? ""),
    queryFn: () => getPedidoItens(supabase, pedidoId!),
    enabled: !!pedidoId && !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpsertPedidoItens() {
  const supabase = createClient();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: ({
      pedidoId,
      items,
    }: {
      pedidoId: string;
      items: Omit<PedidoItem, "id" | "created_at">[];
    }) => upsertPedidoItens(supabase, pedidoId, items),
    onMutate: async ({ pedidoId, items }) => {
      await qc.cancelQueries({ queryKey: keys.pedidoItens(pedidoId) });
      const prev = qc.getQueryData<PedidoItem[]>(keys.pedidoItens(pedidoId));
      const optimistic = items.map((item, i) => ({
        ...item,
        id: `temp-${i}-${Date.now()}`,
        created_at: null,
      })) as PedidoItem[];
      qc.setQueryData<PedidoItem[]>(keys.pedidoItens(pedidoId), optimistic);
      return { prev };
    },
    onError: (_e, { pedidoId }, ctx) => {
      if (ctx?.prev) qc.setQueryData(keys.pedidoItens(pedidoId), ctx.prev);
    },
    onSettled: (_d, _e, { pedidoId }) => {
      qc.invalidateQueries({ queryKey: keys.pedidoItens(pedidoId) });
      qc.invalidateQueries({ queryKey: keys.pedidos(tenantId) });
    },
  });
}

// ─── Aprovacoes ───────────────────────────────────────────────────────────────

export function useAprovacoes(pedidoId: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: keys.aprovacoes(pedidoId ?? ""),
    queryFn: () => getAprovacoes(supabase, pedidoId!),
    enabled: !!pedidoId && !!tenantId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCriarAprovacao() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<Aprovacao, "id" | "created_at">) =>
      criarAprovacao(supabase, input),
    onSettled: (_d, _e, input) => {
      qc.invalidateQueries({ queryKey: keys.aprovacoes(input.pedido_id) });
    },
  });
}
