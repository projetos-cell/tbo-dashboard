"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePeople, usePeopleKPIs, usePeopleFilterOptions, usePeopleSnapshot, usePeopleNudges } from "@/features/people/hooks/use-people";
import { usePeopleAutomations } from "@/features/people/hooks/use-people-automations";
import { useViewState } from "@/hooks/use-view-state";
import {
  PeopleKPICardsV2,
  type PeopleKPIKey,
} from "@/features/people/components/people-kpis-v2";
import { PeopleFilters } from "@/features/people/components/people-filters";
import { PersonCard } from "@/features/people/components/person-card";
import { PersonDetail } from "@/features/people/components/person-detail";
import { PeopleNudges } from "@/features/people/components/people-nudges";
import { ErrorState, EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/supabase/types";
import type { SortSpec } from "@/services/view-state";
import {
  type PeopleFiltersSpec,
  type PeopleKPIPreset,
  KPI_FILTER_PRESETS,
  DEFAULT_PEOPLE_SORT,
  filtersToJson,
  jsonToFilters,
  hasActiveFilters,
} from "@/features/people/utils/people-filters";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const PAGE_SIZE = 40;

export default function PessoasPage() {
  const router = useRouter();

  // ── View state persistence ─────────────────────────────────────────────
  const {
    viewState,
    isLoading: stateLoading,
    updateFilters: persistFilters,
    updateSort: persistSort,
  } = useViewState("pessoas", "visao_geral");

  // ── Local filter/sort state (derived from persisted on first load) ─────
  const [filters, setFilters] = useState<PeopleFiltersSpec>({});
  const [sort, setSort] = useState<SortSpec[]>(DEFAULT_PEOPLE_SORT);
  const [page, setPage] = useState(0);
  const [activeKPI, setActiveKPI] = useState<PeopleKPIKey | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<ProfileRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Hydrate from persisted state on first load
  useEffect(() => {
    if (stateLoading || initialized) return;
    const restoredFilters = jsonToFilters(viewState.filters);
    const restoredSort = (viewState.sort as SortSpec[]);
    setFilters(restoredFilters);
    if (restoredSort?.length) setSort(restoredSort);

    // Restore active KPI visual if a KPI preset was persisted
    if (restoredFilters.kpi) {
      setActiveKPI(restoredFilters.kpi as PeopleKPIKey);
    } else if (restoredFilters.status?.length === 1) {
      // Check if persisted status matches a KPI (e.g. "active", "onboarding")
      const matchingKPI = Object.entries(KPI_FILTER_PRESETS).find(
        ([, preset]) =>
          preset.status?.length === 1 &&
          preset.status[0] === restoredFilters.status?.[0]
      );
      if (matchingKPI) setActiveKPI(matchingKPI[0] as PeopleKPIKey);
    }
    setInitialized(true);
  }, [stateLoading, viewState, initialized]);

  // ── Filter change handler (with persistence) ──────────────────────────
  const handleFiltersChange = useCallback(
    (next: PeopleFiltersSpec) => {
      setFilters(next);
      setPage(0);
      setActiveKPI(null); // Clear KPI selection on manual filter change
      persistFilters(filtersToJson(next));
    },
    [persistFilters]
  );

  // ── Sort change handler (with persistence) ────────────────────────────
  const handleSortChange = useCallback(
    (next: SortSpec[]) => {
      setSort(next);
      setPage(0);
      persistSort(next);
    },
    [persistSort]
  );

  // ── KPI click handler ─────────────────────────────────────────────────
  const handleKPIClick = useCallback(
    (key: PeopleKPIKey) => {
      // Toggle off
      if (activeKPI === key) {
        setActiveKPI(null);
        const cleared: PeopleFiltersSpec = { search: filters.search };
        setFilters(cleared);
        setPage(0);
        persistFilters(filtersToJson(cleared));
        return;
      }

      // "total" = clear everything
      if (key === "total") {
        setActiveKPI("total");
        const cleared: PeopleFiltersSpec = { search: filters.search };
        setFilters(cleared);
        setPage(0);
        persistFilters(filtersToJson(cleared));
        return;
      }

      // month_recognitions → navigate
      if (key === "month_recognitions") {
        router.push("/pessoas/reconhecimentos");
        return;
      }

      // Apply preset filter
      const preset = KPI_FILTER_PRESETS[key];
      if (preset) {
        setActiveKPI(key);
        const next: PeopleFiltersSpec = { search: filters.search, ...preset };
        setFilters(next);
        setPage(0);
        persistFilters(filtersToJson(next));
      }
    },
    [activeKPI, filters.search, persistFilters, router]
  );

  // ── Data fetching ─────────────────────────────────────────────────────
  const {
    data: result,
    isLoading,
    error,
    refetch,
  } = usePeople(filters, sort, { page, pageSize: PAGE_SIZE });

  const people = result?.data ?? [];
  const totalCount = result?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const { data: kpis, isLoading: kpisLoading } = usePeopleKPIs();
  const { data: nudgeCounts, isLoading: nudgesLoading } = usePeopleNudges();
  const { data: filterOptions } = usePeopleFilterOptions();
  const { data: snapshots } = usePeopleSnapshot(people);

  // ── Fase 6 — Run automations on module access (fire-and-forget) ───────
  usePeopleAutomations();

  // ── Nudge CTA handler (applies filter preset + persists) ──────────────
  const handleNudgeClick = useCallback(
    (preset: PeopleKPIPreset) => {
      const filterPreset = KPI_FILTER_PRESETS[preset];
      if (!filterPreset) return;
      setActiveKPI(preset as PeopleKPIKey);
      const next: PeopleFiltersSpec = { search: filters.search, ...filterPreset };
      setFilters(next);
      setPage(0);
      persistFilters(filtersToJson(next));
    },
    [filters.search, persistFilters]
  );

  // ── Helpers ────────────────────────────────────────────────────────────
  function handleSelectPerson(person: ProfileRow) {
    setSelectedPerson(person);
    setDetailOpen(true);
  }

  const emptyKpis = useMemo(
    () => ({
      total: 0,
      active: 0,
      onboarding: 0,
      at_risk: 0,
      pending_1on1: 0,
      stale_pdi: 0,
      month_recognitions: 0,
      overloaded: 0,
    }),
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pessoas</h1>
        <p className="text-sm text-gray-500">
          Gerencie sua equipe e acompanhe o status dos membros.
        </p>
      </div>

      {/* Fase 5 — Nudges de Ação (above KPIs) */}
      <PeopleNudges
        counts={nudgeCounts ?? { pending_1on1: 0, stale_pdi: 0, critical_score: 0, overloaded: 0 }}
        isLoading={nudgesLoading}
        onNudgeClick={handleNudgeClick}
      />

      {/* KPIs — 2 rows × 4 columns */}
      <PeopleKPICardsV2
        kpis={kpis ?? emptyKpis}
        activeKPI={activeKPI}
        onKPIClick={handleKPIClick}
        isLoading={kpisLoading}
      />

      {/* Filters (search + status chips + advanced + sort) */}
      <PeopleFilters
        filters={filters}
        sort={sort}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
        filterOptions={filterOptions}
      />

      {/* Result count */}
      {!isLoading && !error && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {totalCount === 0
              ? "Nenhum resultado"
              : totalCount === 1
                ? "1 pessoa"
                : `${totalCount} pessoas`}
            {hasActiveFilters(filters) && " (filtrado)"}
          </p>
        </div>
      )}

      {/* People Grid */}
      {error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-lg border bg-gray-100/40"
            />
          ))}
        </div>
      ) : people.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhuma pessoa encontrada"
          description="Ajuste os filtros ou adicione novos membros à equipe."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              snapshot={snapshots?.[person.id]}
              onClick={() => handleSelectPerson(person)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Detail Sheet */}
      <PersonDetail
        person={selectedPerson}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
