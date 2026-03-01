"use client";

import { useState, useMemo } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EntregasKPIs as EntregasKpis } from "@/components/entregas/entregas-kpis";
import { EntregasList } from "@/components/entregas/entregas-list";
import { EntregasDetail } from "@/components/entregas/entregas-detail";
import { useDeliverables } from "@/hooks/use-entregas";
import { ErrorState } from "@/components/shared";
import { DELIVERABLE_STATUS, DELIVERABLE_TYPES } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type DeliverableRow = Database["public"]["Tables"]["deliverables"]["Row"];

export default function EntregasPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedDeliverable, setSelectedDeliverable] =
    useState<DeliverableRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: deliverables = [], isLoading, error, refetch } = useDeliverables();

  const filtered = useMemo(() => {
    let result = deliverables;

    if (statusFilter) {
      result = result.filter((d) => d.status === statusFilter);
    }

    if (typeFilter) {
      result = result.filter((d) => d.type === typeFilter);
    }

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name?.toLowerCase().includes(term) ||
          d.project_name?.toLowerCase().includes(term) ||
          d.owner_name?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [deliverables, statusFilter, typeFilter, search]);

  const hasFilters = search || statusFilter || typeFilter;

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
  }

  function handleSelect(deliverable: DeliverableRow) {
    setSelectedDeliverable(deliverable);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Entregas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as entregas dos projetos.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Entrega
        </Button>
      </div>

      {/* KPIs */}
      <EntregasKpis deliverables={deliverables} />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar entregas..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DELIVERABLE_STATUS).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DELIVERABLE_TYPES).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : (
        <EntregasList deliverables={filtered} onSelect={handleSelect} />
      )}

      {/* Detail Sheet */}
      <EntregasDetail
        deliverable={selectedDeliverable}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
