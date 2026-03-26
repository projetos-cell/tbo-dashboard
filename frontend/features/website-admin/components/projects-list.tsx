"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconWorld,
  IconGripVertical,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebsiteProjects } from "../hooks/use-website-projects";
import { ProjectStatusBadge } from "./project-status-badge";
import { CATEGORY_LABELS } from "../types";
import type { WebsiteProjectStatus } from "../types";

export function ProjectsList() {
  const router = useRouter();
  const { data: projects, isLoading } = useWebsiteProjects();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    WebsiteProjectStatus | "all"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.client_name ?? "").toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" || p.status === statusFilter;
      const matchCategory =
        categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [projects, search, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie o portfólio exibido no site
          </p>
        </div>
        <Button
          onClick={() => router.push("/website-admin/projetos/novo")}
          size="sm"
        >
          <IconPlus className="h-4 w-4 mr-1.5" />
          Novo Projeto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as WebsiteProjectStatus | "all")
          }
        >
          <SelectTrigger className="w-36 h-9">
            <IconFilter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="publicado">Publicado</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <IconWorld className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            Nenhum projeto encontrado
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search || statusFilter !== "all" || categoryFilter !== "all"
              ? "Tente ajustar os filtros"
              : "Adicione o primeiro projeto do portfólio"}
          </p>
          {!search && statusFilter === "all" && categoryFilter === "all" && (
            <Button
              onClick={() => router.push("/website-admin/projetos/novo")}
              size="sm"
            >
              <IconPlus className="h-4 w-4 mr-1.5" />
              Criar Projeto
            </Button>
          )}
        </div>
      )}

      {/* Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() =>
                router.push(`/website-admin/projetos/${project.id}`)
              }
              className="group rounded-lg border bg-card text-left hover:border-primary/30 hover:shadow-sm transition-all overflow-hidden"
            >
              {/* Cover */}
              <div className="h-40 bg-muted relative overflow-hidden">
                {project.cover_url ? (
                  <Image
                    src={project.cover_url}
                    alt={project.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <IconWorld className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <ProjectStatusBadge status={project.status} />
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {CATEGORY_LABELS[project.category] ?? project.category}
                  </span>
                </div>
                <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{project.client_name ?? "—"}</span>
                  <span>
                    {project.year ?? "—"}
                    {project.location ? ` · ${project.location}` : ""}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
