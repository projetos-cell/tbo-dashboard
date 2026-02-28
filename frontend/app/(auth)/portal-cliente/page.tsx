"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  Users,
  UserCheck,
  Clock,
} from "lucide-react";
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
import { RequireRole } from "@/components/auth/require-role";
import {
  usePortalAccess,
  useCreateAccess,
  useUpdateAccess,
  useDeleteAccess,
  useRevokeAccess,
} from "@/hooks/use-portal-cliente";
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

  const { data: accesses = [], isLoading, error } = usePortalAccess();
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
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive text-lg font-medium">
          Erro ao carregar acessos do portal
        </p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <RequireRole module="portal-cliente" allowed={["admin", "po"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Portal do Cliente
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie o acesso dos clientes ao portal externo.
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
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
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              label="Ativos"
              value={kpis.active}
              color="#22c55e"
              icon={<UserCheck className="h-4 w-4 text-green-500" />}
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
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        )}

        {/* Search filter */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium">Nenhum acesso configurado</p>
            <p className="text-xs text-muted-foreground">
              Adicione clientes ao portal para que possam acompanhar seus
              projetos.
            </p>
          </div>
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
                    <TableCell className="text-muted-foreground">
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
                    <TableCell className="text-muted-foreground">
                      {access.last_login
                        ? format(
                            new Date(access.last_login),
                            "dd MMM yyyy, HH:mm",
                            { locale: ptBR }
                          )
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
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
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <Shield className="h-4 w-4" />
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
                            <ShieldOff className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(access.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
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
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm text-muted-foreground">{label}</p>
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
