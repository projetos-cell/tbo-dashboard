"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import {
  useDashboardKPIs,
  useFounderDashboard,
  useFinanceDashboard,
  useLiderDashboard,
} from "@/features/dashboard/hooks/use-dashboard";
import { DynamicGreeting } from "@/features/dashboard/components/dynamic-greeting";
import { FinanceCards } from "@/features/dashboard/components/bento/finance-cards";
import { CashFlowMiniChart } from "@/features/dashboard/components/bento/cashflow-mini-chart";
import { OperationsCards } from "@/features/dashboard/components/bento/operations-cards";
import { PipelineCard } from "@/features/dashboard/components/bento/pipeline-card";
import { AlertsCard } from "@/features/dashboard/components/bento/alerts-card";
import { RecentProjectsCard } from "@/features/dashboard/components/bento/recent-projects-card";
import { OkrSnapshotCard } from "@/features/dashboard/components/founder/okr-snapshot";
import { AgendaSummary } from "@/features/dashboard/components/general/agenda-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { LauncherDashboard } from "@/features/dashboard/components/launcher-dashboard";
import {
  IconAlertTriangle,
  IconUsers,
  IconChartBar,
  IconListDetails,
  IconFolderPlus,
  IconMessage,
} from "@tabler/icons-react";

// ── Skeleton ────────────────────────────────────────────────────────────────

function BentoSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-72" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ── Admin / Founder / Diretoria View ────────────────────────────────────────

function AdminBentoDashboard() {
  const { data: founderData, isLoading: founderLoading } = useFounderDashboard();
  const { data: kpis } = useDashboardKPIs();
  const { data: financeData, isLoading: financeLoading } = useFinanceDashboard();

  if (founderLoading || !founderData) return <BentoSkeleton />;

  return (
    <div className="space-y-4">
      {/* Row 1 — Finance KPIs (4 cards) */}
      {financeData && !financeLoading && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <FinanceCards kpis={financeData.kpis} />
        </div>
      )}

      {/* Row 2 — Cash Flow + Pipeline (2 col) */}
      <div className="grid gap-3 md:grid-cols-2" style={{ minHeight: 280 }}>
        {financeData ? (
          <CashFlowMiniChart data={financeData.cashFlow} />
        ) : (
          <Skeleton className="h-full rounded-2xl" />
        )}
        <PipelineCard deals={founderData.deals} />
      </div>

      {/* Row 3 — Operations KPIs (6 cards) */}
      {kpis && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <OperationsCards kpis={kpis} />
        </div>
      )}

      {/* Row 4 — Alerts + Recent Projects (2 col) */}
      <div className="grid gap-3 md:grid-cols-2" style={{ minHeight: 280 }}>
        <AlertsCard alerts={founderData.alerts} />
        <RecentProjectsCard projects={founderData.projects} />
      </div>
    </div>
  );
}

// ── Lider View ───────────────────────────────────────────────────────────────

