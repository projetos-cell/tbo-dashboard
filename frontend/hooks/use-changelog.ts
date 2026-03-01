"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getChangelogEntries,
  createChangelogEntry,
  updateChangelogEntry,
  deleteChangelogEntry,
} from "@/services/changelog";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

export function useChangelog() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["changelog"],
    queryFn: () => getChangelogEntries(supabase),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateChangelog() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entry: Database["public"]["Tables"]["changelog_entries"]["Insert"]) =>
      createChangelogEntry(supabase, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changelog"] });
    },
  });
}

export function useUpdateChangelog() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["changelog_entries"]["Update"];
    }) => updateChangelogEntry(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changelog"] });
    },
  });
}

export function useDeleteChangelog() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteChangelogEntry(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changelog"] });
    },
  });
}
