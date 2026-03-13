"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconPlus,
  IconSearch,
  IconShield,
  IconShieldOff,
  IconTrash,
  IconUsers,
  IconUserCheck,
  IconClock,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState, EmptyState } from "@/components/shared";
import {
  usePortalAccess,
  useCreateAccess,
  useUpdateAccess,
  useDeleteAccess,
  useRevokeAccess,
} from "@/features/clientes/hooks/use-portal-cliente";
import { computePortalKPIs } from "@/services/portal-cliente";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";

type PortalAccessRow =
  Database["public"]["Tables"]["client_portal_access"]["Row"];

export default function PortalClientePage() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");

  const { data: accesses = [], isLoading, error, refetch } = usePortalAccess();
  const createAccess = useCreateAccess();
  const updateAccess = useUpdateAccess();
  const deleteAccessMut = useDeleteAccess();
  const revokeAccessMut = useRevokeAccess();

  const kpis = useMemo(() => computePortalKPIs(accesses), [accesses]);

  // Filtered list
  const filtered = useMemo(() => {
    if (!search) return accesses;
    const q = search.toLowerCase();
    return accesses.filter(
      (a) =>
        a.client_name.toLowerCase().includes(q) ||
        a.client_email.toLowerCase().includes(q)
    );
  }, [accesses, search]);

  function handleCreate() {
    if (!formName.trim() || !formEmail.trim() || !tenantId) return;
    createAccess.mutate(
      {
        client_name: formName.trim(),
        client_email: formEmail.trim(),
        tenant_id: tenantId,
        is_active: true,
      },
      {
        onSuccess: () => {
          setFormOpen(false);
          setFormName("");
          setFormEmail("");
        },
      }
    );
  }

  function handleToggleActive(access: PortalAccessRow) {
    updateAccess.mutate({
      id: access.id,
      updates: { is_active: !access.is_active },
    });
  }

  function handleRevoke(id: string) {
    revokeAccessMut.mutate(id);
  }

  function handleDelete(id: string) {
    deleteAccessMut.mutate(id);
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <RequireRole module="portal-cliente" minRole="diretoria">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Portal do Cliente
            </h1>
            <p className="text-sm text-gray-500">
              Gerencie o acesso dos clientes ao portal externo.
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Novo Acesso
          </Button>
        </div>

        {/* KPIs */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KpiCard
              label="Total acessos"
              value={kpis.total}
              icon={<IconUsers className="h-4 w-4 text-gray-500" />}
            />
            <KpiCard
              label="Ativos"
              value={kpis.active}
              color="#22c55e"
              icon={<IconUserCheck className="h-4 w-4 text-green-500" />}
            />
            <KpiCard
              label="Último login"
              value={
                kpis.lastLogin
                  ? format(new Date(kpis.lastLogin), "dd MMM yyyy, HH:mm", {
                    locale: ptBR,
                  })
                  : "—"
              }
              isText
              icon={<IconClock className="h-4 w-4 text-gray-500" />}
            />
          </div>
        )}

        {/* Search filter */}
        <div className="relative max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={IconUsers}
            title="Nenhum acesso configurado"
            description="Adicione clientes ao portal para que possam acompanhar seus projetos."
          />
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último login</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((access) => (
                  <TableRow key={access.id}>
                    <TableCell className="font-medium">
                      {access.client_name}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {access.client_email}
                    </TableCell>
                    <TableCell>
                      {access.is_active ? (
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: "#dcfce7",
                            color: "#15803d",
                          }}
                        >
                          Ativo
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: "#fee2e2",
                            color: "#b91c1c",
                          }}
                        >
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {access.last_login
                        ? format(
                          new Date(access.last_login),
                          "dd MMM yyyy, HH:mm",
                          { locale: ptBR }
                        )
                        : "—"}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {access.created_at
                        ? format(
                          new Date(access.created_at),
                          "dd MMM yyyy",
                          { locale: ptBR }
                        )
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleToggleActive(access)}
                          title={
                            access.is_active
                              ? "Desativar acesso"
                              : "Ativar acesso"
                          }
                        >
                          {access.is_active ? (
                            <IconShieldOff className="h-4 w-4" />
                          ) : (
                            <IconShield className="h-4 w-4" />
                          )}
                        </Button>
                        {access.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-orange-600 hover:text-orange-600"
                            onClick={() => handleRevoke(access.id)}
                            title="Revogar acesso"
                          >
                            <IconShieldOff className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-500"
                          onClick={() => handleDelete(access.id)}
                          title="Excluir"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create Form Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Acesso ao Portal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="client-name">Nome do cliente</Label>
                <Input
                  id="client-name"
                  placeholder="Ex: João Silva"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-email">Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="Ex: joao@empresa.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  !formName.trim() ||
                  !formEmail.trim() ||
                  createAccess.isPending
                }
              >
                Criar acesso
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireRole>
  );
}

/* ─── Sub-components ─── */

function KpiCard({
  label,
  value,
  color,
  isText,
  icon,
}: {
  label: string;
  value: number | string;
  color?: string;
  isText?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p
        className={`mt-1 font-bold ${isText ? "text-base" : "text-2xl"}`}
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
