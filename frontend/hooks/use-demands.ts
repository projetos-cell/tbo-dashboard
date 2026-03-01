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

  type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["demands"]["Update"];
    }) => updateDemand(supabase, id, updates),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["project-demands"] });

      const previousDemands = queryClient.getQueriesData<DemandRow[]>({ queryKey: ["project-demands"] });

      queryClient.setQueriesData<DemandRow[]>(
        { queryKey: ["project-demands"] },
        (old) =>
          old?.map((d) =>
            d.id === variables.id ? { ...d, ...variables.updates } : d
          )
      );

      return { previousDemands };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousDemands) {
        for (const [queryKey, data] of context.previousDemands) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },

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
