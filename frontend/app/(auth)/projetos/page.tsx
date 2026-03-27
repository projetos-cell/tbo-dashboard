"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { IconPlus, IconSearch, IconFolderPlus, IconStarFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/shared";
import { ViewToggle, type ViewMode } from "@/components/shared/view-toggle";
import { Input } from "@/components/ui/input";
import { ProjectBoard } from "@/features/projects/components/project-board";
import { ProjectList } from "@/features/projects/components/project-list";
import { ProjectCompactList } from "@/features/projects/components/project-compact-list";
import { ProjectGallery } from "@/features/projects/components/project-gallery";
import { ProjectFilters } from "@/features/projects/components/project-filters";
import { ProjectForm } from "@/features/projects/components/project-form";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useProjectFavorites } from "@/features/projects/hooks/use-project-favorites";
import { ProjectCard } from "@/features/projects/components/project-card";
import { useUser } from "@/hooks/use-user";
import { parseBus } from "@/features/projects/utils/parse-bus";
import { PROJECT_STATUS, PROJECT_PRIORITY, type ProjectStatusKey, type ProjectPriorityKey } from "@/lib/constants";
import {
  ProjectListToolbar,
  type ListToolbarState,
  type SortField,
  type GroupField,
} from "@/features/projects/components/project-list-toolbar";
import { cn } from "@/lib/utils";
import { RequireRole } from "@/features/auth/components/require-role";
import { useGlobalShortcuts } from "@/hooks/use-global-shortcuts";

export default function ProjetosPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [buFilter, setBuFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [toolbarState, setToolbarState] = useState<ListToolbarState>({
    sortField: "name",
    sortDir: "asc",
    groupBy: "none",
    customFilters: [],
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  useUser();
  useGlobalShortcuts();

  // Cmd+K → focus search input
  useEffect(() => {
    function onOpenSearch() {
      searchInputRef.current?.focus();
    }
    window.addEventListener("tbo:open-search", onOpenSearch);
    return () => window.removeEventListener("tbo:open-search", onOpenSearch);
  }, []);

  // "n" key (no modifiers, not in input) → open new project form
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "n" || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;
      setFormOpen(true);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const { data: rawProjects, isLoading, error, refetch } = useProjects();

  // Normalize: if status is a UUID (not a valid PROJECT_STATUS key), treat as "em_andamento"
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const projects = useMemo(() => {
    if (!rawProjects) return rawProjects;
    return rawProjects.map((p) => {
      if (p.status && UUID_RE.test(p.status) && !(p.status in PROJECT_STATUS)) {
        return { ...p, status: "em_andamento" };
      }
      return p;
    });
  }, [rawProjects]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Apply toolbar sort + custom filters for board/table views
  const toolbarFiltered = useMemo(() => {
    let items = [...filtered];

    // Custom filters from toolbar
    if (toolbarState.customFilters.length > 0) {
      items = items.filter((p) =>
        toolbarState.customFilters.every((f) => {
          switch (f.field) {
            case "status":
              return p.status === f.value;
            case "priority":
              return p.priority === f.value;
            default:
              return true;
          }
        })
      );
    }

    // Sort
    items.sort((a, b) => {
      let cmp = 0;
      switch (toolbarState.sortField) {
        case "name":
          cmp = (a.name ?? "").localeCompare(b.name ?? "", "pt-BR");
          break;
        case "status":
          cmp = (a.status ?? "").localeCompare(b.status ?? "", "pt-BR");
          break;
        case "construtora":
          cmp = (a.construtora ?? "").localeCompare(b.construtora ?? "", "pt-BR");
          break;
        case "due_date":
          cmp = (a.due_date_end ?? "").localeCompare(b.due_date_end ?? "");
          break;
        case "created_at":
          cmp = (a.created_at ?? "").localeCompare(b.created_at ?? "");
          break;
      }
      return toolbarState.sortDir === "desc" ? -cmp : cmp;
    });

    return items;
  }, [filtered, toolbarState]);

  // KPIs — computed from actual PROJECT_STATUS, contextual to active BU filter
  const kpis = useMemo(() => {
    if (!projects) return { total: 0, statusCounts: {} as Record<string, number> };
    const base = buFilter === "all"
      ? projects
      : projects.filter((p) => parseBus(p.bus).includes(buFilter));

    const statusCounts: Record<string, number> = {};
    for (const p of base) {
      const key = p.status ?? "sem_status";
      statusCounts[key] = (statusCounts[key] ?? 0) + 1;
    }

    return { total: base.length, statusCounts };
  }, [projects, buFilter]);

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <RequireRole module="projetos">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos e acompanhe o progresso.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar projetos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[220px] pl-9"
            />
          </div>
          <ViewToggle value={view} onChange={setView} />
          <Button onClick={() => setFormOpen(true)}>
            <IconPlus className="mr-1 h-4 w-4" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* KPIs — derived from real PROJECT_STATUS */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          <KpiCard
            label="Total"
            value={kpis.total}
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          {(Object.entries(PROJECT_STATUS) as [ProjectStatusKey, (typeof PROJECT_STATUS)[ProjectStatusKey]][]).map(
            ([key, config]) => (
              <KpiCard
                key={key}
                label={config.label}
                value={kpis.statusCounts[key] ?? 0}
                color={config.color}
                active={statusFilter === key}
                onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
              />
            ),
          )}
        </div>
      )}

      {/* Filters: BU tabs */}
      <ProjectFilters
        buFilter={buFilter}
        onBuChange={setBuFilter}
      />

      {/* Toolbar — shared across all views */}
      {!isLoading && projects?.length ? (
        <ProjectListToolbar state={toolbarState} onChange={setToolbarState} />
      ) : null}

      {/* V05 — Favorites section */}
      <FavoritesSection projects={toolbarFiltered} />

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : !projects?.length ? (
        <EmptyState
          icon={IconFolderPlus}
          title="Comece criando seu primeiro projeto"
          description="Organize entregas, atribua tarefas e acompanhe o progresso da sua equipe em um s\u00f3 lugar."
          cta={{ label: "Criar Projeto", onClick: () => setFormOpen(true), icon: IconPlus }}
        />
      ) : view === "board" ? (
        <ProjectBoard projects={toolbarFiltered} />
      ) : view === "list" ? (
        <ProjectCompactList projects={toolbarFiltered} />
      ) : view === "gallery" ? (
        <ProjectGallery projects={toolbarFiltered} />
      ) : (
        <ProjectList projects={toolbarFiltered} />
      )}

      <ProjectForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
    </RequireRole>
  );
}

function FavoritesSection({ projects }: { projects: Array<{ id: string; name: string; [key: string]: unknown }> }) {
  const { data: favoriteIds } = useProjectFavorites();
  const favorites = useMemo(() => {
    if (!favoriteIds || favoriteIds.length === 0 || !projects) return [];
    return projects.filter((p) => favoriteIds.includes(p.id));
  }, [favoriteIds, projects]);

  if (favorites.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <IconStarFilled className="size-3.5 text-amber-500" />
        <h2 className="text-sm font-medium">Favoritos</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {favorites.map((p) => (
          <ProjectCard key={p.id} project={p as never} />
        ))}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  color,
  active,
  onClick,
}: {
  label: string;
  value: number;
  color?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card p-4 text-left transition-all",
        "hover:shadow-md hover:border-primary/30",
        active && "ring-2 ring-primary/50 border-primary shadow-sm",
      )}
    >
      <p className="text-muted-foreground text-sm">{label}</p>
      <p
        className="mt-1 text-2xl font-bold"
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </button>
  );
}
