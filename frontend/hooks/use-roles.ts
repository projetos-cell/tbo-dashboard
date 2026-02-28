"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  listRoles,
  listRolePermissions,
  updateRolePermission,
  createRole,
  updateRole,
  deleteRole,
} from "@/services/permissions";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function useRoles() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["roles", tenantId],
    queryFn: () => listRoles(supabase, tenantId!),
    enabled: !!tenantId,
  });
}

export function useRolePermissions(roleId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: () => listRolePermissions(supabase, roleId!),
    enabled: !!roleId,
  });
}

export function useUpdateRolePermission() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Database["public"]["Tables"]["role_permissions"]["Row"]>;
    }) => updateRolePermission(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
    },
  });
}

export function useCreateRole() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: Database["public"]["Tables"]["roles"]["Insert"]) =>
      createRole(supabase, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useUpdateRole() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Database["public"]["Tables"]["roles"]["Row"]>;
    }) => updateRole(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useDeleteRole() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRole(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}
