"use client";

import { useState, useMemo } from "react";
import { IconPlus } from "@tabler/icons-react";
import { RequireRole } from "@/features/auth/components/require-role";
import { useAuthStore } from "@/stores/auth-store";
import {
  useRoles,
  useRolePermissions,
  useUpdateRolePermission,
  useCreateRole,
  useDeleteRole,
} from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared";
import { PermissoesKpiCards } from "@/features/permissoes/components/permissoes-kpi-cards";
import { RoleList } from "@/features/permissoes/components/role-list";
import { PermissionMatrix } from "@/features/permissoes/components/permission-matrix";
import { CreateRoleDialog } from "@/features/permissoes/components/create-role-dialog";
import type { Database } from "@/lib/supabase/types";

type PermissionKey = keyof Pick<
  Database["public"]["Tables"]["role_permissions"]["Row"],
  "can_view" | "can_create" | "can_edit" | "can_delete" | "can_export"
>;

function PermissoesContent() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const { data: roles = [], isLoading: rolesLoading, error: rolesError, refetch: rolesRefetch } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) ?? null,
    [roles, selectedRoleId]
  );

  const { data: permissions = [], isLoading: permissionsLoading } = useRolePermissions(selectedRoleId);
  const updatePermission = useUpdateRolePermission();
  const createRoleMutation = useCreateRole();
  const deleteRoleMutation = useDeleteRole();

  const kpis = useMemo(() => {
    const total = roles.length;
    const system = roles.filter((r) => r.is_system).length;
    return { total, system, custom: total - system };
  }, [roles]);

  function handleToggle(permId: string, field: PermissionKey, currentValue: boolean | null) {
    updatePermission.mutate({ id: permId, updates: { [field]: !currentValue } });
  }

  function handleCreateRole(name: string, slug: string, description: string) {
    if (!tenantId) return;
    createRoleMutation.mutate(
      { name, slug, description: description || null, tenant_id: tenantId, is_system: false, is_default: false },
      { onSuccess: () => setCreateDialogOpen(false) }
    );
  }

  function handleDeleteRole(roleId: string) {
    if (!confirm("Tem certeza que deseja excluir esta role?")) return;
    deleteRoleMutation.mutate(roleId, {
      onSuccess: () => { if (selectedRoleId === roleId) setSelectedRoleId(null); },
    });
  }

  if (rolesError) {
    return <ErrorState message={rolesError.message} onRetry={() => rolesRefetch()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Permissões & Segurança</h1>
          <p className="text-sm text-gray-500">Gerencie roles, permissões e controle de acesso por módulo.</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Nova Role
        </Button>
      </div>

      <PermissoesKpiCards kpis={kpis} />

      {/* Main layout */}
      <div className="flex flex-col gap-6 md:flex-row">
        <RoleList
          roles={roles}
          isLoading={rolesLoading}
          selectedRoleId={selectedRoleId}
          onSelect={setSelectedRoleId}
        />
        <PermissionMatrix
          selectedRole={selectedRole}
          permissions={permissions}
          isLoading={permissionsLoading}
          isUpdating={updatePermission.isPending}
          isDeleting={deleteRoleMutation.isPending}
          onToggle={handleToggle}
          onDeleteRole={handleDeleteRole}
        />
      </div>

      <CreateRoleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        isCreating={createRoleMutation.isPending}
        onSubmit={handleCreateRole}
      />
    </div>
  );
}

export default function PermissoesPage() {
  return (
    <RequireRole minRole="diretoria" module="permissoes">
      <PermissoesContent />
    </RequireRole>
  );
}
