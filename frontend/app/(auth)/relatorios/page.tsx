"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireRole } from "@/features/auth/components/require-role";
import { useReportSchedules, useReportRuns } from "@/hooks/use-reports";
import { computeReportsKPIs } from "@/services/reports";
import { ErrorState } from "@/components/shared";
import { RelatoriosKpiCards } from "./_components/relatorios-kpi-cards";
import { RelatoriosTabAgendamentos } from "./_components/relatorios-tab-agendamentos";
import { RelatoriosTabExecucoes } from "./_components/relatorios-tab-execucoes";

export default function RelatoriosPage() {
  const [tab, setTab] = useState("agendamentos");

  const {
    data: schedules = [],
    error: schedulesError,
    refetch: refetchSchedules,
  } = useReportSchedules();

  const {
    data: allRuns = [],
    error: runsError,
    refetch: refetchRuns,
  } = useReportRuns();

  const primaryError = schedulesError || runsError;
  const primaryRefetch = () => { refetchSchedules(); refetchRuns(); };

  const kpis = useMemo(() => computeReportsKPIs(schedules, allRuns), [schedules, allRuns]);

  return (
    <RequireRole minRole="diretoria" module="relatorios">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatorios</h1>
          <p className="text-sm text-gray-500">
            Agendamentos de relatorios e historico de execucoes.
          </p>
        </div>

        {primaryError && (
          <ErrorState message={primaryError.message} onRetry={primaryRefetch} />
        )}

        <RelatoriosKpiCards kpis={kpis} />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
            <TabsTrigger value="execucoes">Execucoes</TabsTrigger>
          </TabsList>

          <TabsContent value="agendamentos" className="space-y-4">
            <RelatoriosTabAgendamentos />
          </TabsContent>

          <TabsContent value="execucoes" className="space-y-4">
            <RelatoriosTabExecucoes />
          </TabsContent>
        </Tabs>
      </div>
    </RequireRole>
  );
}
