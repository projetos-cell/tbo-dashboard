"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import {
  getCycles,
  getActiveCycle,
  createCycle,
  updateCycle,
  deleteCycle,
  getObjectives,
  createObjective,
  updateObjective,
  deleteObjective,
  getKeyResults,
  createKeyResult,
  updateKeyResult,
  deleteKeyResult,
  getCheckins,
  createCheckin,
  getComments,
  createComment,
  deleteComment,
} from "@/services/okrs";
import type { ObjectiveFilters } from "@/services/okrs";

// ── helpers ──────────────────────────────────────────────────────────────

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

// ── Cycles ──────────────────────────────────────────────────────────────

export function useCycles() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["okr-cycles", tenantId],
    queryFn: () => getCycles(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useActiveCycle() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["okr-active-cycle", tenantId],
    queryFn: () => getActiveCycle(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateCycle() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (cycle: Database["public"]["Tables"]["okr_cycles"]["Insert"]) =>
      createCycle(supabase, cycle),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["okr-cycles"] });
      qc.invalidateQueries({ queryKey: ["okr-active-cycle"] });
    },
  });
}

export function useUpdateCycle() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["okr_cycles"]["Update"];
    }) => updateCycle(supabase, id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["okr-cycles"] });
      qc.invalidateQueries({ queryKey: ["okr-active-cycle"] });
    },
  });
}

export function useDeleteCycle() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCycle(supabase, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["okr-cycles"] });
      qc.invalidateQueries({ queryKey: ["okr-active-cycle"] });
    },
  });
}

// ── Objectives ──────────────────────────────────────────────────────────

export function useObjectives(filters?: ObjectiveFilters) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["okr-objectives", tenantId, filters],
    queryFn: () => getObjectives(supabase, tenantId!, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateObjective() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (
      obj: Database["public"]["Tables"]["okr_objectives"]["Insert"],
    ) => createObjective(supabase, obj),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["okr-objectives"] }),
  });
}

export function useUpdateObjective() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["okr_objectives"]["Update"];
    }) => updateObjective(supabase, id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["okr-objectives"] }),
  });
}

export function useDeleteObjective() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteObjective(supabase, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["okr-objectives"] }),
  });
}

// ── Key Results ─────────────────────────────────────────────────────────

export function useKeyResults(objectiveId: string | null) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["okr-key-results", tenantId, objectiveId],
    queryFn: () => getKeyResults(supabase, tenantId!, objectiveId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!objectiveId,
  });
}

export function useCreateKeyResult() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (
      kr: Database["public"]["Tables"]["okr_key_results"]["Insert"],
    ) => createKeyResult(supabase, kr),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["okr-key-results"] });
      qc.invalidateQueries({ queryKey: ["okr-objectives"] });
    },
  });
}

export function useUpdateKeyResult() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["okr_key_results"]["Update"];
    }) => updateKeyResult(supabase, id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["okr-key-results"] });
      qc.invalidateQueries({ queryKey: ["okr-objectives"] });
    },
  });
}

export function useDeleteKeyResult() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteKeyResult(supabase, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["okr-key-results"] });
      qc.invalidateQueries({ queryKey: ["okr-objectives"] });
    },
  });
}

// ── Check-ins ───────────────────────────────────────────────────────────

export function useCheckins(keyResultId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["okr-checkins", keyResultId],
    queryFn: () => getCheckins(supabase, keyResultId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!keyResultId,
  });
}

export function useCreateCheckin() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (
      checkin: Database["public"]["Tables"]["okr_checkins"]["Insert"],
    ) => createCheckin(supabase, checkin),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["okr-checkins"] });
      qc.invalidateQueries({ queryKey: ["okr-key-results"] });
      qc.invalidateQueries({ queryKey: ["okr-objectives"] });
    },
  });
}

// ── Comments ────────────────────────────────────────────────────────────

export function useOkrComments(params: {
  objectiveId?: string;
  keyResultId?: string;
}) {
  const supabase = useSupabase();
  const enabled = !!(params.objectiveId || params.keyResultId);

  return useQuery({
    queryKey: ["okr-comments", params.objectiveId, params.keyResultId],
    queryFn: () => getComments(supabase, params),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
}

export function useCreateOkrComment() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (comment: {
      tenant_id: string;
      objective_id?: string | null;
      key_result_id?: string | null;
      author_id: string;
      body: string;
    }) => createComment(supabase, comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["okr-comments"] }),
  });
}

export function useDeleteOkrComment() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteComment(supabase, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["okr-comments"] }),
  });
}
