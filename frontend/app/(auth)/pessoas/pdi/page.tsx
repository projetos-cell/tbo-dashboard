"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PdiKPICards } from "@/features/pdi/components/pdi-kpis";
import { PdiTable } from "@/features/pdi/components/pdi-table";
import { PdiDetail } from "@/features/pdi/components/pdi-detail";
import { PdiForm } from "@/features/pdi/components/pdi-form";
import { usePdis, useOpenPdiActionsCount } from "@/features/pdi/hooks/use-pdi";
import { useProfiles } from "@/features/people/hooks/use-people";
import { computePdiKPIs } from "@/features/pdi/services/pdi";
import { PDI_STATUS_KEYS, PDI_STATUS } from "@/features/pdi/utils/pdi-utils";
import { Plus, Search } from "lucide-react";
import type { PdiRow } from "@/features/pdi/services/pdi";

export default function PDIPage() {
  const { data: pdis, isLoading } = usePdis();
  const { data: openActionsCount } = useOpenPdiActionsCount();
  const { data: profiles } = useProfiles();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<PdiRow | null>(null);
  const [detailItem, setDetailItem] = useState<PdiRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const profileMap = useMemo(
    () => new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? "Sem nome"])),
    [profiles]
  );

  const filteredPdis = useMemo(() => {
    let list = pdis ?? [];
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (profileMap.get(p.person_id) ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [pdis, statusFilter, searchQuery, profileMap]);

  const kpis = useMemo(
    () => computePdiKPIs(pdis ?? [], openActionsCount ?? 0),
    [pdis, openActionsCount]
  );

  function handleSelectPdi(pdi: PdiRow) {
    setDetailItem(pdi);
    setDetailOpen(true);
  }

  function handleEdit(pdi: PdiRow) {
    setEditData(pdi);
    setFormOpen(true);
    setDetailOpen(false);
  }

  function handleNewPdi() {
    setEditData(null);
    setFormOpen(true);
  }

  // Update detailItem when data changes (e.g. after status change)
  const currentDetailItem = useMemo(() => {
    if (!detailItem) return null;
    return (pdis ?? []).find((p) => p.id === detailItem.id) ?? detailItem;
  }, [pdis, detailItem]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PDI - Plano de Desenvolvimento</h1>
          <p className="text-gray-500">
            Planos de desenvolvimento individual dos colaboradores.
          </p>
        </div>
        <Button onClick={handleNewPdi}>
          <Plus className="mr-1 h-4 w-4" /> Novo PDI
        </Button>
      </div>

      {/* KPIs */}
      <PdiKPICards kpis={kpis} isLoading={isLoading} />

      {/* Overdue banner */}
      {kpis.overdue > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {kpis.overdue} PDI(s) com status <strong>Atrasado</strong>. Revise os planos pendentes.
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título ou colaborador..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {PDI_STATUS_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {PDI_STATUS[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg border bg-gray-100/40" />
          ))}
        </div>
      ) : (
        <PdiTable pdis={filteredPdis} profileMap={profileMap} onSelect={handleSelectPdi} />
      )}

      {/* Detail sheet */}
      <PdiDetail
        pdi={currentDetailItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
      />

      {/* Form dialog */}
      <PdiForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editData={editData}
      />
    </div>
  );
}
