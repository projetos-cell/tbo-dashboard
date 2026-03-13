"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import {
  getCulturaItems,
  getCulturaItem,
  createCulturaItem,
  updateCulturaItem,
  deleteCulturaItem,
  getCulturaVersions,
  reorderCulturaItems,
} from "@/features/cultura/services/cultura";
import type { Database } from "@/lib/supabase/types";

type CulturaRow = Database["public"]["Tables"]["cultura_items"]["Row"];

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function useCulturaItems(category?: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["cultura-items", tenantId, category],
    queryFn: () => getCulturaItems(supabase, category),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCulturaItem(id: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["cultura-item", id],
    queryFn: () => getCulturaItem(supabase, id),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!id,
  });
}

export function useCulturaVersions(itemId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["cultura-versions", itemId],
    queryFn: () => getCulturaVersions(supabase, itemId),
    staleTime: 1000 * 60 * 5,
    enabled: !!itemId,
  });
}

export function useCreateCulturaItem() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: Database["public"]["Tables"]["cultura_items"]["Insert"]) =>
      createCulturaItem(supabase, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cultura-items"] });
      toast.success("Item de cultura criado");
    },
    onError: () => toast.error("Erro ao criar item de cultura"),
  });
}

export function useUpdateCulturaItem() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
      editedBy,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["cultura_items"]["Update"];
      editedBy?: string;
    }) => updateCulturaItem(supabase, id, updates, editedBy),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cultura-items"] });
      queryClient.invalidateQueries({ queryKey: ["cultura-item", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["cultura-versions", variables.id] });
      toast.success("Item atualizado");
    },
    onError: () => toast.error("Erro ao atualizar item"),
  });
}

export function useDeleteCulturaItem() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCulturaItem(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cultura-items"] });
      toast.success("Item excluído");
    },
    onError: () => toast.error("Erro ao excluir item"),
  });
}

export function useReorderCulturaItems(category?: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const tenantId = useTenantId();

  return useMutation({
    mutationFn: (items: { id: string; order_index: number }[]) =>
      reorderCulturaItems(supabase, items),
    onMutate: async (newOrder) => {
      const key = ["cultura-items", tenantId, category];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CulturaRow[]>(key);
      queryClient.setQueryData<CulturaRow[]>(key, (old) => {
        if (!old) return old;
        const orderMap = new Map(newOrder.map(({ id, order_index }) => [id, order_index]));
        return [...old]
          .map((item) => ({ ...item, order_index: orderMap.get(item.id) ?? item.order_index }))
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cultura-items", tenantId, category], context.previous);
      }
      toast.error("Erro ao reordenar itens");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cultura-items", tenantId, category] });
    },
  });
}
