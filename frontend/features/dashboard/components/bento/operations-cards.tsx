"use client";

import Link from "next/link";
import {
  IconLayoutKanban,
  IconChecklist,
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconUsers,
} from "@tabler/icons-react";
import type { DashboardKPIs } from "@/features/dashboard/services/dashboard";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  href: string;
  accent?: boolean;
  subtitle?: string;
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor, href, accent, subtitle }: StatCardProps) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-2xl border p-4 transition-all hover:shadow-md ${
        accent ? "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/10" : "bg-card"
      }`}
    >
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`size-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground/70">{subtitle}</p>}
      </div>
    </Link>
  );
}

interface OperationsCardsProps {
  kpis: DashboardKPIs;
}

export function OperationsCards({ kpis }: OperationsCardsProps) {
  return (
    <>
      <StatCard
        label="Projetos Ativos"
        value={kpis.activeProjects}
        icon={IconLayoutKanban}
        iconBg="bg-blue-50 dark:bg-blue-950/30"
        iconColor="text-blue-600"
        href="/projetos"
        subtitle={`${kpis.completedProjects} finalizados`}
      />
      <StatCard
        label="Tarefas Pendentes"
        value={kpis.pendingTasks}
        icon={IconChecklist}
        iconBg="bg-amber-50 dark:bg-amber-950/30"
        iconColor="text-amber-600"
        href="/tarefas"
        subtitle={`${kpis.completedTasks} concluidas`}
      />
      <StatCard
        label="Tarefas Atrasadas"
        value={kpis.overdueTasks}
        icon={IconAlertTriangle}
        iconBg="bg-red-50 dark:bg-red-950/30"
        iconColor="text-red-500"
        href="/tarefas"
        accent={kpis.overdueTasks > 10}
      />
      <StatCard
        label="Demandas"
        value={kpis.totalDemands}
        icon={IconClock}
        iconBg="bg-purple-50 dark:bg-purple-950/30"
        iconColor="text-purple-600"
        href="/projetos"
      />
      <StatCard
        label="Clientes"
        value={kpis.uniqueClients}
        icon={IconUsers}
        iconBg="bg-orange-50 dark:bg-orange-950/30"
        iconColor="text-orange-600"
        href="/comercial/clientes"
      />
      <StatCard
        label="Finalizados"
        value={kpis.completedProjects}
        icon={IconCheck}
        iconBg="bg-emerald-50 dark:bg-emerald-950/30"
        iconColor="text-emerald-600"
        href="/projetos"
      />
    </>
  );
}
