"use client";

import { useState, useMemo } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectBoard } from "@/components/projects/project-board";
import { ProjectList } from "@/components/projects/project-list";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectForm } from "@/components/projects/project-form";
import { useProjects } from "@/hooks/use-projects";
import { useUser } from "@/hooks/use-user";

export default function ProjetosPage() {
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

  // Initialize user/tenant
  useUser();

  const { data: projects, isLoading, error } = useProjects();

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
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive text-lg font-medium">
          Erro ao carregar projetos
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message}
        </p>
      </div>
    );
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
          {/* View toggle */}
          <div className="flex items-center rounded-lg border p-0.5">
            <Button
              variant={view === "board" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setView("board")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
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
      ) : view === "board" ? (
        <ProjectBoard projects={filtered} />
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
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className="text-2xl font-bold mt-1"
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
