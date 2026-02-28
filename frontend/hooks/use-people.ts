"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import { getPeople, getPersonById, updatePerson, getTeams } from "@/services/people";

export function usePeople(filters?: {
  status?: string;
  bu?: string;
  search?: string;
}) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["people", tenantId, filters],
    queryFn: () => getPeople(supabase, tenantId!, filters),
    enabled: !!tenantId,
  });
}

export function usePerson(id: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["person", id],
    queryFn: () => getPersonById(supabase, id!, tenantId!),
    enabled: !!id && !!tenantId,
  });
}

export function useUpdatePerson() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["profiles"]["Update"];
    }) => updatePerson(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["person"] });
    },
  });
}

export function useTeams() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["teams", tenantId],
    queryFn: () => getTeams(supabase, tenantId!),
    enabled: !!tenantId,
  });
}
