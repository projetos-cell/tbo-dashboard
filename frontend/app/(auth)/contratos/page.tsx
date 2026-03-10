"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useContracts,
  useContractPersonNames,
  useDeleteContract,
} from "@/features/contratos/hooks/use-contracts";
import { ContractKPICards } from "@/features/contratos/components/contract-kpis";
import { ContractDataTable } from "@/features/contratos/components/contract-data-table";
import { ContractDetailDialog } from "@/features/contratos/components/contract-detail-dialog";
import { ContractFormDialog } from "@/features/contratos/components/contract-form-dialog";
import { NewContractDropdown } from "@/features/contratos/components/new-contract-dropdown";
import {
  ContractFiltersPanel,
  ActiveFiltersBadges,
} from "@/features/contratos/components/contract-filters-panel";
import { computeTabKPIs } from "@/features/contratos/services/contracts";
import type { ContractFilters } from "@/features/contratos/services/contracts";
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState, EmptyState } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileText, Search } from "lucide-react";
import { CONTRACT_TABS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

export default function ContratosPage() {
  // ─── State ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<ContractFilters>({});
  const [selectedContract, setSelectedContract] =
    useState<ContractRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingContract, setEditingContract] =
    useState<ContractRow | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<string | undefined>();

  const { toast } = useToast();
  const deleteMut = useDeleteContract();
  const personNames = useContractPersonNames();

  // ─── Tab config ───────────────────────────────────────────────────
  const currentTab =
    CONTRACT_TABS.find((t) => t.key === activeTab) ?? CONTRACT_TABS[0];
  const lockedCategories = currentTab.categories ?? undefined;

  // ─── Merge filters ────────────────────────────────────────────────
  const mergedFilters: ContractFilters = useMemo(
    () => ({
      ...advancedFilters,
      search: search || undefined,
      // Tab categories override advanced category filter
      categories: lockedCategories
        ? [...lockedCategories]
        : advancedFilters.categories,
    }),
    [advancedFilters, search, lockedCategories],
  );

  // ─── Data ─────────────────────────────────────────────────────────
  const {
    data: contracts = [],
    isLoading,
    error,
    refetch,
  } = useContracts(mergedFilters);

  // ─── KPIs dinâmicos por tab ───────────────────────────────────────
  const kpis = useMemo(
    () => computeTabKPIs(contracts, activeTab),
    [contracts, activeTab],
  );

  // ─── Filter handlers ──────────────────────────────────────────────
  const handleFiltersChange = useCallback(
    (next: ContractFilters) => {
      // Keep search separate from advanced filters
      const { search: _s, categories: _c, ...rest } = next;
      setAdvancedFilters(rest);
    },
    [],
  );

  // Reset advanced filters when switching tabs
  const handleTabChange = useCallback(
    (tabKey: string) => {
      setActiveTab(tabKey);
      // Keep non-category filters, reset categories to let tab take over
      setAdvancedFilters((prev) => ({ ...prev, categories: undefined }));
    },
    [],
  );

  // ─── Handlers ─────────────────────────────────────────────────────
  function handleSelect(contract: ContractRow) {
    setSelectedContract(contract);
    setDetailOpen(true);
  }

  function handleEdit(contract: ContractRow) {
    setDetailOpen(false);
    setEditingContract(contract);
    setDefaultCategory(undefined);
    setFormOpen(true);
  }

  function handleNewWithCategory(category: string) {
    setEditingContract(null);
    setDefaultCategory(category);
    setFormOpen(true);
  }

  async function handleDelete(contract: ContractRow) {
    try {
      await deleteMut.mutateAsync(contract.id);
      setDetailOpen(false);
      setSelectedContract(null);
      toast({
        title: "Contrato excluído",
        description: `"${contract.title}" foi removido com sucesso.`,
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o contrato. Tente novamente.",
        variant: "destructive",
      });
    }
  }

  // ─── Error state ──────────────────────────────────────────────────
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
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contratos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie contratos, valores e prazos de vencimento.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Busca global */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar contratos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-[220px]"
              />
            </div>
            {/* Filtros avançados */}
            <ContractFiltersPanel
              filters={mergedFilters}
              onChange={handleFiltersChange}
              personNames={personNames}
              lockedCategories={lockedCategories}
            />
            <NewContractDropdown onSelect={handleNewWithCategory} />
          </div>
        </div>

        {/* ── Active filter badges ────────────────────────────────── */}
        <ActiveFiltersBadges
          filters={mergedFilters}
          onChange={handleFiltersChange}
          lockedCategories={lockedCategories}
        />

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className="border-b border-border/50">
          <nav className="-mb-px flex gap-6" aria-label="Tabs">
            {CONTRACT_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`
                    relative pb-3 text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "text-[#f97316]"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#f97316]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── KPI Cards ────────────────────────────────────────────── */}
        <ContractKPICards kpis={kpis} tab={activeTab} />

        {/* ── Data Table ───────────────────────────────────────────── */}
        {!isLoading && contracts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum contrato encontrado"
            description={
              search
                ? `Nenhum resultado para "${search}". Tente outro termo.`
                : "Cadastre o primeiro contrato para controlar valores e prazos."
            }
            cta={{
              label: "Novo Contrato",
              onClick: () => handleNewWithCategory("cliente"),
            }}
          />
        ) : (
          <ContractDataTable
            contracts={contracts}
            isLoading={isLoading}
            showCategory={activeTab === "all"}
            onEdit={handleEdit}
            onSelect={handleSelect}
            onDelete={handleDelete}
          />
        )}

        {/* ── Dialogs ──────────────────────────────────────────────── */}
        <ContractDetailDialog
          contract={selectedContract}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <ContractFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          contract={editingContract}
          defaultCategory={defaultCategory}
        />
      </div>
    </RequireRole>
  );
}
