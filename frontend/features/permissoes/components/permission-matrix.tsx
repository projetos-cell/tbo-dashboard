"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { IconShield, IconShieldCheck, IconTrash } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/lib/supabase/types";

type RoleRow = Database["public"]["Tables"]["roles"]["Row"];
type PermissionRow = Database["public"]["Tables"]["role_permissions"]["Row"];

const PERMISSION_COLS: { key: keyof Pick<PermissionRow, "can_view" | "can_create" | "can_edit" | "can_delete" | "can_export">; label: string }[] = [
  { key: "can_view", label: "Visualizar" },
  { key: "can_create", label: "Criar" },
  { key: "can_edit", label: "Editar" },
  { key: "can_delete", label: "Excluir" },
  { key: "can_export", label: "Exportar" },
];

interface PermissionMatrixProps {
  selectedRole: RoleRow | null;
  permissions: PermissionRow[];
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onToggle: (permId: string, field: typeof PERMISSION_COLS[number]["key"], currentValue: boolean | null) => void;
  onDeleteRole: (roleId: string) => void;
}

export function PermissionMatrix({
  selectedRole,
  permissions,
  isLoading,
  isUpdating,
  isDeleting,
  onToggle,
  onDeleteRole,
}: PermissionMatrixProps) {
  if (!selectedRole) {
    return (
      <Card className="flex-1 min-w-0">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <IconShield className="mb-3 h-10 w-10 text-gray-500/40" />
          <p className="text-sm font-medium">Selecione uma role</p>
          <p className="text-xs text-gray-500 mt-1">
            Clique em uma role na lista ao lado para visualizar e editar suas permissões.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 min-w-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedRole.color || "#6b7280" }} />
              {selectedRole.name}
            </CardTitle>
            {selectedRole.description && (
              <p className="text-sm text-gray-500 mt-1">{selectedRole.description}</p>
            )}
          </div>
          {!selectedRole.is_system && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteRole(selectedRole.id)}
              disabled={isDeleting}
            >
              <IconTrash className="mr-1.5 h-3.5 w-3.5" />
              Excluir
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : permissions.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <IconShieldCheck className="mb-2 h-8 w-8 text-gray-500/40" />
            <p className="text-sm text-gray-500">Nenhuma permissão configurada para esta role.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Módulo</TableHead>
                  {PERMISSION_COLS.map((col) => (
                    <TableHead key={col.key} className="text-center w-24">{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell className="font-medium capitalize">{perm.module}</TableCell>
                    {PERMISSION_COLS.map((col) => (
                      <TableCell key={col.key} className="text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={!!perm[col.key]}
                            onCheckedChange={() => onToggle(perm.id, col.key, perm[col.key])}
                            disabled={selectedRole.is_system || isUpdating}
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
  );
}
