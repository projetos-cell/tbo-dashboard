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

export function RelatoriosKpiCards({ kpis }: RelatoriosKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Agendamentos</CardTitle>
          <IconCalendarTime className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.totalSchedules}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          <IconCircleCheck className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.activeSchedules}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Execucoes este Mes</CardTitle>
          <IconPlayerPlay className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.thisMonthRuns}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Falhas</CardTitle>
          <IconAlertTriangle className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{kpis.failedRuns}</div>
        </CardContent>
      </Card>
    </div>
  );
}
