"use client";

import { useState, useMemo } from "react";
import { RequireRole } from "@/components/auth/require-role";
import { useAuthStore } from "@/stores/auth-store";
import {
  useRoles,
  useRolePermissions,
  useUpdateRolePermission,
  useCreateRole,
  useDeleteRole,
} from "@/hooks/use-roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Shield,
  ShieldCheck,
  ShieldPlus,
  Users,
  Plus,
  Trash2,
} from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type RoleRow = Database["public"]["Tables"]["roles"]["Row"];

const PERMISSION_COLS = [
  { key: "can_view" as const, label: "Visualizar" },
  { key: "can_create" as const, label: "Criar" },
  { key: "can_edit" as const, label: "Editar" },
  { key: "can_delete" as const, label: "Excluir" },
  { key: "can_export" as const, label: "Exportar" },
];

function PermissoesContent() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleSlug, setNewRoleSlug] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) ?? null,
    [roles, selectedRoleId]
  );

  const {
    data: permissions = [],
    isLoading: permissionsLoading,
  } = useRolePermissions(selectedRoleId);

  const updatePermission = useUpdateRolePermission();
  const createRoleMutation = useCreateRole();
  const deleteRoleMutation = useDeleteRole();

  // KPI calculations
  const kpis = useMemo(() => {
    const total = roles.length;
    const system = roles.filter((r) => r.is_system).length;
    const custom = total - system;
    return { total, system, custom };
  }, [roles]);

  function handleTogglePermission(
    permId: string,
    field: (typeof PERMISSION_COLS)[number]["key"],
    currentValue: boolean | null
  ) {
    updatePermission.mutate({
      id: permId,
      updates: { [field]: !currentValue },
    });
  }

  function handleCreateRole() {
    if (!newRoleName.trim() || !newRoleSlug.trim() || !tenantId) return;
    createRoleMutation.mutate(
      {
        name: newRoleName.trim(),
        slug: newRoleSlug.trim(),
        description: newRoleDescription.trim() || null,
        tenant_id: tenantId,
        is_system: false,
        is_default: false,
      },
      {
        onSuccess: () => {
          setCreateDialogOpen(false);
          setNewRoleName("");
          setNewRoleSlug("");
          setNewRoleDescription("");
        },
      }
    );
  }

  function handleDeleteRole(roleId: string) {
    if (!confirm("Tem certeza que deseja excluir esta role?")) return;
    deleteRoleMutation.mutate(roleId, {
      onSuccess: () => {
        if (selectedRoleId === roleId) setSelectedRoleId(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Permissoes & Seguranca
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie roles, permissoes e controle de acesso por modulo.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Role
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles do Sistema</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.system}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles Customizadas</CardTitle>
            <ShieldPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.custom}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main layout: roles list + permission matrix */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left Panel: Role List */}
        <div className="w-full md:w-72 shrink-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-3 pt-0">
              {rolesLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))
              ) : roles.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Users className="mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma role encontrada
                  </p>
                </div>
              ) : (
                roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent ${
                      selectedRoleId === role.id
                        ? "border-primary bg-accent"
                        : "border-transparent"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: role.color || "#6b7280",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{role.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {role.slug}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {role.is_system && (
                        <Badge variant="secondary" className="text-[10px] px-1.5">
                          Sistema
                        </Badge>
                      )}
                      {role.is_default && (
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          Padrao
                        </Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Permission Matrix */}
        <div className="flex-1 min-w-0">
          {!selectedRole ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Shield className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm font-medium">Selecione uma role</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique em uma role na lista ao lado para visualizar e editar suas
                  permissoes.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: selectedRole.color || "#6b7280",
                        }}
                      />
                      {selectedRole.name}
                    </CardTitle>
                    {selectedRole.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedRole.description}
                      </p>
                    )}
                  </div>
                  {!selectedRole.is_system && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRole(selectedRole.id)}
                      disabled={deleteRoleMutation.isPending}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Excluir
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {permissionsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : permissions.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <ShieldCheck className="mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma permissao configurada para esta role.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-48">Modulo</TableHead>
                          {PERMISSION_COLS.map((col) => (
                            <TableHead key={col.key} className="text-center w-24">
                              {col.label}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {permissions.map((perm) => (
                          <TableRow key={perm.id}>
                            <TableCell className="font-medium capitalize">
                              {perm.module}
                            </TableCell>
                            {PERMISSION_COLS.map((col) => (
                              <TableCell key={col.key} className="text-center">
                                <div className="flex items-center justify-center">
                                  <Checkbox
                                    checked={!!perm[col.key]}
                                    onCheckedChange={() =>
                                      handleTogglePermission(
                                        perm.id,
                                        col.key,
                                        perm[col.key]
                                      )
                                    }
                                    disabled={
                                      selectedRole.is_system ||
                                      updatePermission.isPending
                                    }
                                  />
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Role Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">Nome</Label>
              <Input
                id="role-name"
                placeholder="Ex: Gerente de Projetos"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-slug">Slug</Label>
              <Input
                id="role-slug"
                placeholder="Ex: gerente-projetos"
                value={newRoleSlug}
                onChange={(e) => setNewRoleSlug(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Descricao (opcional)</Label>
              <Input
                id="role-description"
                placeholder="Descricao da role..."
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateRole}
              disabled={
                !newRoleName.trim() ||
                !newRoleSlug.trim() ||
                createRoleMutation.isPending
              }
            >
              {createRoleMutation.isPending ? "Criando..." : "Criar Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PermissoesPage() {
  return (
    <RequireRole allowed={["founder"]} module="permissoes">
      <PermissoesContent />
    </RequireRole>
  );
}
