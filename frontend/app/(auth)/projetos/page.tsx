"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { useProjectFavorites } from "@/features/projects/hooks/use-project-favorites";
import { ProjectForm } from "@/features/projects/components/project-form";
import { RequireRole } from "@/features/auth/components/require-role";
import { useUser } from "@/hooks/use-user";
import { useGlobalShortcuts } from "@/hooks/use-global-shortcuts";
import { parseBus } from "@/features/projects/utils/parse-bus";
import {
  BU_LIST,
  BU_COLORS,
  PROJECT_STATUS,
  type ProjectStatusKey,
} from "@/lib/constants";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBriefcase,
  IconCalendar,
  IconChevronRight,
  IconCircleCheck,
  IconEye,
  IconFolders,
  IconPlayerPlay,
  IconPlus,
  IconStarFilled,
  IconLayoutKanban,
  IconList,
  IconTimeline,
  IconClock,
  IconChartPie,
  IconUsers,
  IconFolder,
  IconCube,
  IconCopy,
  IconSettings,
  IconScale,
} from "@tabler/icons-react";
import type { Database } from "@/lib/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

/* ─── TBO Design Tokens ───────────────────────────────────────────── */

const T = {
  bg: "#f0ede9",
  bgAlt: "#e8e4df",
  surface: "#e2dfd9",
  white: "#ffffff",
  text: "#0f0f0f",
  muted: "#4a4a4a",
  ghost: "rgba(15,15,15,0.10)",
  orange: "#c45a1a",
  orangeHover: "#aa4d17",
  orangeLight: "#d97a45",
  orangeMuted: "#9e835f",
  orangeGlow: "rgba(196,90,26,0.10)",
  border: "rgba(15,15,15,0.08)",
  borderSolid: "#e0dcd7",
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(255,255,255,0.45)",
  glassShadow:
    "0 8px 32px rgba(15,15,15,0.06), 0 1px 3px rgba(15,15,15,0.04)",
  glassBlur: "blur(16px) saturate(180%)",
  glassDark: "rgba(15,15,15,0.75)",
  glassDarkBorder: "rgba(255,255,255,0.08)",
  r: "16px",
  rSm: "10px",
  rXs: "8px",
};

