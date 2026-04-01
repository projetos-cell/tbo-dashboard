"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  useContracts,
  useContractPersonNames,
  useDeleteContract,
  useUpdateContract,
} from "@/features/contratos/hooks/use-contracts";
import { ContractKPICards } from "@/features/contratos/components/contract-kpis";
import { ContractDataTable } from "@/features/contratos/components/contract-data-table";
import { ContractDetailDialog } from "@/features/contratos/components/contract-detail-dialog";
import { ContractFormDialog } from "@/features/contratos/components/contract-form-dialog";
import {
  ContractFiltersPanel,
  ActiveFiltersBadges,
} from "@/features/contratos/components/contract-filters-panel";
import { ContractGenerator } from "@/features/contratos/components/contract-generator";
import { computeTabKPIs } from "@/features/contratos/services/contracts";
import type { ContractFilters } from "@/features/contratos/services/contracts";
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState, EmptyState } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useImportClicksignContracts } from "@/features/contratos/hooks/use-clicksign";
import { ClicksignStatusBadge } from "@/features/contratos/components/clicksign-status-badge";
import { useTablePreferences } from "@/hooks/use-table-preferences";
import { TableDensityToggle } from "@/components/shared";
import {
  IconArrowRight,
  IconBell,
  IconCopy,
  IconFileCheck,
  IconFileText,
  IconFilter,
  IconDownload,
  IconLoader2,
  IconPlus,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import { CONTRACT_TABS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

/* ─── Module Cards ───────────────────────────────────────────────── */

const T_GLASS = {
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(255,255,255,0.45)",
  glassShadow: "0 8px 32px rgba(15,15,15,0.06), 0 1px 3px rgba(15,15,15,0.04)",
  glassBlur: "blur(16px) saturate(180%)",
  rSm: "10px",
  text: "#0f0f0f",
  muted: "#4a4a4a",
};

const CONTRACT_MODULES = [
  { href: "/contratos/ativos", label: "Contratos Ativos", description: "Contratos vigentes por categoria", icon: IconFileCheck, color: "#22c55e" },
  { href: "/contratos/renovacoes", label: "Renovações & Aditivos", description: "Acompanhamento de renovações", icon: IconRefresh, color: "#3b82f6" },
  { href: "/contratos/modelos", label: "Modelos", description: "Templates reutilizáveis", icon: IconCopy, color: "#8b5cf6" },
  { href: "/contratos/alertas", label: "Alertas", description: "Vencimentos e notificações", icon: IconBell, color: "#f59e0b" },
];

function ContractModuleCard({ mod }: { mod: typeof CONTRACT_MODULES[number] }) {
  const Icon = mod.icon;
  return (
    <Link href={mod.href} className="block transition-all hover:scale-[1.005]">
      <div className="p-4 flex items-center gap-3" style={{ background: T_GLASS.glass, backdropFilter: T_GLASS.glassBlur, WebkitBackdropFilter: T_GLASS.glassBlur, border: `1px solid ${T_GLASS.glassBorder}`, borderRadius: T_GLASS.rSm, boxShadow: T_GLASS.glassShadow }}>
        <div className="rounded-lg p-2.5 shrink-0" style={{ background: `${mod.color}15` }}>
          <Icon className="size-5" style={{ color: mod.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: T_GLASS.text }}>{mod.label}</p>
          <p className="text-[11px] truncate" style={{ color: T_GLASS.muted }}>{mod.description}</p>
        </div>
        <IconArrowRight className="size-4 shrink-0" style={{ color: T_GLASS.muted }} />
      </div>
    </Link>
  );
}

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
  const updateMut = useUpdateContract();
  const importClicksign = useImportClicksignContracts();
  const { density, saveDensity } = useTablePreferences("contratos");
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

  const kpis = useMemo(
    () => computeTabKPIs(contracts, activeTab),
    [contracts, activeTab],
  );

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleFiltersChange = useCallback(
    (next: ContractFilters) => {
      const { search: _s, categories: _c, ...rest } = next;
      setAdvancedFilters(rest);
    },
    [],
  );

  const handleTabChange = useCallback((tabKey: string) => {
    setActiveTab(tabKey);
    setAdvancedFilters((prev) => ({ ...prev, categories: undefined }));
  }, []);

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

  const handleInlineUpdate = useCallback(
    (id: string, updates: Partial<ContractRow>) => {
      updateMut.mutate(
        { id, updates },
        {
          onError: () =>
            toast({
              title: "Erro ao atualizar",
              description: "Nao foi possivel salvar a alteracao.",
              variant: "destructive",
            }),
        },
      );
    },
    [updateMut, toast],
  );

  async function handleDelete(contract: ContractRow) {
    try {
      await deleteMut.mutateAsync(contract.id);
      setDetailOpen(false);
      setSelectedContract(null);
      toast({
        title: "Contrato excluido",
        description: `"${contract.title}" foi removido.`,
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Nao foi possivel excluir o contrato.",
        variant: "destructive",
      });
    }
  }

  // ─── Error state ──────────────────────────────────────────────────
  if (error) {
    return (
      <RequireRole module="contratos" minRole="admin">
        <ErrorState message={error.message} onRetry={() => refetch()} />
      </RequireRole>
    );
  }

  const activeFilterCount = Object.values(advancedFilters).filter(
    (v) => v !== undefined && v !== null && v !== "",
  ).length;

  return (
    <RequireRole module="contratos" minRole="admin">
      <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
      <div className="min-h-[calc(100dvh-64px)] p-5 space-y-4">
        {/* ── Gradient Header Bar ─────────────────────────────── */}
        <div className="relative overflow-hidden p-4" style={{ background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #c45a1a 100%)", borderRadius: "16px", boxShadow: "0 8px 32px rgba(196,90,26,0.15)" }}>
          <div className="absolute inset-0 opacity-[0.04]"><div className="absolute -top-8 -right-8 size-32 border-[2px] border-white rounded-full" /><div className="absolute bottom-0 left-10 size-16 border-[2px] border-white rounded-full" /></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-mono text-xs bg-white/10 text-white border-white/20">
                {contracts.length} contratos
              </Badge>
              <ClicksignStatusBadge />
            </div>
            <div className="flex items-center gap-2">
              <ContractGenerator variant="ghost" size="sm" label="Gerador" />
              <Button size="sm" className="h-8 bg-white/15 hover:bg-white/25 text-white border-white/20" asChild>
                <Link href="/contratos/novo">
                  <IconPlus className="h-3.5 w-3.5 mr-1" />
                  Novo Contrato
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* ── Module Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {CONTRACT_MODULES.map((mod) => (
            <ContractModuleCard key={mod.href} mod={mod} />
          ))}
        </div>

        {/* ── Controls Row ────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Search inline */}
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 w-[180px] text-xs"
              />
            </div>

            {/* Filters */}
            <ContractFiltersPanel
              filters={mergedFilters}
              onChange={handleFiltersChange}
              personNames={personNames}
              lockedCategories={lockedCategories}
            />
            {activeFilterCount > 0 && (
              <Badge variant="outline" className="text-[10px] h-5">
                <IconFilter className="h-2.5 w-2.5 mr-0.5" />
                {activeFilterCount}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Import */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => importClicksign.mutate()}
              disabled={importClicksign.isPending}
            >
              {importClicksign.isPending ? (
                <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <IconDownload className="h-3.5 w-3.5" />
              )}
            </Button>

            {/* Density toggle */}
            <TableDensityToggle density={density} onChange={saveDensity} />
          </div>
        </div>

        {/* ── Tabs — pill style ───────────────────────────────── */}
        <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 w-fit">
          {CONTRACT_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-md transition-all
                  ${
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Active filter badges ────────────────────────────── */}
        <ActiveFiltersBadges
          filters={mergedFilters}
          onChange={handleFiltersChange}
          lockedCategories={lockedCategories}
        />

        {/* ── KPIs — inline compact ───────────────────────────── */}
        <ContractKPICards kpis={kpis} tab={activeTab} />

        {/* ── Data Table ──────────────────────────────────────── */}
        {!isLoading && contracts.length === 0 ? (
          <EmptyState
            icon={IconFileText}
            title="Nenhum contrato encontrado"
            description={
              search
                ? `Nenhum resultado para "${search}".`
                : "Crie o primeiro contrato ou importe do Clicksign."
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
            onInlineUpdate={handleInlineUpdate}
          />
        )}

        {/* ── Dialogs ─────────────────────────────────────────── */}
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
      </div>
    </RequireRole>
  );
}
