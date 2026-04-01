"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHelpdeskKPIs } from "@/features/helpdesk/hooks/use-helpdesk";
import {
  IconTicket,
  IconCircleCheck,
  IconLoader2,
  IconClockPlay,
} from "@tabler/icons-react";

export function HelpdeskKpiCards() {
  const { data: kpis, isLoading } = useHelpdeskKPIs();

  const items = [
    { label: "Total de chamados", value: kpis?.total, icon: IconTicket, color: "text-muted-foreground" },
    { label: "Abertos",           value: kpis?.open,  icon: IconClockPlay, color: "text-blue-500" },
    { label: "Em andamento",      value: kpis?.in_progress, icon: IconLoader2, color: "text-amber-500" },
    { label: "Resolvidos hoje",   value: kpis?.resolved_today, icon: IconCircleCheck, color: "text-green-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
            {isLoading ? (
              <Skeleton className="mt-2 h-7 w-12" />
            ) : (
              <p className="mt-1 text-2xl font-bold">{value ?? 0}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
