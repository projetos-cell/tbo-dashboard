"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/services/templates";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

export function useTemplates() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["templates"],
    queryFn: () => getTemplates(supabase),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTemplate() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      template: Database["public"]["Tables"]["dynamic_templates"]["Insert"]
    ) => createTemplate(supabase, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useUpdateTemplate() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["dynamic_templates"]["Update"];
    }) => updateTemplate(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useDeleteTemplate() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTemplate(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
