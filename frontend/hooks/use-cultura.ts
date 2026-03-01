"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getCulturaItems,
  getCulturaItem,
  createCulturaItem,
  updateCulturaItem,
  deleteCulturaItem,
  getCulturaVersions,
} from "@/services/cultura";
import type { Database } from "@/lib/supabase/types";

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
    queryFn: () => getCulturaItems(supabase, tenantId!, category),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCulturaItem(id: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["cultura-item", id],
    queryFn: () => getCulturaItem(supabase, id, tenantId!),
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
    },
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
    },
  });
}

export function useDeleteCulturaItem() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCulturaItem(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cultura-items"] });
    },
  });
}
