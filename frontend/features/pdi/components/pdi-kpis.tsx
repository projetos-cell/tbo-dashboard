"use client";

import { Target, AlertTriangle, CheckCircle, ListTodo } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { PdiKPIs } from "@/features/pdi/services/pdi";

interface PdiKPICardsProps {
  kpis: PdiKPIs;
  isLoading?: boolean;
}

const KPI_CONFIG = [
  { key: "active" as const, label: "Ativos", Icon: Target, text: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
  { key: "overdue" as const, label: "Atrasados", Icon: AlertTriangle, text: "text-red-600", bg: "bg-red-50 dark:bg-red-950/40" },
  { key: "completed" as const, label: "Concluídos", Icon: CheckCircle, text: "text-green-600", bg: "bg-green-50 dark:bg-green-950/40" },
  { key: "openActions" as const, label: "Ações Abertas", Icon: ListTodo, text: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
] as const;

export function PdiKPICards({ kpis, isLoading }: PdiKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg border bg-gray-100/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {KPI_CONFIG.map(({ key, label, Icon, text, bg }) => (
        <Card key={key}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`h-5 w-5 ${text}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold">{kpis[key]}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
