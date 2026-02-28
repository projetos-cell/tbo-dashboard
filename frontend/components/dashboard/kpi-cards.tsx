"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardKPIs } from "@/services/dashboard";
import {
  FolderKanban,
  ListChecks,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";

const kpiConfig = [
  {
    key: "activeProjects" as const,
    label: "Projetos Ativos",
    icon: FolderKanban,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "pendingTasks" as const,
    label: "Tarefas Pendentes",
    icon: ListChecks,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    key: "overdueTasks" as const,
    label: "Tarefas Atrasadas",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    key: "completedProjects" as const,
    label: "Projetos Finalizados",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    key: "totalDemands" as const,
    label: "Demandas",
    icon: Clock,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    key: "uniqueClients" as const,
    label: "Clientes",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

export function KPICards({ kpis }: { kpis: DashboardKPIs }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {kpiConfig.map(({ key, label, icon: Icon, color, bgColor }) => (
        <Card key={key}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`rounded-lg p-2 ${bgColor}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{kpis[key]}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
