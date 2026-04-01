"use client";

import { useState } from "react";
import { IconScale, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ErrorState, EmptyState } from "@/components/shared";
import { DecisionsList } from "@/features/decisions/components/decisions-list";
import { DecisionDetail } from "@/features/decisions/components/decision-detail";
import { DecisionForm } from "@/features/decisions/components/decision-form";
import { DecisionFilters } from "@/features/decisions/components/decision-filters";
import { useDecisions } from "@/features/decisions/hooks/use-decisions";
import type { Database } from "@/lib/supabase/types";

type DecisionRow = Database["public"]["Tables"]["decisions"]["Row"];

export default function DecisionsPage() {
  const { data: decisions, isLoading, error, refetch } = useDecisions();
  const [selected, setSelected] = useState<DecisionRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  const filtered = (decisions ?? []).filter((d) => {
    if (search && !d.title?.toLowerCase().includes(search.toLowerCase()) && !d.description?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (dateFrom && d.created_at && d.created_at < dateFrom) return false;
    if (dateTo && d.created_at && d.created_at > dateTo) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Decisoes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro de decisoes estrategicas da empresa
          </p>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <IconPlus className="size-4 mr-1.5" />
          Nova Decisao
        </Button>
      </div>

      <DecisionFilters
        search={search}
        onSearchChange={setSearch}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        totalCount={decisions?.length ?? 0}
        filteredCount={filtered.length}
      />

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={IconScale}
          title="Nenhuma decisao registrada"
          description="Comece registrando decisoes importantes."
          cta={{ label: "Nova decisao", onClick: () => setFormOpen(true) }}
        />
      ) : (
        <DecisionsList
          decisions={filtered}
          onSelect={(d) => { setSelected(d); setDetailOpen(true); }}
          onEdit={(d) => { setSelected(d); setFormOpen(true); }}
        />
      )}

      <DecisionDetail
        decision={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <DecisionForm
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </div>
  );
}
