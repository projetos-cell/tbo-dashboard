"use client";

import { useState, useMemo } from "react";
import { Plus, FolderKanban } from "lucide-react";
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

export default function ProjetosPage() {
  const [view, setView] = useState<ViewMode>("board");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

  // Initialize user/tenant
  useUser();

  const { data: projects, isLoading, error, refetch } = useProjects();

  // Filtered projects
  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = (p.name || "").toLowerCase().includes(q);
        const construtoraMatch = (p.construtora || "")
          .toLowerCase()
          .includes(q);
        if (!nameMatch && !construtoraMatch) return false;
      }
      return true;
    });
  }, [projects, statusFilter, search]);

  // KPIs
  const kpis = useMemo(() => {
    if (!projects) return { total: 0, emAndamento: 0, finalizados: 0, parados: 0 };
    return {
      total: projects.length,
      emAndamento: projects.filter(
        (p) => p.status === "em_andamento" || p.status === "producao"
      ).length,
      finalizados: projects.filter((p) => p.status === "finalizado").length,
      parados: projects.filter(
        (p) => p.status === "parado" || p.status === "pausado"
      ).length,
    };
  }, [projects]);

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
          <p className="text-gray-500">
            Gerencie seus projetos e acompanhe o progresso.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle value={view} onChange={setView} />
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Total" value={kpis.total} />
          <KpiCard label="Em Andamento" value={kpis.emAndamento} color="#3b82f6" />
          <KpiCard label="Finalizados" value={kpis.finalizados} color="#22c55e" />
          <KpiCard label="Parados" value={kpis.parados} color="#ef4444" />
        </div>
      )}

      {/* Filters */}
      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : !projects?.length ? (
        <EmptyState
          icon={FolderKanban}
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

      {/* Create form dialog */}
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
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className="text-2xl font-bold mt-1"
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
