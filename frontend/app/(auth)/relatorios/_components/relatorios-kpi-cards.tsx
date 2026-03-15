import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconCalendarTime,
  IconCircleCheck,
  IconPlayerPlay,
  IconAlertTriangle,
} from "@tabler/icons-react";
import type { ReportsKPIs } from "@/services/reports";

interface RelatoriosKpiCardsProps {
  kpis: ReportsKPIs;
}

const cards = [
  {
    key: "totalSchedules" as const,
    label: "Total Agendamentos",
    icon: IconCalendarTime,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    key: "activeSchedules" as const,
    label: "Ativos",
    icon: IconCircleCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    key: "thisMonthRuns" as const,
    label: "Execucoes este Mes",
    icon: IconPlayerPlay,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    iconColor: "text-violet-500",
  },
  {
    key: "failedRuns" as const,
    label: "Falhas",
    icon: IconAlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    iconColor: "text-red-500",
  },
];

export function RelatoriosKpiCards({ kpis }: RelatoriosKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, color, bgColor, iconColor }) => {
        const value = kpis[key];
        const isFailures = key === "failedRuns";
        const hasIssue = isFailures && value > 0;

        return (
          <Card key={key} className={hasIssue ? "border-red-200" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <div className={`rounded-md p-1.5 ${bgColor}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              {key === "activeSchedules" && kpis.totalSchedules > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {Math.round((value / kpis.totalSchedules) * 100)}% do total
                </p>
              )}
              {isFailures && kpis.thisMonthRuns > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {Math.round((value / kpis.thisMonthRuns) * 100)}% das execucoes
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
