"use client";

import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  createBauReference,
  type BauReferenceInsert,
} from "@/features/cultura/services/bau-criativo";

function useSupabase() {
  return createClient();
}

/** Submit a new reference to the Baú Criativo (pending approval). */
export function useCreateBauReference() {
  const supabase = useSupabase();

  return useMutation({
    mutationFn: (data: BauReferenceInsert) => createBauReference(supabase, data),

    onSuccess: (_, vars) => {
      toast.success("Referência enviada para revisão!", {
        description: `"${vars.name}" será avaliada pela equipe antes de ser publicada.`,
      });
    },

    onError: () => {
      toast.error("Erro ao enviar referência. Tente novamente.");
    },
  });
}
