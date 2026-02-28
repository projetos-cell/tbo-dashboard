"use client";

import { useState, useMemo } from "react";
import { usePeople } from "@/hooks/use-people";
import { PeopleKPICards } from "@/components/people/people-kpis";
import { PeopleFilters } from "@/components/people/people-filters";
import { PersonCard } from "@/components/people/person-card";
import { PersonDetail } from "@/components/people/person-detail";
import { computePeopleKPIs } from "@/services/people";
import type { Database } from "@/lib/supabase/types";
import { Users } from "lucide-react";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export default function PessoasPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<ProfileRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: people = [], isLoading } = usePeople({
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const kpis = useMemo(() => computePeopleKPIs(people), [people]);

  function handleSelectPerson(person: ProfileRow) {
    setSelectedPerson(person);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pessoas</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie sua equipe e acompanhe o status dos membros.
        </p>
      </div>

      {/* KPIs */}
      <PeopleKPICards kpis={kpis} />

      {/* Filters */}
      <PeopleFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* People Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-lg border bg-muted/40"
            />
          ))}
        </div>
      ) : people.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">Nenhuma pessoa encontrada</p>
          <p className="text-xs text-muted-foreground">
            Ajuste os filtros ou adicione novos membros à equipe.
          </p>
        </div>
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
