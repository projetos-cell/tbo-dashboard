"use client";

import { useState, useMemo } from "react";
import {
  useServices,
  useUpdateService,
  useDeleteService,
} from "@/features/comercial/hooks/use-services";
import { ServiceFormDialog } from "@/features/comercial/components/service-form-dialog";
import { ServiceDataTable } from "@/features/comercial/components/service-data-table";
import { ServiceKPIs } from "@/features/comercial/components/service-kpis";
import { EmptyState, ErrorState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconPlus, IconSearch, IconPackage } from "@tabler/icons-react";
import { BU_LIST } from "@/lib/constants";
import type {
  ServiceRow,
  ServiceStatus,
} from "@/features/comercial/services/services-catalog";

const STATUS_TABS: { value: ServiceStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "draft", label: "Rascunhos" },
  { value: "archived", label: "Arquivados" },
];

export default function ComercialServicos() {
  const [statusTab, setStatusTab] = useState<ServiceStatus | "all">("all");
  const [buFilter, setBuFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceRow | null>(null);

  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const { data: allServices = [], isLoading, error, refetch } = useServices();

  const filtered = useMemo(() => {
    let list = allServices;
    if (statusTab !== "all") list = list.filter((s) => s.status === statusTab);
    if (buFilter !== "all") list = list.filter((s) => s.bu === buFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allServices, statusTab, buFilter, search]);

  function handleNew() {
    setEditingService(null);
    setFormOpen(true);
  }

  function handleEdit(service: ServiceRow) {
    setEditingService(service);
    setFormOpen(true);
  }

  function handleArchive(service: ServiceRow) {
    const newStatus = service.status === "archived" ? "active" : "archived";
    updateMutation.mutate({ id: service.id, updates: { status: newStatus } });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catalogo de Servicos</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie servicos, precos base e margens para orcamentos e propostas.
          </p>
        </div>
        <Button onClick={handleNew}>
          <IconPlus className="mr-1 h-4 w-4" /> Novo Servico
        </Button>
      </div>

      {/* KPIs */}
      {!isLoading && !error && allServices.length > 0 && (
        <ServiceKPIs services={allServices} />
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          value={statusTab}
          onValueChange={(v) => setStatusTab(v as ServiceStatus | "all")}
        >
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select value={buFilter} onValueChange={setBuFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Business Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas BUs</SelectItem>
            {BU_LIST.map((bu) => (
              <SelectItem key={bu} value={bu}>
                {bu}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative max-w-sm flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar servico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState
          message="Nao foi possivel carregar os servicos."
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconPackage}
          title={
            search || statusTab !== "all" || buFilter !== "all"
              ? "Nenhum servico encontrado"
              : "Nenhum servico cadastrado"
          }
          description={
            search || statusTab !== "all" || buFilter !== "all"
              ? "Tente ajustar os filtros."
              : "Cadastre seu primeiro servico para montar orcamentos e propostas."
          }
          cta={
            !search && statusTab === "all" && buFilter === "all"
              ? { label: "Novo Servico", onClick: handleNew }
              : undefined
          }
        />
      ) : (
        <ServiceDataTable
          services={filtered}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onDelete={setDeleteTarget}
        />
      )}

      {/* Form Dialog */}
      <ServiceFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingService(null);
        }}
        service={editingService}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir servico?</AlertDialogTitle>
            <AlertDialogDescription>
              O servico &quot;{deleteTarget?.name}&quot; sera removido permanentemente.
              Propostas existentes que referenciam este servico nao serao afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
