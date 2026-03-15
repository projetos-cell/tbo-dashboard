"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import { logPeopleEvent } from "@/features/people/services/people-events";
import type { Database } from "@/lib/supabase/types";
import {
  getPdis,
  getPdiById,
  createPdi,
  updatePdi,
  deletePdi,
  getPdiGoals,
  createPdiGoal,
  updatePdiGoal,
  deletePdiGoal,
  reorderPdiGoals,
  createPdiAction,
  togglePdiAction,
  deletePdiAction,
  getOpenPdiActionsCount,
  linkOneOnOneActionToPdi,
  getPersonSkills,
  type PdiFilters,
  type PdiGoalRow,
  type PdiActionRow,
} from "@/features/pdi/services/pdi";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

// ── PDI query keys ──────────────────────────────────────────────────────────

const PDI_QUERY_KEYS = [
  "pdis",
  "pdi-open-actions-count",
];

// ── Read hooks ──────────────────────────────────────────────────────────────

export function usePdis(filters?: PdiFilters) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["pdis", tenantId, filters],
    queryFn: () => getPdis(supabase, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function usePdi(id: string | null) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["pdi", id],
    queryFn: () => getPdiById(supabase, id!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!id,
  });
}

export function usePdiGoals(pdiId: string | null) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["pdi-goals", pdiId],
    queryFn: () => getPdiGoals(supabase, pdiId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!pdiId,
  });
}

export function useOpenPdiActionsCount() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["pdi-open-actions-count", tenantId],
    queryFn: () => getOpenPdiActionsCount(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function usePersonSkills(personId: string | null) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["person-skills", personId, tenantId],
    queryFn: () => getPersonSkills(supabase, personId!),
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId && !!personId,
  });
}

// ── PDI mutation hooks ──────────────────────────────────────────────────────

export function useCreatePdi() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Database["public"]["Tables"]["pdis"]["Insert"]) =>
      createPdi(supabase, data),
    onSuccess: (row) => {
      for (const key of PDI_QUERY_KEYS) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "create",
        table: "pdis",
        recordId: row.id,
        after: row as unknown as Record<string, unknown>,
      });
      logPeopleEvent(
        supabase,
        row.tenant_id,
        row.person_id,
        useAuthStore.getState().user?.id ?? "unknown",
        "pdi_updated",
        "info",
        { summary: `PDI criado: ${row.title}` }
      );
    },
  });
}

export function useUpdatePdi() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["pdis"]["Update"];
    }) => updatePdi(supabase, id, updates),
    onSuccess: (_data, variables) => {
      for (const key of PDI_QUERY_KEYS) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      queryClient.invalidateQueries({ queryKey: ["pdi", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["pdi-goals", variables.id] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: variables.updates.status ? "status_change" : "update",
        table: "pdis",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },
  });
}

export function useDeletePdi() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePdi(supabase, id),
    onSuccess: (_data, id) => {
      for (const key of PDI_QUERY_KEYS) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "delete",
        table: "pdis",
        recordId: id,
        before: { id },
      });
    },
  });
}

// ── Goal mutation hooks ─────────────────────────────────────────────────────

export function useCreatePdiGoal() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PdiGoalRow> & { tenant_id: string; pdi_id: string; title: string }) =>
      createPdiGoal(supabase, data),
    onSuccess: (_row, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pdi-goals", variables.pdi_id] });
      queryClient.invalidateQueries({ queryKey: ["pdi", variables.pdi_id] });
      for (const key of PDI_QUERY_KEYS) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });
}

export function useUpdatePdiGoal() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      pdiId,
      updates,
    }: {
      id: string;
      pdiId: string;
      updates: Partial<PdiGoalRow>;
    }) => updatePdiGoal(supabase, id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pdi-goals", variables.pdiId] });
      queryClient.invalidateQueries({ queryKey: ["pdi", variables.pdiId] });
    },
  });
}

export function useDeletePdiGoal() {
  const supabase = useSupabase();
  const tenantId = useTenantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, pdiId }: { id: string; pdiId: string }) =>
      deletePdiGoal(supabase, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pdi-goals", variables.pdiId] });
      queryClient.invalidateQueries({ queryKey: ["pdi", variables.pdiId] });
      for (const key of PDI_QUERY_KEYS) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });
}

export function useReorderPdiGoals(pdiId: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goals: { id: string; sort_order: number }[]) =>
      reorderPdiGoals(supabase, goals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdi-goals", pdiId] });
    },
  });
}

// ── Action mutation hooks ───────────────────────────────────────────────────

export function useCreatePdiAction() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PdiActionRow> & { tenant_id: string; pdi_goal_id: string; text: string }) =>
      createPdiAction(supabase, data),
    onSuccess: (_row, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pdi-goals"] });
      queryClient.invalidateQueries({ queryKey: ["pdi"] });
      queryClient.invalidateQueries({ queryKey: ["pdi-open-actions-count"] });
    },
  });
}

export function useTogglePdiAction() {
  const supabase = useSupabase();
  const tenantId = useTenantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      actionId,
      completed,
    }: {
      actionId: string;
      completed: boolean;
      goalId: string;
      pdiId: string;
    }) => togglePdiAction(supabase, actionId, completed),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pdi-goals", variables.pdiId] });
      queryClient.invalidateQueries({ queryKey: ["pdi", variables.pdiId] });
      queryClient.invalidateQueries({ queryKey: ["pdi-open-actions-count"] });
    },
  });
}

export function useDeletePdiAction() {
  const supabase = useSupabase();
  const tenantId = useTenantId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      actionId,
    }: {
      actionId: string;
      goalId: string;
      pdiId: string;
    }) => deletePdiAction(supabase, actionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pdi-goals", variables.pdiId] });
      queryClient.invalidateQueries({ queryKey: ["pdi", variables.pdiId] });
      queryClient.invalidateQueries({ queryKey: ["pdi-open-actions-count"] });
    },
  });
}

// ── Link 1:1 action hook ──────────────────────────────────────────────────

export function useLinkOneOnOneAction() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      oneOnOneActionId,
      pdiId,
    }: {
      oneOnOneActionId: string;
      pdiId: string;
    }) => linkOneOnOneActionToPdi(supabase, oneOnOneActionId, pdiId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["one-on-one-pending-actions"] });
      queryClient.invalidateQueries({ queryKey: ["one-on-one-actions"] });
    },
  });
}
