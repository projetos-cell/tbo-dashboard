"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DecisionsList } from "@/components/decisions/decisions-list";
import { DecisionDetail } from "@/components/decisions/decision-detail";
import { DecisionForm } from "@/components/decisions/decision-form";
import { useDecisions } from "@/hooks/use-decisions";
import type { Database } from "@/lib/supabase/types";

type DecisionRow = Database["public"]["Tables"]["decisions"]["Row"];

export default function DecisoesPage() {
  const [search, setSearch] = useState("");
  const [selectedDecision, setSelectedDecision] =
    useState<DecisionRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data: decisions = [], isLoading } = useDecisions();

  const filtered = useMemo(() => {
    if (!search.trim()) return decisions;

    const q = search.toLowerCase();
    return decisions.filter(
      (d) =>
        d.title?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.decided_by?.toLowerCase().includes(q)
    );
  }, [decisions, search]);

  function handleSelect(decision: DecisionRow) {
    setSelectedDecision(decision);
  }

  function handleEdit(decision: DecisionRow) {
    setSelectedDecision(decision);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Decisoes</h1>
          <p className="text-sm text-muted-foreground">
            Registro e acompanhamento de decisoes do projeto.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Decisao
        </Button>
      </div>

      {/* Search + stats */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por titulo, descricao, responsavel..."
            className="pl-9"
          />
        </div>

        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearch("")}
          >
            Limpar
          </Button>
        )}

        <Badge variant="secondary" className="text-xs whitespace-nowrap">
          {filtered.length === decisions.length
            ? `${decisions.length} decisoes`
            : `${filtered.length} de ${decisions.length}`}
        </Badge>
      </div>

      {/* Decisions list */}
      <DecisionsList
        decisions={filtered}
        onSelect={handleSelect}
        onEdit={handleEdit}
      />

      {/* Decision detail sheet */}
      <DecisionDetail
        decision={selectedDecision}
        open={!!selectedDecision}
        onOpenChange={(open) => {
          if (!open) setSelectedDecision(null);
        }}
      />

      {/* Decision form dialog */}
      <DecisionForm
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </div>
  );
}
