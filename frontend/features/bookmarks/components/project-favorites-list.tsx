"use client";

import { useRouter } from "next/navigation";
import { IconStar, IconExternalLink } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectFavorites, useToggleFavorite } from "@/features/projects/hooks/use-project-favorites";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { PROJECT_STATUS, type ProjectStatusKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ProjectFavoritesList() {
  const router = useRouter();
  const { data: favoriteIds, isLoading: loadingIds } = useProjectFavorites();
  const { data: allProjects, isLoading: loadingProjects } = useProjects();
  const toggleFavorite = useToggleFavorite();

  const isLoading = loadingIds || loadingProjects;

  if (isLoading) {
    return (
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const favorites = (allProjects ?? []).filter((p) => (favoriteIds ?? []).includes(p.id));

  if (favorites.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <IconStar className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">Nenhum projeto favorito ainda</p>
        <p className="text-xs text-muted-foreground/70">
          Clique na estrela em qualquer projeto para salvar aqui
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((project) => {
        const status = PROJECT_STATUS[project.status as ProjectStatusKey];
        return (
          <div
            key={project.id}
            className="group/card cursor-pointer rounded-lg border bg-card p-4 transition-all hover:shadow-md"
            onClick={() => router.push(`/projetos/${project.id}`)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {project.code && (
                  <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {project.code}
                  </span>
                )}
                <p className="line-clamp-2 text-sm font-medium leading-tight">{project.name}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite.mutate({ projectId: project.id, isFavorite: true });
                  }}
                  className="text-amber-500 transition-opacity focus:outline-none"
                  title="Remover dos favoritos"
                >
                  <IconStar className="h-3.5 w-3.5 fill-amber-500" />
                </button>
                {project.notion_url && (
                  <a
                    href={project.notion_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <IconExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
            {status && (
              <div className="mt-2">
                <Badge
                  variant="secondary"
                  className="gap-1 text-xs"
                  style={{ backgroundColor: status.bg, color: status.color }}
                >
                  <span
                    className={cn("size-1.5 shrink-0 rounded-full")}
                    style={{ backgroundColor: status.color }}
                  />
                  {status.label}
                </Badge>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
