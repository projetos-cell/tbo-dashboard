"use client";

import { useState, useMemo } from "react";
import { useDecisions } from "@/features/decisions/hooks/use-decisions";
import { DecisionsList } from "@/features/decisions/components/decisions-list";
import { DecisionDetail } from "@/features/decisions/components/decision-detail";
import { DecisionFilters } from "@/features/decisions/components/decision-filters";
import { DecisionForm } from "@/features/decisions/components/decision-form";
import { ErrorState } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";

type DecisionRow = Database["public"]["Tables"]["decisions"]["Row"];

export default function DecisionsPage() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDecision, setSelectedDecision] = useState<DecisionRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const { data: decisions = [], isLoading, isError, refetch } = useDecisions();

  const filtered = useMemo(() => {
    return decisions.filter((d) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        d.title.toLowerCase().includes(q) ||
        (d.description?.toLowerCase().includes(q) ?? false) ||
        (d.decided_by?.toLowerCase().includes(q) ?? false);

      const createdAt = d.created_at ? new Date(d.created_at) : null;
      const matchesFrom =
        !dateFrom || (createdAt !== null && createdAt >= new Date(dateFrom));
      const matchesTo =
        !dateTo || (createdAt !== null && createdAt <= new Date(dateTo + "T23:59:59"));

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [decisions, search, dateFrom, dateTo]);

  const handleSelect = (decision: DecisionRow) => {
    setSelectedDecision(decision);
    setDetailOpen(true);
  };

  const handleEdit = (decision: DecisionRow) => {
    setSelectedDecision(decision);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Decisões</h1>
          <p className="text-muted-foreground">
            Registro de decisões tomadas em projetos e reuniões.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2 shrink-0">
          <IconPlus className="size-4" />
          Nova Decisão
        </Button>
      </div>

      {/* Filters */}
      {!isLoading && !isError && (
        <DecisionFilters
          search={search}
          onSearchChange={setSearch}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          totalCount={decisions.length}
          filteredCount={filtered.length}
        />
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="size-7 rounded" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <ErrorState
          message="Não foi possível carregar as decisões."
          onRetry={() => refetch()}
        />
      )}

      {/* List */}
      {!isLoading && !isError && (
        <DecisionsList
          decisions={filtered}
          onSelect={handleSelect}
          onEdit={handleEdit}
        />
      )}

      {/* Detail sheet */}
      <DecisionDetail
        decision={selectedDecision}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedDecision(null);
        }}
      />

      {/* Create form */}
      <DecisionForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
