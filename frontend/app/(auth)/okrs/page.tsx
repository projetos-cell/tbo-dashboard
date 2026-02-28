"use client";

import { useState, useMemo } from "react";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequireRole } from "@/components/auth/require-role";
import { OkrCycleSelector } from "@/components/okrs/okr-cycle-selector";
import { OkrKpis } from "@/components/okrs/okr-kpis";
import { OkrFilters } from "@/components/okrs/okr-filters";
import { OkrObjectiveCard } from "@/components/okrs/okr-objective-card";
import { OkrKeyResultRow } from "@/components/okrs/okr-key-result-row";
import { OkrCheckinDialog } from "@/components/okrs/okr-checkin-dialog";
import {
  useCycles,
  useActiveCycle,
  useObjectives,
  useKeyResults,
} from "@/hooks/use-okrs";
import { computeOkrKPIs } from "@/services/okrs";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/lib/supabase/types";

type KeyResultRow = Database["public"]["Tables"]["okr_key_results"]["Row"];

function OkrKeyResultList({
  objectiveId,
  onCheckin,
}: {
  objectiveId: string;
  onCheckin: (kr: KeyResultRow) => void;
}) {
  const { data: keyResults, isLoading } = useKeyResults(objectiveId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    );
  }

  if (!keyResults || keyResults.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2">
        Nenhum key result cadastrado.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {keyResults.map((kr) => (
        <OkrKeyResultRow key={kr.id} kr={kr} onCheckin={onCheckin} />
      ))}
    </div>
  );
}

function OkrsContent() {
  const { data: cycles, isLoading: loadingCycles } = useCycles();
  const { data: activeCycle } = useActiveCycle();

  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [checkinKr, setCheckinKr] = useState<KeyResultRow | null>(null);

  const effectiveCycleId = selectedCycleId ?? activeCycle?.id ?? null;

  const { data: objectives, isLoading: loadingObjs } = useObjectives({
    cycleId: effectiveCycleId ?? undefined,
    status: statusFilter || undefined,
    level: levelFilter || undefined,
  });

  const filtered = useMemo(() => {
    if (!objectives) return [];
    if (!search) return objectives;
    const q = search.toLowerCase();
    return objectives.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        (o.description ?? "").toLowerCase().includes(q),
    );
  }, [objectives, search]);

  const kpis = useMemo(() => computeOkrKPIs(filtered), [filtered]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loadingCycles) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
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
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6" />
            OKRs
          </h1>
          <p className="text-muted-foreground text-sm">
            Objetivos e resultados-chave
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OkrCycleSelector
            cycles={cycles ?? []}
            selectedId={effectiveCycleId}
            onSelect={setSelectedCycleId}
          />
        </div>
      </div>

      {/* KPIs */}
      <OkrKpis data={kpis} />

      {/* Filters */}
      <OkrFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        levelFilter={levelFilter}
        onLevelChange={setLevelFilter}
      />

      {/* Objectives list */}
      {loadingObjs ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Target className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">
            {effectiveCycleId
              ? "Nenhum objetivo encontrado neste ciclo."
              : "Selecione ou crie um ciclo para começar."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((obj) => (
            <OkrObjectiveCard
              key={obj.id}
              objective={obj}
              expanded={expandedIds.has(obj.id)}
              onToggle={() => toggleExpand(obj.id)}
            >
              <OkrKeyResultList
                objectiveId={obj.id}
                onCheckin={setCheckinKr}
              />
            </OkrObjectiveCard>
          ))}
        </div>
      )}

      {/* Check-in dialog */}
      <OkrCheckinDialog
        kr={checkinKr}
        open={!!checkinKr}
        onClose={() => setCheckinKr(null)}
      />
    </div>
  );
}

export default function OkrsPage() {
  return (
    <RequireRole allowed={["admin", "po", "member"]}>
      <OkrsContent />
    </RequireRole>
  );
}