/* ─── Section Card ────────────────────────────────────────────────── */

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-5 ${className}`} style={{ background: T.glass, backdropFilter: T.glassBlur, WebkitBackdropFilter: T.glassBlur, border: `1px solid ${T.glassBorder}`, borderRadius: T.r, boxShadow: T.glassShadow }}>
      {children}
    </div>
  );
}

/* ─── Module Definitions ──────────────────────────────────────────── */

type ModuleDef = { href: string; label: string; description: string; icon: React.ElementType; color: string };

const MODULES: ModuleDef[] = [
  { href: "/projetos/board", label: "Board", description: "Kanban de projetos por status", icon: IconLayoutKanban, color: "#3b82f6" },
  { href: "/projetos/lista", label: "Lista", description: "Visão em tabela com filtros", icon: IconList, color: "#0ea5e9" },
  { href: "/projetos/gantt", label: "Gantt", description: "Cronograma visual de entregas", icon: IconTimeline, color: "#c45a1a" },
  { href: "/projetos/timeline", label: "Timeline", description: "Linha do tempo dos projetos", icon: IconClock, color: "#8b5cf6" },
  { href: "/projetos/calendario", label: "Calendário", description: "Datas de entrega no calendário", icon: IconCalendar, color: "#f59e0b" },
  { href: "/projetos/portfolio", label: "Portfolio", description: "Visão consolidada por BU", icon: IconChartPie, color: "#ec4899" },
  { href: "/projetos/workload", label: "Workload", description: "Carga de trabalho por pessoa", icon: IconUsers, color: "#14b8a6" },
  { href: "/projetos/arquivos", label: "Arquivos", description: "Repositório de arquivos", icon: IconFolder, color: "#6366f1" },
  { href: "/projetos/fluxo-3d", label: "Fluxo 3D", description: "Pipeline de produção 3D", icon: IconCube, color: "#22c55e" },
  { href: "/projetos/templates", label: "Templates", description: "Modelos reutilizáveis", icon: IconCopy, color: "#f97316" },
  { href: "/projetos/decisoes", label: "Decisões", description: "Registro de decisões de projeto", icon: IconScale, color: "#a855f7" },
  { href: "/projetos/configuracoes", label: "Configurações", description: "Status, propriedades e regras", icon: IconSettings, color: "#9ca3af" },
];

function ModuleCard({ mod }: { mod: ModuleDef }) {
  const Icon = mod.icon;
  return (
    <Link href={mod.href} className="block transition-all hover:scale-[1.005]">
      <div className="p-4 flex items-center gap-3" style={{ background: T.glass, backdropFilter: T.glassBlur, WebkitBackdropFilter: T.glassBlur, border: `1px solid ${T.glassBorder}`, borderRadius: T.rSm, boxShadow: T.glassShadow }}>
        <div className="rounded-lg p-2.5 shrink-0" style={{ background: `${mod.color}15` }}>
          <Icon className="size-5" style={{ color: mod.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: T.text }}>{mod.label}</p>
          <p className="text-[11px] truncate" style={{ color: T.muted }}>{mod.description}</p>
        </div>
        <IconArrowRight className="size-4 shrink-0" style={{ color: T.muted }} />
      </div>
    </Link>
  );
}

/* ─── All Projects Card ───────────────────────────────────────────── */

function AllProjectsCard({ total, active }: { total: number; active: number }) {
  return (
    <Link href="/projetos/lista" className="block transition-all hover:scale-[1.005]">
      <div
        className="relative overflow-hidden p-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #1a1410 0%, #2d1810 50%, #c45a1a 100%)", borderRadius: T.r, boxShadow: "0 8px 32px rgba(196,90,26,0.15)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute -top-6 -right-6 size-24 border-[2px] border-white rounded-full" />
          <div className="absolute bottom-0 left-8 size-12 border-[2px] border-white rounded-full" />
        </div>
        <div className="relative rounded-xl p-3 shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
          <IconFolders className="size-7 text-white" />
        </div>
        <div className="relative flex-1 min-w-0">
          <p className="text-white font-semibold text-base">Todos os Projetos</p>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Lista completa com filtros avançados</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
              <span className="font-bold text-white tabular-nums">{total}</span> no total
            </span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
              <span className="font-bold text-white tabular-nums">{active}</span> ativos
            </span>
          </div>
        </div>
        <IconArrowRight className="relative size-5 shrink-0" style={{ color: "rgba(255,255,255,0.6)" }} />
      </div>
    </Link>
  );
}

/* ─── BU Link Cards ───────────────────────────────────────────────── */

function BULinkCards({ projectsByBU }: { projectsByBU: Record<string, Project[]> }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {BU_LIST.map((bu) => {
        const count = projectsByBU[bu]?.length ?? 0;
        const buColor = BU_COLORS[bu];
        return (
          <Link
            key={bu}
            href={`/projetos/lista?bu=${encodeURIComponent(bu)}`}
            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: T.glass,
              backdropFilter: T.glassBlur,
              WebkitBackdropFilter: T.glassBlur,
              border: `1px solid ${T.glassBorder}`,
              borderRadius: T.rSm,
              boxShadow: T.glassShadow,
            }}
          >
            <IconBriefcase className="size-5" style={{ color: buColor?.color ?? T.muted }} />
            <span className="text-[11px] font-medium" style={{ color: T.text }}>{bu}</span>
            <span className="text-[10px] tabular-nums" style={{ color: T.muted }}>
              {count} projeto{count !== 1 ? "s" : ""}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── KPIs Widget ─────────────────────────────────────────────────── */

function KPIsWidget({ projects }: { projects: Project[] }) {
  const stats = useMemo(() => {
    const total = projects.length;
    const emAndamento = projects.filter((p) => p.status === "em_andamento").length;
    const emRevisao = projects.filter((p) => p.status === "em_revisao").length;
    const concluido = projects.filter((p) => p.status === "concluido").length;
    const now = new Date();
    const atrasados = projects.filter((p) => {
      if (p.status === "concluido") return false;
      if (!p.due_date_end) return false;
      return new Date(p.due_date_end) < now;
    }).length;
    const completionRate = total > 0 ? Math.round((concluido / total) * 100) : 0;
    return { total, emAndamento, emRevisao, concluido, atrasados, completionRate };
  }, [projects]);

  const items = [
    { label: "Total", value: stats.total, icon: IconFolders, color: T.muted },
    { label: "Ativos", value: stats.emAndamento, icon: IconPlayerPlay, color: "#3b82f6" },
    { label: "Concluidos", value: stats.concluido, icon: IconCircleCheck, sub: `${stats.completionRate}%`, color: "#10b981" },
    { label: "Revisao", value: stats.emRevisao, icon: IconEye, color: "#8b5cf6" },
    { label: "Atrasados", value: stats.atrasados, icon: IconAlertTriangle, color: stats.atrasados > 0 ? "#ef4444" : T.muted },
  ];

  return (
    <SectionCard>
      <h3 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Resumo</h3>
      <div className="space-y-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="size-3.5" style={{ color: item.color }} />
                <span className="text-[11px]" style={{ color: T.muted }}>{item.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-semibold tabular-nums" style={{ color: T.text }}>{item.value}</span>
                {item.sub && <span className="text-[10px]" style={{ color: T.muted }}>{item.sub}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* ─── Favorites Widget ────────────────────────────────────────────── */

function FavoritesWidget({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const { data: favoriteIds } = useProjectFavorites();
  const favorites = useMemo(() => {
    if (!favoriteIds || favoriteIds.length === 0) return [];
    return projects.filter((p) => favoriteIds.includes(p.id)).slice(0, 5);
  }, [favoriteIds, projects]);

  if (favorites.length === 0) return null;

  return (
    <SectionCard>
      <div className="flex items-center gap-2 mb-3">
        <IconStarFilled className="size-3.5" style={{ color: "#f59e0b" }} />
        <h3 className="text-sm font-semibold" style={{ color: T.text }}>Favoritos</h3>
      </div>
      <div className="space-y-2">
        {favorites.map((p) => {
          const status = PROJECT_STATUS[p.status as ProjectStatusKey];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => router.push(`/projetos/${p.id}`)}
              className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-black/[0.03] text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-snug truncate" style={{ color: T.text }}>{p.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {p.code && (
                    <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: T.muted }}>{p.code}</span>
                  )}
                  {status && <span className="size-1.5 rounded-full shrink-0" style={{ background: status.color }} />}
                </div>
              </div>
              <IconChevronRight className="size-3 mt-1 shrink-0" style={{ color: T.muted }} />
            </button>
          );
        })}
      </div>
      <Link
        href="/projetos/lista"
        className="w-full mt-3 text-center text-[11px] font-medium py-2 rounded-lg block"
        style={{ color: T.orange, background: T.orangeGlow }}
      >
        Ver todos os projetos
      </Link>
    </SectionCard>
  );
}

/* ─── Overdue Widget ──────────────────────────────────────────────── */

function OverdueWidget({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const overdue = useMemo(() => {
    const now = new Date();
    return projects
      .filter((p) => {
        if (p.status === "concluido") return false;
        if (!p.due_date_end) return false;
        return new Date(p.due_date_end) < now;
      })
      .slice(0, 5);
  }, [projects]);

  if (overdue.length === 0) return null;

  return (
    <SectionCard>
      <div className="flex items-center gap-2 mb-3">
        <IconAlertTriangle className="size-3.5" style={{ color: "#ef4444" }} />
        <h3 className="text-sm font-semibold" style={{ color: T.text }}>Atrasados</h3>
        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
          {overdue.length}
        </span>
      </div>
      <div className="space-y-2">
        {overdue.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => router.push(`/projetos/${p.id}`)}
            className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-red-50/50 text-left"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium leading-snug truncate" style={{ color: T.text }}>{p.name}</p>
              {p.due_date_end && (
                <span className="text-[10px] text-red-500">
                  Venceu {new Date(p.due_date_end).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </span>
              )}
            </div>
            <IconChevronRight className="size-3 mt-1 shrink-0" style={{ color: T.muted }} />
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

/* ─── Loading Skeleton ────────────────────────────────────────────── */

function HubSkeleton() {
  return (
    <div className="-mx-4 md:-mx-8 lg:-mx-12 -my-6">
      <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
        <aside
          className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4"
          style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderRight: `1px solid ${T.glassBorder}` }}
        >
          <Skeleton className="h-40 rounded-2xl" />
        </aside>
        <main className="flex-1 min-w-0 p-5 space-y-4">
          <Skeleton className="h-10 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-24 rounded-2xl" />
        </main>
        <aside
          className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4"
          style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderLeft: `1px solid ${T.glassBorder}` }}
        >
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </aside>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */

export default function ProjetosPage() {
  const user = useAuthStore((s) => s.user);
  const [formOpen, setFormOpen] = useState(false);

  useUser();
  useGlobalShortcuts();

  // "n" key → open new project form
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

  const { data: rawProjects, isLoading } = useProjects();

  // Normalize UUID statuses
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const projects = useMemo(() => {
    if (!rawProjects) return [];
    return rawProjects.map((p) => {
      if (p.status && UUID_RE.test(p.status) && !(p.status in PROJECT_STATUS)) {
        return { ...p, status: "em_andamento" };
      }
      return p;
    });
  }, [rawProjects]); // eslint-disable-line react-hooks/exhaustive-deps

  // Group by BU (for counts on BU cards)
  const projectsByBU = useMemo(() => {
    const map: Record<string, Project[]> = {};
    for (const bu of BU_LIST) map[bu] = [];
    for (const p of projects) {
      const bus = parseBus(p.bus);
      for (const bu of bus) {
        if (!map[bu]) map[bu] = [];
        map[bu].push(p);
      }
    }
    return map;
  }, [projects]);

  const activeCount = useMemo(
    () => projects.filter((p) => p.status === "em_andamento").length,
    [projects],
  );

  if (!user || isLoading) return <HubSkeleton />;

  return (
    <RequireRole module="projetos">
      <div className="-mx-4 md:-mx-8 lg:-mx-12">
        <div className="flex gap-0 min-h-[calc(100dvh-64px)]">
          {/* ─── Left Sidebar ──────────────────────────────────── */}
          <aside
            className="hidden lg:flex flex-col w-[260px] shrink-0 p-4 gap-4"
            style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderRight: `1px solid ${T.glassBorder}` }}
          >
            <KPIsWidget projects={projects} />
          </aside>

          {/* ─── Center ────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 p-5 space-y-4">
            {/* Stats row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold tabular-nums" style={{ color: T.text }}>
                  {projects.length} <span className="text-xs font-normal" style={{ color: T.muted }}>projetos</span>
                </span>
                <span className="text-sm font-semibold tabular-nums" style={{ color: T.text }}>
                  {activeCount} <span className="text-xs font-normal" style={{ color: T.muted }}>ativos</span>
                </span>
              </div>
              <button
                onClick={() => setFormOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: T.orangeGlow, color: T.orange }}
              >
                <IconPlus className="size-3.5" />
                Novo Projeto
              </button>
            </div>

            {/* Módulos */}
            <div>
              <h2 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Módulos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MODULES.map((mod) => (
                  <ModuleCard key={mod.href} mod={mod} />
                ))}
              </div>
            </div>

            {/* Business Units */}
            <div>
              <h2 className="text-sm font-semibold mb-3" style={{ color: T.text }}>Por Business Unit</h2>
              <BULinkCards projectsByBU={projectsByBU} />
            </div>

            {/* All Projects — large card */}
            <AllProjectsCard total={projects.length} active={activeCount} />
          </main>

          {/* ─── Right Sidebar ─────────────────────────────────── */}
          <aside
            className="hidden xl:flex flex-col w-[300px] shrink-0 p-4 gap-4"
            style={{ background: "rgba(240,237,233,0.5)", backdropFilter: "blur(8px)", borderLeft: `1px solid ${T.glassBorder}` }}
          >
            <FavoritesWidget projects={projects} />
            <OverdueWidget projects={projects} />
          </aside>
        </div>
      </div>

      <ProjectForm open={formOpen} onOpenChange={setFormOpen} />
    </RequireRole>
  );
}
