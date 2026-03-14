"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  createBauReference,
  getBauReferencesBySubcategory,
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
