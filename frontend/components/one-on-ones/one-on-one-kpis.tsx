"use client";

import { MessageSquare, CalendarDays, CheckCircle, ListTodo } from "lucide-react";
import { Card, CardContent } from "@/components/tbo-ui/card";
import type { OneOnOneKPIs } from "@/services/one-on-ones";

interface OneOnOneKPICardsProps {
  kpis: OneOnOneKPIs;
  isLoading?: boolean;
}

const KPI_CONFIG = [
  { key: "total" as const, label: "Total 1:1s", Icon: MessageSquare, text: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
  { key: "scheduled" as const, label: "Agendadas", Icon: CalendarDays, text: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
  { key: "completed" as const, label: "Concluídas", Icon: CheckCircle, text: "text-green-600", bg: "bg-green-50 dark:bg-green-950/40" },
  { key: "pendingActions" as const, label: "Ações Pendentes", Icon: ListTodo, text: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
] as const;

export function OneOnOneKPICards({ kpis, isLoading }: OneOnOneKPICardsProps) {
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
