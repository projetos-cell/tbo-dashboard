"use client";

import { useState, useMemo } from "react";
import { IconPlus, IconList, IconSearch, IconFilterOff, IconFolderPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ProjectFilters } from "@/features/projects/components/project-filters";
import { ProjectList } from "@/features/projects/components/project-list";
import { ProjectForm } from "@/features/projects/components/project-form";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useUser } from "@/hooks/use-user";
import { parseBus } from "@/features/projects/utils/parse-bus";
import { RequireRole } from "@/features/auth/components/require-role";

export default function ProjetosListaPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [buFilter, setBuFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

  useUser();

  const { data: projects, isLoading, error, refetch } = useProjects();

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      if (buFilter !== "all") {
        const bus = parseBus(p.bus);
        if (!bus.includes(buFilter)) return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (p.name || "").toLowerCase().includes(q) ||
          (p.construtora || "").toLowerCase().includes(q) ||
          (p.code || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [projects, buFilter, statusFilter, search]);

  if (error) {
    return (
      <ErrorState
        message="Não foi possível carregar os projetos."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <RequireRole module="projetos">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <IconList className="h-6 w-6 text-muted-foreground" />
            Lista de Projetos
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Todos os projetos em formato tabular com filtros e ordenação.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <IconPlus className="mr-1.5 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, construtora ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <ProjectFilters buFilter={buFilter} onBuChange={setBuFilter} />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={search || statusFilter !== "all" || buFilter !== "all" ? IconFilterOff : IconFolderPlus}
          title={
            search || statusFilter !== "all" || buFilter !== "all"
              ? "Nenhum projeto corresponde aos filtros"
              : "Comece criando seu primeiro projeto"
          }
          description={
            search || statusFilter !== "all" || buFilter !== "all"
              ? "Ajuste os filtros ou limpe a busca para ver seus projetos."
              : "Organize entregas, atribua tarefas e acompanhe o progresso da equipe."
          }
          cta={
            search || statusFilter !== "all" || buFilter !== "all"
              ? undefined
              : { label: "Criar Projeto", onClick: () => setFormOpen(true), icon: IconPlus }
          }
        />
      ) : (
        <ProjectList projects={filtered} />
      )}

      <ProjectForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
    </RequireRole>
  );
}
