"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import type { Database } from "@/lib/supabase/types";
import {
  getOneOnOnes,
  getOneOnOneById,
  getUpcomingOneOnOnes,
  getOverdueOneOnOnes,
  getPendingActions,
  createOneOnOne,
  updateOneOnOne,
  deleteOneOnOne,
  getOneOnOneActions,
  createAction,
  toggleAction,
  deleteAction,
  type OneOnOneFilters,
} from "@/services/one-on-ones";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

// ── Read hooks ───────────────────────────────────────────────────────────────

export function useOneOnOnes(filters?: OneOnOneFilters) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["one-on-ones", tenantId, filters],
    queryFn: () => getOneOnOnes(supabase, tenantId!, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useOneOnOne(id: string | null) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["one-on-one", id],
    queryFn: () => getOneOnOneById(supabase, id!, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!id,
  });
}

export function useUpcomingOneOnOnes() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["one-on-ones-upcoming", tenantId],
    queryFn: () => getUpcomingOneOnOnes(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useOverdueOneOnOnes() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["one-on-ones-overdue", tenantId],
    queryFn: () => getOverdueOneOnOnes(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function usePendingOneOnOneActions() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["one-on-one-pending-actions", tenantId],
    queryFn: () => getPendingActions(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useOneOnOneActions(oneOnOneId: string | null) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["one-on-one-actions", oneOnOneId],
    queryFn: () => getOneOnOneActions(supabase, oneOnOneId!, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!oneOnOneId,
  });
}

// ── Mutation hooks ───────────────────────────────────────────────────────────

const ONE_ON_ONE_QUERY_KEYS = [
  "one-on-ones",
  "one-on-ones-upcoming",
  "one-on-ones-overdue",
  "one-on-one-pending-actions",
];

export function useCreateOneOnOne() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Database["public"]["Tables"]["one_on_ones"]["Insert"]) =>
      createOneOnOne(supabase, data),
    onSuccess: (row) => {
      for (const key of ONE_ON_ONE_QUERY_KEYS) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "create",
        table: "one_on_ones",
        recordId: row.id,
        after: row as unknown as Record<string, unknown>,
      });
    },
  });
}

export function useUpdateOneOnOne() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["one_on_ones"]["Update"];
    }) => updateOneOnOne(supabase, id, updates),
    onSuccess: (_data, variables) => {
      for (const key of ONE_ON_ONE_QUERY_KEYS) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      queryClient.invalidateQueries({ queryKey: ["one-on-one", variables.id] });

      const action = variables.updates.status ? "status_change" : "update";
      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action,
        table: "one_on_ones",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },
  });
}

export function useDeleteOneOnOne() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOneOnOne(supabase, id),
    onSuccess: (_data, id) => {
      for (const key of ONE_ON_ONE_QUERY_KEYS) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "delete",
        table: "one_on_ones",
        recordId: id,
        before: { id },
      });
    },
  });
}

export function useCreateAction() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Database["public"]["Tables"]["one_on_one_actions"]["Insert"]) =>
      createAction(supabase, data),
    onSuccess: (_row, variables) => {
      queryClient.invalidateQueries({ queryKey: ["one-on-one-actions", variables.one_on_one_id] });
      queryClient.invalidateQueries({ queryKey: ["one-on-one-pending-actions"] });
      queryClient.invalidateQueries({ queryKey: ["one-on-one", variables.one_on_one_id] });
    },
  });
}

export function useToggleAction() {
  const supabase = useSupabase();
  const tenantId = useTenantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      actionId,
      completed,
      oneOnOneId,
    }: {
      actionId: string;
      completed: boolean;
      oneOnOneId: string;
    }) => toggleAction(supabase, actionId, tenantId!, completed),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["one-on-one-actions", variables.oneOnOneId] });
      queryClient.invalidateQueries({ queryKey: ["one-on-one-pending-actions"] });
      queryClient.invalidateQueries({ queryKey: ["one-on-one", variables.oneOnOneId] });
    },
  });
}

export function useDeleteAction() {
  const supabase = useSupabase();
  const tenantId = useTenantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      actionId,
      oneOnOneId,
    }: {
      actionId: string;
      oneOnOneId: string;
    }) => deleteAction(supabase, actionId, tenantId!),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["one-on-one-actions", variables.oneOnOneId] });
      queryClient.invalidateQueries({ queryKey: ["one-on-one-pending-actions"] });
      queryClient.invalidateQueries({ queryKey: ["one-on-one", variables.oneOnOneId] });
    },
  });
}
