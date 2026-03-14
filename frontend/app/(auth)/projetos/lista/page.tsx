"use client";

import { useState, useMemo } from "react";
import { IconPlus, IconList } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ProjectFilters } from "@/features/projects/components/project-filters";
import { ProjectList } from "@/features/projects/components/project-list";
import { ProjectForm } from "@/features/projects/components/project-form";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useUser } from "@/hooks/use-user";

export default function ProjetosListaPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

  useUser();

  const { data: projects, isLoading, error, refetch } = useProjects();

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (p.name || "").toLowerCase().includes(q) ||
          (p.construtora || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [projects, statusFilter, search]);

  if (error) {
    return (
      <ErrorState
        message="Não foi possível carregar os projetos."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <IconList className="h-6 w-6 text-gray-500" />
            Lista de Projetos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Todos os projetos em formato tabular com filtros e ordenação.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <IconPlus className="mr-1.5 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Filters */}
      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={IconList}
          title="Nenhum projeto encontrado"
          description={
            search || statusFilter !== "all"
              ? "Tente ajustar os filtros para ver mais projetos."
              : "Crie o primeiro projeto para começar."
          }
          cta={
            search || statusFilter !== "all"
              ? undefined
              : { label: "Novo Projeto", onClick: () => setFormOpen(true) }
          }
        />
      ) : (
        <ProjectList projects={filtered} />
      )}

      <ProjectForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
