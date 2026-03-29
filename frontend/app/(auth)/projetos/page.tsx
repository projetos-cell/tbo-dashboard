"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { IconPlus, IconFolderPlus, IconStarFilled } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, EmptyState } from "@/components/shared";
import { ProjectForm } from "@/features/projects/components/project-form";
import { BUOverviewCard } from "@/features/projects/components/bu-overview-card";
import { BUDetailDashboard } from "@/features/projects/components/bu-detail-dashboard";
import { QuadroGeralOverview } from "@/features/projects/components/quadro-geral-overview";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useProjectFavorites } from "@/features/projects/hooks/use-project-favorites";
import { ProjectCard } from "@/features/projects/components/project-card";
import { useUser } from "@/hooks/use-user";
import { parseBus } from "@/features/projects/utils/parse-bus";
import { BU_LIST, PROJECT_STATUS } from "@/lib/constants";
import { RequireRole } from "@/features/auth/components/require-role";
import { useGlobalShortcuts } from "@/hooks/use-global-shortcuts";

// 4 BUs principais com dashboards dedicados
const MAIN_BUS = ["Digital 3D", "Branding", "Audiovisual", "Marketing"] as const;

export default function ProjetosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);

  // BU ativa vem da URL: /projetos?bu=Digital+3D
  const activeBU = searchParams.get("bu");

  const setActiveBU = useCallback((bu: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (bu) {
      params.set("bu", bu);
    } else {
      params.delete("bu");
    }
    const qs = params.toString();
    router.push(qs ? `/projetos?${qs}` : "/projetos");
  }, [router, searchParams]);

  useUser();
  useGlobalShortcuts();

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

  // Esc key → back from BU detail
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && activeBU) {
        setActiveBU(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeBU, setActiveBU]);

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

  // Group projects by BU
  const projectsByBU = useMemo(() => {
    if (!projects) return {};
    const map: Record<string, typeof projects> = {};
    for (const bu of BU_LIST) {
      map[bu] = [];
    }
    map["Sem BU"] = [];
    for (const p of projects) {
      const bus = parseBus(p.bus);
      if (bus.length === 0) {
        map["Sem BU"].push(p);
      } else {
        for (const bu of bus) {
          if (!map[bu]) map[bu] = [];
          map[bu].push(p);
        }
      }
    }
    return map;
  }, [projects]);

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
          <p className="text-muted-foreground text-sm">
            Gerencie seus projetos e acompanhe o progresso por unidade de negócio.
          </p>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeBU ? (
          <BUDetailDashboard
            key={`bu-${activeBU}`}
            buName={activeBU}
            projects={projectsByBU[activeBU] ?? []}
            onBack={() => setActiveBU(null)}
            onNewProject={() => setFormOpen(true)}
          />
        ) : (
          <DashboardOverview
            key="dashboard-overview"
            isLoading={isLoading}
            projects={projects ?? []}
            projectsByBU={projectsByBU}
            onSelectBU={setActiveBU}
            onNewProject={() => setFormOpen(true)}
          />
        )}
      </AnimatePresence>

      <ProjectForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
    </RequireRole>
  );
}

/* ─── Dashboard Overview ─── */
function DashboardOverview({
  isLoading,
  projects,
  projectsByBU,
  onSelectBU,
  onNewProject,
}: {
  isLoading: boolean;
  projects: Array<{ id: string; status: string; due_date_end?: string | null; [key: string]: unknown }>;
  projectsByBU: Record<string, Array<{ id: string; [key: string]: unknown }>>;
  onSelectBU: (bu: string) => void;
  onNewProject: () => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded" />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!projects.length) {
    return (
      <EmptyState
        icon={IconFolderPlus}
        title="Comece criando seu primeiro projeto"
        description="Organize entregas, atribua tarefas e acompanhe o progresso da sua equipe em um só lugar."
        cta={{ label: "Criar Projeto", onClick: onNewProject, icon: IconPlus }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Global KPIs */}
      <QuadroGeralOverview projects={projects as never} />

      {/* BU Cards */}
      <div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
          {MAIN_BUS.map((bu, i) => (
            <BUOverviewCard
              key={bu}
              buName={bu}
              projects={(projectsByBU[bu] ?? []) as never}
              onClick={() => onSelectBU(bu)}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Other BUs (if they have projects) */}
      {BU_LIST.filter((bu) => !MAIN_BUS.includes(bu as typeof MAIN_BUS[number]) && (projectsByBU[bu]?.length ?? 0) > 0).length > 0 && (
        <div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {BU_LIST
              .filter((bu) => !MAIN_BUS.includes(bu as typeof MAIN_BUS[number]) && (projectsByBU[bu]?.length ?? 0) > 0)
              .map((bu, i) => (
                <BUOverviewCard
                  key={bu}
                  buName={bu}
                  projects={(projectsByBU[bu] ?? []) as never}
                  onClick={() => onSelectBU(bu)}
                  index={i + MAIN_BUS.length}
                />
              ))}
          </div>
        </div>
      )}

      {/* Favorites */}
      <FavoritesSection projects={(projects ?? []) as never} />
    </motion.div>
  );
}

/* ─── Shared Components ─── */

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
