"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePeople, usePeopleKPIs } from "@/hooks/use-people";
import {
  PeopleKPICardsV2,
  type PeopleKPIKey,
} from "@/components/people/people-kpis-v2";
import { PeopleFilters } from "@/components/people/people-filters";
import { PersonCard } from "@/components/people/person-card";
import { PersonDetail } from "@/components/people/person-detail";
import { ErrorState, EmptyState } from "@/components/shared";
import type { Database } from "@/lib/supabase/types";
import { Users } from "lucide-react";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/** Map KPI keys that can directly filter the people list to a status string */
const KPI_STATUS_MAP: Partial<Record<PeopleKPIKey, string>> = {
  active: "active",
  onboarding: "onboarding",
};

export default function PessoasPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeKPI, setActiveKPI] = useState<PeopleKPIKey | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<ProfileRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Derive the effective status filter from activeKPI or manual filter
  const effectiveStatus = useMemo(() => {
    if (activeKPI && activeKPI in KPI_STATUS_MAP) {
      return KPI_STATUS_MAP[activeKPI];
    }
    return statusFilter || undefined;
  }, [activeKPI, statusFilter]);

  const { data: people = [], isLoading, error, refetch } = usePeople({
    status: effectiveStatus,
    search: search || undefined,
  });

  const { data: kpis, isLoading: kpisLoading } = usePeopleKPIs();

  function handleKPIClick(key: PeopleKPIKey) {
    // Toggle: clicking same KPI deselects it
    if (activeKPI === key) {
      setActiveKPI(null);
      return;
    }

    // "total" clears all filters (shows everyone)
    if (key === "total") {
      setActiveKPI("total");
      setStatusFilter("");
      return;
    }

    // Reconhecimentos navigates to the subpage
    if (key === "month_recognitions") {
      router.push("/pessoas/reconhecimentos");
      return;
    }

    // KPIs with direct status mapping filter the list
    if (key in KPI_STATUS_MAP) {
      setActiveKPI(key);
      setStatusFilter(""); // Clear manual filter; effectiveStatus handles it
      return;
    }

    // Complex KPIs (at_risk, pending_1on1, stale_pdi, overloaded)
    // — visual selection only for now; server-side filtering in a future phase
    setActiveKPI(key);
  }

  function handleStatusChange(status: string) {
    setStatusFilter(status);
    setActiveKPI(null); // Clear KPI selection when user manually filters
  }

  function handleSelectPerson(person: ProfileRow) {
    setSelectedPerson(person);
    setDetailOpen(true);
  }

  const emptyKpis = {
    total: 0,
    active: 0,
    onboarding: 0,
    at_risk: 0,
    pending_1on1: 0,
    stale_pdi: 0,
    month_recognitions: 0,
    overloaded: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pessoas</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie sua equipe e acompanhe o status dos membros.
        </p>
      </div>

      {/* KPIs — 2 rows × 4 columns */}
      <PeopleKPICardsV2
        kpis={kpis ?? emptyKpis}
        activeKPI={activeKPI}
        onKPIClick={handleKPIClick}
        isLoading={kpisLoading}
      />

      {/* Filters */}
      <PeopleFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
      />

      {/* People Grid */}
      {error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-lg border bg-muted/40"
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
              onClick={() => handleSelectPerson(person)}
            />
          ))}
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
