"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import {
  getCycles,
  getActiveCycle,
  createCycle,
  getObjectives,
  createObjective,
  updateObjective,
  getKeyResults,
  createKeyResult,
  updateKeyResult,
  getCheckins,
  createCheckin,
} from "@/services/okrs";

// ── Cycles ──────────────────────────────────────────────────────────────

export function useCycles() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["okr-cycles", tenantId],
    queryFn: () => getCycles(supabase, tenantId!),
    enabled: !!tenantId,
  });
}

export function useActiveCycle() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["okr-active-cycle", tenantId],
    queryFn: () => getActiveCycle(supabase, tenantId!),
    enabled: !!tenantId,
  });
}

export function useCreateCycle() {
  const supabase = createClient();
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

// ── Objectives ──────────────────────────────────────────────────────────

interface ObjectiveFilters {
  cycleId?: string;
  level?: string;
  status?: string;
  ownerId?: string;
}

export function useObjectives(filters?: ObjectiveFilters) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["okr-objectives", tenantId, filters],
    queryFn: () => getObjectives(supabase, tenantId!, filters),
    enabled: !!tenantId,
  });
}

export function useCreateObjective() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (
      obj: Database["public"]["Tables"]["okr_objectives"]["Insert"],
    ) => createObjective(supabase, obj),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["okr-objectives"] }),
  });
}

export function useUpdateObjective() {
  const supabase = createClient();
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

// ── Key Results ─────────────────────────────────────────────────────────

export function useKeyResults(objectiveId: string | null) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["okr-key-results", tenantId, objectiveId],
    queryFn: () => getKeyResults(supabase, tenantId!, objectiveId!),
    enabled: !!tenantId && !!objectiveId,
  });
}

export function useCreateKeyResult() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (
      kr: Database["public"]["Tables"]["okr_key_results"]["Insert"],
    ) => createKeyResult(supabase, kr),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["okr-key-results"] }),
  });
}

export function useUpdateKeyResult() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["okr_key_results"]["Update"];
    }) => updateKeyResult(supabase, id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["okr-key-results"] }),
  });
}

// ── Check-ins ───────────────────────────────────────────────────────────

export function useCheckins(keyResultId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["okr-checkins", keyResultId],
    queryFn: () => getCheckins(supabase, keyResultId!),
    enabled: !!keyResultId,
  });
}

export function useCreateCheckin() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (
      checkin: Database["public"]["Tables"]["okr_checkins"]["Insert"],
    ) => createCheckin(supabase, checkin),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["okr-checkins"] });
      qc.invalidateQueries({ queryKey: ["okr-key-results"] });
      qc.invalidateQueries({ queryKey: ["okr-objectives"] });
    },
  });
}
