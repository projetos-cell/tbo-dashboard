"use client";

import { useState, useMemo } from "react";
import { useClients, useImportClients } from "@/features/clientes/hooks/use-clients";
import { ClientKPICards } from "@/features/clientes/components/client-kpis";
import { ClientFilters } from "@/features/clientes/components/client-filters";
import { ClientGrid } from "@/features/clientes/components/client-grid";
import { ClientDetailDialog } from "@/features/clientes/components/client-detail-dialog";
import { ClientFormDialog } from "@/features/clientes/components/client-form-dialog";
import { computeClientKPIs } from "@/features/clientes/services/clients";
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState, EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Plus, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/types";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRow | null>(null);

  const { data: clients = [], isLoading, error, refetch } = useClients({
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const importMutation = useImportClients();

  const kpis = useMemo(() => computeClientKPIs(clients), [clients]);

  function handleImport() {
    importMutation.mutate(undefined, {
      onSuccess: (result) => {
        toast.success(
          `Importados: ${result.omie_imported} Omie + ${result.rd_imported} RD Station` +
          (result.merged ? ` (${result.merged} mesclados)` : "") +
          (result.projects_linked ? ` · ${result.projects_linked} projetos vinculados` : "")
        );
      },
      onError: (err) => {
        toast.error(`Erro na importação: ${err.message}`);
      },
    });
  }

  function handleSelect(client: ClientRow) {
    setSelectedClient(client);
    setDetailOpen(true);
  }

  function handleEdit(client: ClientRow) {
    setDetailOpen(false);
    setEditingClient(client);
    setFormOpen(true);
  }

  function handleNewClient() {
    setEditingClient(null);
    setFormOpen(true);
  }

  if (error) {
    return (
      <RequireRole module="clientes">
        <ErrorState message={error.message} onRetry={() => refetch()} />
      </RequireRole>
    );
  }

  return (
    <RequireRole module="clientes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-sm text-gray-500">
              Gerencie sua carteira de clientes e acompanhe interações.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleImport}
              disabled={importMutation.isPending}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${importMutation.isPending ? "animate-spin" : ""}`} />
              {importMutation.isPending ? "Importando…" : "Sincronizar Omie + RD"}
            </Button>
            <Button onClick={handleNewClient}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <ClientKPICards kpis={kpis} />

        {/* Filters */}
        <ClientFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Grid */}
        {!isLoading && !clients.length ? (
          <EmptyState
            icon={Users}
            title="Nenhum cliente encontrado"
            description="Cadastre o primeiro cliente para gerenciar sua carteira."
            cta={{ label: "Novo Cliente", onClick: handleNewClient }}
          />
        ) : (
          <ClientGrid
            clients={clients}
            isLoading={isLoading}
            onSelect={handleSelect}
          />
        )}

        {/* Detail Sheet */}
        <ClientDetailDialog
          client={selectedClient}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onEdit={handleEdit}
        />

        {/* Form Dialog */}
        <ClientFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          client={editingClient}
        />
      </div>
    </RequireRole>
  );
}
