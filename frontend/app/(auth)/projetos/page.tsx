"use client";

import { useState, useMemo } from "react";
import { IconPlus, IconLayoutKanban } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/shared";
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle";
import { ProjectBoard } from "@/features/projects/components/project-board";
import { ProjectList } from "@/features/projects/components/project-list";
import { ProjectCompactList } from "@/features/projects/components/project-compact-list";
import { ProjectFilters } from "@/features/projects/components/project-filters";
import { ProjectForm } from "@/features/projects/components/project-form";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useUser } from "@/hooks/use-user";
import { parseBus } from "@/features/projects/utils/parse-bus";

export default function ProjetosPage() {
  const [view, setView] = useState<ViewMode>("board");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [buFilter, setBuFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

  useUser();

  const { data: projects, isLoading, error, refetch } = useProjects();

  // Filter by BU → status → search
  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      // BU filter
      if (buFilter !== "all") {
        const bus = parseBus(p.bus);
        if (!bus.includes(buFilter)) return false;
      }
      // Status filter
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      // Search
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = (p.name || "").toLowerCase().includes(q);
        const construtoraMatch = (p.construtora || "").toLowerCase().includes(q);
        const codeMatch = (p.code || "").toLowerCase().includes(q);
        if (!nameMatch && !construtoraMatch && !codeMatch) return false;
      }
      return true;
    });
  }, [projects, buFilter, statusFilter, search]);

  // KPIs — contextual to active BU filter
  const kpis = useMemo(() => {
    if (!projects) return { total: 0, emAndamento: 0, finalizados: 0, parados: 0 };
    const base = buFilter === "all"
      ? projects
      : projects.filter((p) => parseBus(p.bus).includes(buFilter));
    return {
      total: base.length,
      emAndamento: base.filter(
        (p) => p.status === "em_andamento" || p.status === "producao" || p.status === "em_revisao"
      ).length,
      finalizados: base.filter((p) => p.status === "finalizado").length,
      parados: base.filter(
        (p) => p.status === "parado" || p.status === "pausado"
      ).length,
    };
  }, [projects, buFilter]);

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos e acompanhe o progresso.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle value={view} onChange={setView} />
          <Button onClick={() => setFormOpen(true)}>
            <IconPlus className="mr-1 h-4 w-4" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard label="Total" value={kpis.total} />
          <KpiCard label="Em Andamento" value={kpis.emAndamento} color="#3b82f6" />
          <KpiCard label="Finalizados" value={kpis.finalizados} color="#22c55e" />
          <KpiCard label="Parados" value={kpis.parados} color="#ef4444" />
        </div>
      )}

      {/* Filters: BU tabs + search + status */}
      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        buFilter={buFilter}
        onBuChange={setBuFilter}
      />

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : !projects?.length ? (
        <EmptyState
          icon={IconLayoutKanban}
          title="Nenhum projeto encontrado"
          description="Crie seu primeiro projeto para organizar o trabalho da equipe."
          cta={{ label: "Novo Projeto", onClick: () => setFormOpen(true) }}
        />
      ) : view === "board" ? (
        <ProjectBoard projects={filtered} />
      ) : view === "list" ? (
        <ProjectCompactList projects={filtered} />
      ) : (
        <ProjectList projects={filtered} />
      )}

      <ProjectForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

function KpiCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p
        className="mt-1 text-2xl font-bold"
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
