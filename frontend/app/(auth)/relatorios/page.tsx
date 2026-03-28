"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RequireRole } from "@/features/auth/components/require-role";
import { useReportSchedules, useReportRuns, useReportRunsRealtime } from "@/hooks/use-reports";
import { computeReportsKPIs } from "@/services/reports";
import { ErrorState } from "@/components/shared";
import { RelatoriosKpiCards } from "./_components/relatorios-kpi-cards";
import { RelatoriosTabAgendamentos } from "./_components/relatorios-tab-agendamentos";
import { RelatoriosTabExecucoes } from "./_components/relatorios-tab-execucoes";
import { IconFileAnalytics } from "@tabler/icons-react";

const TAB_DESCRIPTIONS: Record<string, string> = {
  agendamentos: "Configure relatorios automaticos para sua equipe.",
  execucoes: "Historico completo de execucoes de relatorios.",
};

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

  useReportRunsRealtime();

  const primaryError = schedulesError || runsError;
  const primaryRefetch = () => { refetchSchedules(); refetchRuns(); };

  const kpis = useMemo(() => computeReportsKPIs(schedules, allRuns), [schedules, allRuns]);

  return (
    <RequireRole minRole="admin" module="relatorios">
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Relatorios</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <IconFileAnalytics className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Relatorios</h1>
            <p className="text-sm text-muted-foreground">
              {TAB_DESCRIPTIONS[tab]}
            </p>
          </div>
        </div>

        {primaryError && (
          <ErrorState message={primaryError.message} onRetry={primaryRefetch} />
        )}

        <RelatoriosKpiCards kpis={kpis} />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="agendamentos" className="gap-1.5">
              Agendamentos
              {schedules.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                  {schedules.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="execucoes" className="gap-1.5">
              Execucoes
              {allRuns.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                  {allRuns.length}
                </Badge>
              )}
            </TabsTrigger>
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
