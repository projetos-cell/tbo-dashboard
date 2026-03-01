"use client";

import { useState, useMemo } from "react";
import { useContracts } from "@/hooks/use-contracts";
import { ContractKPICards } from "@/components/contratos/contract-kpis";
import { ContractFilters } from "@/components/contratos/contract-filters";
import { ContractList } from "@/components/contratos/contract-list";
import { ContractDetailDialog } from "@/components/contratos/contract-detail-dialog";
import { ContractFormDialog } from "@/components/contratos/contract-form-dialog";
import { computeContractKPIs } from "@/services/contracts";
import { RequireRole } from "@/components/auth/require-role";
import { ErrorState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

export default function ContratosPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedContract, setSelectedContract] = useState<ContractRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<ContractRow | null>(null);

  const { data: contracts = [], isLoading, error, refetch } = useContracts({
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const kpis = useMemo(() => computeContractKPIs(contracts), [contracts]);

  function handleSelect(contract: ContractRow) {
    setSelectedContract(contract);
    setDetailOpen(true);
  }

  function handleEdit(contract: ContractRow) {
    setDetailOpen(false);
    setEditingContract(contract);
    setFormOpen(true);
  }

  function handleNew() {
    setEditingContract(null);
    setFormOpen(true);
  }

  if (error) {
    return (
      <RequireRole module="contratos">
        <ErrorState message={error.message} onRetry={() => refetch()} />
      </RequireRole>
    );
  }

  return (
    <RequireRole module="contratos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contratos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie contratos, valores e prazos de vencimento.
            </p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Contrato
          </Button>
        </div>

        <ContractKPICards kpis={kpis} />

        <ContractFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        <ContractList
          contracts={contracts}
          isLoading={isLoading}
          onSelect={handleSelect}
        />

        <ContractDetailDialog
          contract={selectedContract}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onEdit={handleEdit}
        />

        <ContractFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          contract={editingContract}
        />
      </div>
    </RequireRole>
  );
}
