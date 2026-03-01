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
import { logAuditTrail } from "@/lib/audit-trail";
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
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useRolePermissions(roleId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: () => listRolePermissions(supabase, roleId!),
    staleTime: 1000 * 60 * 5,
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "permission_change",
        table: "role_permissions",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },
  });
}

export function useCreateRole() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: Database["public"]["Tables"]["roles"]["Insert"]) =>
      createRole(supabase, role),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "create",
        table: "roles",
        recordId: (data as Record<string, unknown>)?.id as string ?? "unknown",
        after: variables as unknown as Record<string, unknown>,
      });
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "permission_change",
        table: "roles",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });
    },
  });
}

export function useDeleteRole() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRole(supabase, id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });

      logAuditTrail({
        userId: useAuthStore.getState().user?.id ?? "unknown",
        action: "delete",
        table: "roles",
        recordId: id,
        before: { id },
      });
    },
  });
}
