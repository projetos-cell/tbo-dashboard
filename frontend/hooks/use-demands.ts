"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  createDemand,
  updateDemand,
  deleteDemand,
} from "@/services/demands";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

export function useCreateDemand() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (demand: Database["public"]["Tables"]["demands"]["Insert"]) =>
      createDemand(supabase, demand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-demands"] });
    },
  });
}

export function useUpdateDemand() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["demands"]["Update"];
    }) => updateDemand(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-demands"] });
      queryClient.invalidateQueries({ queryKey: ["project-stats"] });
    },
  });
}

export function useDeleteDemand() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDemand(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-demands"] });
      queryClient.invalidateQueries({ queryKey: ["project-stats"] });
    },
  });
}
