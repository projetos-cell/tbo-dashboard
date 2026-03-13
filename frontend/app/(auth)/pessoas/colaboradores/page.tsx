"use client";

import { useState, useMemo } from "react";
import { usePeople } from "@/features/people/hooks/use-people";
import { PersonCard } from "@/features/people/components/person-card";
import { PersonDetail } from "@/features/people/components/person-detail";
import { ErrorState, EmptyState } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PEOPLE_STATUS } from "@/lib/constants";
import { Search, Users, X } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type PeopleStatusKey = keyof typeof PEOPLE_STATUS;

const STATUS_KEYS = Object.keys(PEOPLE_STATUS) as PeopleStatusKey[];

export default function ColaboradoresPage() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<PeopleStatusKey | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<ProfileRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading, isError, refetch } = usePeople();

  const people = useMemo(() => {
    const list = data?.data ?? [];
    return list.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        (p.full_name?.toLowerCase().includes(q) ?? false) ||
        (p.cargo?.toLowerCase().includes(q) ?? false) ||
        (p.email?.toLowerCase().includes(q) ?? false);
      const matchesStatus = !selectedStatus || p.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, selectedStatus]);

  const hasFilters = !!search || !!selectedStatus;

  const handlePersonClick = (person: ProfileRow) => {
    setSelectedPerson(person);
    setDetailOpen(true);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedStatus(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Colaboradores</h1>
        <p className="text-muted-foreground">Diretório de pessoas da equipe TBO.</p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cargo ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
              <X className="size-3.5" />
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          {STATUS_KEYS.map((key) => {
            const cfg = PEOPLE_STATUS[key];
            const isActive = selectedStatus === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedStatus(isActive ? null : key)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-opacity ${
                  isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: isActive ? cfg.bg : "transparent",
                  color: cfg.color,
                  borderColor: cfg.color,
                  outline: isActive ? `2px solid ${cfg.color}` : undefined,
                  outlineOffset: isActive ? "2px" : undefined,
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count */}
      {!isLoading && !isError && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" />
          <span>
            {people.length} {people.length === 1 ? "colaborador" : "colaboradores"}
            {hasFilters && ` de ${data?.count ?? 0} no total`}
          </span>
          {selectedStatus && (
            <Badge
              variant="outline"
              className="ml-1 text-xs"
              style={{
                color: PEOPLE_STATUS[selectedStatus].color,
                borderColor: PEOPLE_STATUS[selectedStatus].color,
              }}
            >
              {PEOPLE_STATUS[selectedStatus].label}
            </Badge>
          )}
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <ErrorState
          message="Não foi possível buscar os dados da equipe."
          onRetry={() => refetch()}
        />
      )}

      {/* Empty */}
      {!isLoading && !isError && people.length === 0 && (
        <EmptyState
          icon={Users}
          title={hasFilters ? "Nenhum resultado encontrado" : "Nenhum colaborador cadastrado"}
          description={
            hasFilters
              ? "Tente ajustar os filtros de busca."
              : "Adicione colaboradores ao sistema para visualizá-los aqui."
          }
          cta={hasFilters ? { label: "Limpar filtros", onClick: clearFilters } : undefined}
        />
      )}

      {/* Grid */}
      {!isLoading && !isError && people.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              onClick={() => handlePersonClick(person)}
            />
          ))}
        </div>
      )}

      {/* Detail sheet */}
      <PersonDetail
        person={selectedPerson}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedPerson(null);
        }}
      />
    </div>
  );
}
