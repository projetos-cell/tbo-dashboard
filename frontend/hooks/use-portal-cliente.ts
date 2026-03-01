"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import {
  listPortalAccess,
  createAccess,
  updateAccess,
  deleteAccess,
  revokeAccess,
} from "@/services/portal-cliente";

export function usePortalAccess() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["portal-access", tenantId],
    queryFn: () => listPortalAccess(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateAccess() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      access: Database["public"]["Tables"]["client_portal_access"]["Insert"]
    ) => createAccess(supabase, access),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-access"] });
    },
  });
}

export function useUpdateAccess() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["client_portal_access"]["Update"];
    }) => updateAccess(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-access"] });
    },
  });
}

export function useDeleteAccess() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAccess(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-access"] });
    },
  });
}

export function useRevokeAccess() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revokeAccess(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-access"] });
    },
  });
}
