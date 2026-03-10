"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getRitualTypes,
  getRitualType,
  createRitualType,
  updateRitualType,
  deleteRitualType,
  toggleRitualTypeActive,
} from "@/features/cultura/services/ritual-types";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

// ─── List ritual types ───
export function useRitualTypes(includeInactive = false) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["ritual-types", tenantId, includeInactive],
    queryFn: () => getRitualTypes(supabase, includeInactive),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ─── Get single ritual type ───
export function useRitualType(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["ritual-type", id],
    queryFn: () => getRitualType(supabase, id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}

// ─── Create ritual type ───
export function useCreateRitualType() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ritualType: Database["public"]["Tables"]["ritual_types"]["Insert"]) =>
      createRitualType(supabase, ritualType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ritual-types"] });
    },
  });
}

// ─── Update ritual type ───
export function useUpdateRitualType() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["ritual_types"]["Update"];
    }) => updateRitualType(supabase, id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ritual-types"] });
      queryClient.invalidateQueries({ queryKey: ["ritual-type", variables.id] });
    },
  });
}

// ─── Delete ritual type ───
export function useDeleteRitualType() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRitualType(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ritual-types"] });
    },
  });
}

// ─── Toggle active ───
export function useToggleRitualTypeActive() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleRitualTypeActive(supabase, id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ritual-types"] });
    },
  });
}
