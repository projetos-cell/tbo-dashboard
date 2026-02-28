"use client";

import { useState, useMemo } from "react";
import { useClients } from "@/hooks/use-clients";
import { ClientKPICards } from "@/components/clientes/client-kpis";
import { ClientFilters } from "@/components/clientes/client-filters";
import { ClientGrid } from "@/components/clientes/client-grid";
import { ClientDetailDialog } from "@/components/clientes/client-detail-dialog";
import { ClientFormDialog } from "@/components/clientes/client-form-dialog";
import { computeClientKPIs } from "@/services/clients";
import { RequireRole } from "@/components/auth/require-role";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRow | null>(null);

  const { data: clients = [], isLoading } = useClients({
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const kpis = useMemo(() => computeClientKPIs(clients), [clients]);

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

  return (
    <RequireRole module="clientes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie sua carteira de clientes e acompanhe interações.
            </p>
          </div>
          <Button onClick={handleNewClient}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
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
        <ClientGrid
          clients={clients}
          isLoading={isLoading}
          onSelect={handleSelect}
        />

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
