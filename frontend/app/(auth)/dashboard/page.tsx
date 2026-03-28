"use client";

import { Suspense } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { hasMinRole } from "@/lib/permissions";
import {
  useDashboardKPIs,
  useFounderDashboard,
  useFinanceDashboard,
} from "@/features/dashboard/hooks/use-dashboard";
import { DynamicGreeting } from "@/features/dashboard/components/dynamic-greeting";
import { FinanceCards } from "@/features/dashboard/components/bento/finance-cards";
import { CashFlowMiniChart } from "@/features/dashboard/components/bento/cashflow-mini-chart";
import { OperationsCards } from "@/features/dashboard/components/bento/operations-cards";
import { PipelineCard } from "@/features/dashboard/components/bento/pipeline-card";
import { AlertsCard } from "@/features/dashboard/components/bento/alerts-card";
import { RecentProjectsCard } from "@/features/dashboard/components/bento/recent-projects-card";
import { Skeleton } from "@/components/ui/skeleton";

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

// ── Founder / Diretoria View ────────────────────────────────────────────────

function FounderBentoDashboard() {
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

// ── General View (Lider / Colaborador) ──────────────────────────────────────

function GeneralBentoDashboard() {
  const { data: kpis, rawData, isLoading } = useDashboardKPIs();

  if (isLoading || !rawData) return <BentoSkeleton />;

  return (
    <div className="space-y-4">
      {/* Operations KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <OperationsCards kpis={kpis} />
        </div>
      )}

      {/* Recent Projects */}
      <div className="grid gap-3 md:grid-cols-2" style={{ minHeight: 280 }}>
        <RecentProjectsCard projects={rawData.projects} />
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-sm font-semibold mb-3">Suas tarefas</p>
          <div className="space-y-2">
            {rawData.tasks
              .filter((t) => !t.is_completed && t.status !== "cancelada")
              .slice(0, 6)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted/60 transition-colors"
                >
                  <div
                    className={`size-1.5 shrink-0 rounded-full ${
                      task.due_date && task.due_date < new Date().toISOString().split("T")[0]
                        ? "bg-red-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <p className="text-xs truncate flex-1">{task.title}</p>
                  {task.due_date && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(task.due_date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const role = useAuthStore((s) => s.role);
  const isFounderOrDiretoria = hasMinRole(role, "diretoria");

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-5 p-6">
        {/* Greeting */}
        <div>
          <DynamicGreeting />
          <p className="mt-1 text-sm text-muted-foreground">
            {isFounderOrDiretoria
              ? "Visao executiva da TBO"
              : "Suas tarefas, projetos e agenda"}
          </p>
        </div>

        {/* Role-based Bento dashboard */}
        <Suspense fallback={<BentoSkeleton />}>
          {isFounderOrDiretoria ? (
            <FounderBentoDashboard />
          ) : (
            <GeneralBentoDashboard />
          )}
        </Suspense>
      </div>
    </div>
  );
}
