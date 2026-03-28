"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { IconChartBar } from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { RequireRole } from "@/features/auth/components/require-role";

const tabFallback = <div className="h-96 animate-pulse rounded-lg bg-muted" />;

const ProjectGantt = dynamic(
  () => import("@/features/projects/components/tabs/project-gantt").then((m) => ({ default: m.ProjectGantt })),
  { ssr: false, loading: () => tabFallback }
);

export default function ProjetosGanttPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data: projects, isLoading, isError, refetch } = useProjects();

  const activeProjects = projects?.filter((p) => p.status !== "canceled" && p.status !== "archived") ?? [];

  const selectedProject = activeProjects.find((p) => p.id === selectedProjectId);

  return (
    <RequireRole module="projetos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gantt</h1>
            <p className="text-muted-foreground text-sm">
              Visualize o cronograma de tarefas de um projeto em formato Gantt.
            </p>
          </div>

          {/* Project selector */}
          {!isLoading && activeProjects.length > 0 && (
            <Select
              value={selectedProjectId ?? ""}
              onValueChange={(v) => setSelectedProjectId(v)}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecionar projeto..." />
              </SelectTrigger>
              <SelectContent>
                {activeProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <ErrorState
            message="Não foi possível carregar os projetos."
            onRetry={() => refetch()}
          />
        )}

        {/* Empty — no projects */}
        {!isLoading && !isError && activeProjects.length === 0 && (
          <EmptyState
            icon={IconChartBar}
            title="Nenhum projeto ativo"
            description="Crie um projeto para visualizar o Gantt."
          />
        )}

        {/* Prompt to select */}
        {!isLoading && !isError && activeProjects.length > 0 && !selectedProject && (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Selecione um projeto acima para visualizar o Gantt.
          </div>
        )}

        {/* Gantt chart */}
        {selectedProject && (
          <ProjectGantt projectId={selectedProject.id} />
        )}
      </div>
    </RequireRole>
  );
}