function LiderOverdueTasks({
  tasks,
}: {
  tasks: Array<{
    id: string;
    title: string | null;
    due_date: string | null;
    status: string | null;
    is_completed: boolean | null;
  }>;
}) {
  const now = new Date().toISOString().split("T")[0];
  const overdue = tasks
    .filter(
      (t) =>
        !t.is_completed &&
        t.due_date &&
        t.due_date < now &&
        t.status !== "cancelada",
    )
    .slice(0, 6);

  return (
    <div className="flex flex-col rounded-lg border border-border/30 p-4" style={{ minHeight: 280 }}>
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-bold text-foreground">
          <IconAlertTriangle className="size-4 text-red-500" />
          Tarefas Atrasadas
        </p>
        <Link href="/tarefas" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors">
          Ver todas
        </Link>
      </div>
      {overdue.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm font-medium text-green-600">Tudo em dia!</p>
          <p className="text-xs text-muted-foreground/60">Nenhuma tarefa atrasada</p>
        </div>
      ) : (
        <div className="overflow-y-auto">
          {overdue.map((task) => (
            <div
              key={task.id}
              className="flex h-10 items-center gap-2 border-b border-border/30 px-1 hover:bg-muted/40 transition-colors last:border-b-0"
            >
              <div className="size-1.5 shrink-0 rounded-full bg-red-500" />
              <p className="flex-1 truncate text-xs">{task.title}</p>
              <span className="shrink-0 text-[10px] text-red-500 tabular-nums">
                {new Date(task.due_date!).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LiderTeamActions() {
  const actions = [
    { label: "Pessoas", href: "/pessoas", icon: IconUsers, color: "text-purple-600 bg-purple-50" },
    { label: "Relatórios", href: "/relatorios", icon: IconChartBar, color: "text-blue-600 bg-blue-50" },
    { label: "Novo Projeto", href: "/projetos?action=new", icon: IconFolderPlus, color: "text-green-600 bg-green-50" },
    { label: "Nova Tarefa", href: "/tarefas?action=new", icon: IconListDetails, color: "text-amber-600 bg-amber-50" },
    { label: "Chat", href: "/chat", icon: IconMessage, color: "text-pink-600 bg-pink-50" },
  ];
  return (
    <div className="rounded-lg border border-border/30 p-4">
      <p className="mb-3 text-sm font-bold text-foreground">Atalhos</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-2 rounded-lg border border-border/30 p-3 text-sm transition-colors hover:bg-muted/40"
            >
              <div className={`rounded-md p-1.5 ${a.color}`}>
                <Icon className="size-4" />
              </div>
              <span className="font-medium text-xs">{a.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function LiderBentoDashboard() {
  const { data: liderData, isLoading } = useLiderDashboard();
  const { data: kpis } = useDashboardKPIs();

  if (isLoading || !liderData) return <BentoSkeleton />;

  return (
    <div className="space-y-4">
      {/* Row 1 — Operations KPIs (6 cards) */}
      {kpis && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <OperationsCards kpis={kpis} />
        </div>
      )}

      {/* Row 2 — All Projects + OKR Snapshot */}
      <div className="grid gap-3 md:grid-cols-2" style={{ minHeight: 280 }}>
        <RecentProjectsCard projects={liderData.projects} />
        <OkrSnapshotCard snapshots={liderData.okrSnapshots} />
      </div>

      {/* Row 3 — Overdue Tasks + Team Shortcuts */}
      <div className="grid gap-3 md:grid-cols-2">
        <LiderOverdueTasks tasks={liderData.tasks} />
        <LiderTeamActions />
      </div>
    </div>
  );
}

// ── Colaborador View ──────────────────────────────────────────────────────────

function ColaboradorBentoDashboard() {
  const { data: kpis, rawData, isLoading } = useDashboardKPIs();

  if (isLoading || !rawData) return <BentoSkeleton />;

  const now = new Date().toISOString().split("T")[0];
  const myTasks = rawData.tasks
    .filter((t) => !t.is_completed && t.status !== "cancelada")
    .slice(0, 8);

  const overdueCount = rawData.tasks.filter(
    (t) => !t.is_completed && t.due_date && t.due_date < now && t.status !== "cancelada",
  ).length;

  return (
    <div className="space-y-4">
      {/* Row 1 — Personal KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-border/30 p-3">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">Tarefas</p>
          <p className="mt-1 text-xl font-bold tabular-nums">{kpis?.pendingTasks ?? 0}</p>
          <p className="text-[10px] text-muted-foreground/60">pendentes</p>
        </div>
        <div className="rounded-lg border border-border/30 p-3">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">Atrasadas</p>
          <p className={`mt-1 text-xl font-bold tabular-nums ${overdueCount > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {overdueCount}
          </p>
          <p className="text-[10px] text-muted-foreground/60">tarefas</p>
        </div>
        <div className="rounded-lg border border-border/30 p-3">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">Projetos</p>
          <p className="mt-1 text-xl font-bold tabular-nums">{kpis?.activeProjects ?? 0}</p>
          <p className="text-[10px] text-muted-foreground/60">ativos</p>
        </div>
        <div className="rounded-lg border border-border/30 p-3">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">Concluídas</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-emerald-600">{kpis?.completedTasks ?? 0}</p>
          <p className="text-[10px] text-muted-foreground/60">tarefas</p>
        </div>
      </div>

      {/* Row 2 — My Tasks + Agenda */}
      <div className="grid gap-3 md:grid-cols-2" style={{ minHeight: 280 }}>
        <div className="flex flex-col rounded-lg border border-border/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Minhas tarefas</p>
            <Link href="/tarefas" className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors">
              Ver todas
            </Link>
          </div>
          {myTasks.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
              <p className="text-sm font-medium">Tudo em dia!</p>
              <Link href="/tarefas?action=new" className="text-xs text-muted-foreground/60 hover:text-foreground">
                Criar nova tarefa
              </Link>
            </div>
          ) : (
            <div className="overflow-y-auto">
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex h-10 items-center gap-2 border-b border-border/30 px-1 hover:bg-muted/40 transition-colors last:border-b-0"
                >
                  <div
                    className={`size-1.5 shrink-0 rounded-full ${
                      task.due_date && task.due_date < now ? "bg-red-500" : "bg-primary/40"
                    }`}
                  />
                  <p className="flex-1 truncate text-xs">{task.title}</p>
                  {task.due_date && (
                    <span className={`shrink-0 text-[10px] tabular-nums ${task.due_date < now ? "text-red-500" : "text-muted-foreground/60"}`}>
                      {new Date(task.due_date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <AgendaSummary />
      </div>

      {/* Row 3 — Recent Projects */}
      <RecentProjectsCard projects={rawData.projects} />
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

const ROLE_SUBTITLES: Record<string, string> = {
  admin: "Visão executiva da TBO",
  lider: "Visão operacional da equipe",
  colaborador: "Suas tarefas, projetos e agenda",
};

export default function DashboardPage() {
  const role = useAuthStore((s) => s.role);
  const isAdmin = hasMinRole(role, "admin");
  const isLider = role === "lider";
  const [view, setView] = useState<"launcher" | "analytics">("launcher");

  const subtitle = ROLE_SUBTITLES[role ?? "colaborador"] ?? ROLE_SUBTITLES.colaborador;

  if (view === "launcher") {
    return (
      <div className="flex flex-col gap-0">
        <LauncherDashboard />
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={() => setView("analytics")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <IconChartBar className="size-3.5" />
            Ver dashboard analitico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div>
          <DynamicGreeting />
          <p className="mt-0.5 text-xs text-muted-foreground/60">{subtitle}</p>
        </div>
        <button
          onClick={() => setView("launcher")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <IconListDetails className="size-3.5" />
          Launcher
        </button>
      </div>
      <div className="border-b border-border/30 mb-5" />

      {/* Role-based dashboard */}
      <Suspense fallback={<BentoSkeleton />}>
        {isAdmin ? (
          <AdminBentoDashboard />
        ) : isLider ? (
          <LiderBentoDashboard />
        ) : (
          <ColaboradorBentoDashboard />
        )}
      </Suspense>
    </div>
  );
}
