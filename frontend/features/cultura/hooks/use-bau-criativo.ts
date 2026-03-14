"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  createBauReference,
  getBauReferencesBySubcategory,
  getBauStats,
  getPendingBauReferences,
  updateBauReferenceStatus,
  type BauReferenceInsert,
} from "@/features/cultura/services/bau-criativo";

function useSupabase() {
  return createClient();
}

// ─── Query key factory ───────────────────────────────────────────────────────

function bauRefsKey(subcategoryId: string) {
  return ["bau-references", subcategoryId] as const;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Returns approved references for a given subcategory.
 * Falls back gracefully if the `bau_references` table does not exist yet.
 */
export function useBauReferences(subcategoryId: string, enabled = true) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: bauRefsKey(subcategoryId),
    queryFn: () => getBauReferencesBySubcategory(supabase, subcategoryId),
    enabled: enabled && !!subcategoryId,
    staleTime: 1000 * 60 * 5,
    // If table doesn't exist yet, return empty array silently
    retry: (failureCount, error) => {
      const msg = (error as Error)?.message ?? "";
      if (msg.includes("does not exist") || msg.includes("relation")) return false;
      return failureCount < 2;
    },
  });
}

const BAU_PENDING_KEY = ["bau-references-pending"] as const;

/** Returns all pending references (admin only). */
export function usePendingBauReferences() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: BAU_PENDING_KEY,
    queryFn: () => getPendingBauReferences(supabase),
    staleTime: 1000 * 60 * 2,
    retry: (failureCount, error) => {
      const msg = (error as Error)?.message ?? "";
      if (msg.includes("does not exist") || msg.includes("relation")) return false;
      return failureCount < 2;
    },
  });
}

/** Approve or reject a pending contribution. */
export function useUpdateBauReferenceStatus() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      updateBauReferenceStatus(supabase, id, status),

    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: BAU_PENDING_KEY });
      // Invalidate all subcategory queries so approved item shows up
      qc.invalidateQueries({ queryKey: ["bau-references"] });
      toast.success(status === "approved" ? "Referência aprovada!" : "Referência rejeitada.");
    },

    onError: () => {
      toast.error("Erro ao atualizar status. Tente novamente.");
    },
  });
}

/** Aggregate stats for the analytics dashboard. */
export function useBauStats() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["bau-stats"] as const,
    queryFn: () => getBauStats(supabase),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      const msg = (error as Error)?.message ?? "";
      if (msg.includes("does not exist") || msg.includes("relation")) return false;
      return failureCount < 2;
    },
  });
}

/** Submit a new reference to the Baú Criativo (pending approval). */
export function useCreateBauReference() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: BauReferenceInsert) => createBauReference(supabase, data),

    onSuccess: (_, vars) => {
      // Invalidate references for the submitted subcategory so approved ones refresh
      qc.invalidateQueries({ queryKey: bauRefsKey(vars.subcategory_id) });
      toast.success("Referência enviada para revisão!", {
        description: `"${vars.name}" será avaliada pela equipe antes de ser publicada.`,
      });
    },

    onError: () => {
      toast.error("Erro ao enviar referência. Tente novamente.");
    },
  });
}
