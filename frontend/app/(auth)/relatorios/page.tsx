"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  IconFileAnalytics,
  IconChartBar,
  IconCalendarClock,
  IconArrowsLeftRight,
  IconMathFunction,
  IconShieldCheck,
  IconArrowRight,
} from "@tabler/icons-react";
import { useBIDashboards, useScheduledReports, useDataQualityScores } from "@/features/relatorios/hooks/use-reports";

const TAB_DESCRIPTIONS: Record<string, string> = {
  agendamentos: "Configure relatorios automaticos para sua equipe.",
  execucoes: "Historico completo de execucoes de relatorios.",
};

// ── Navigation Hub Cards ──────────────────────────────────────────────────────

const BI_SECTIONS = [
  {
    href: "/relatorios/bi",
    icon: IconChartBar,
    title: "BI Dashboards",
    description: "Crie dashboards personalizados com widgets e gráficos interativos.",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    href: "/relatorios/agendados",
    icon: IconCalendarClock,
    title: "Relatórios Agendados",
    description: "Envios automáticos por e-mail em PDF, CSV ou Excel.",
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    href: "/relatorios/yoy",
    icon: IconArrowsLeftRight,
    title: "Comparativo Anual",
    description: "YoY: receita, despesas, margem, pipeline e headcount.",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    href: "/relatorios/unit-economics",
    icon: IconMathFunction,
    title: "Unit Economics",
    description: "CAC, LTV, Payback Period, receita e lucro por colaborador.",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    href: "/relatorios/qualidade-dados",
    icon: IconShieldCheck,
    title: "Qualidade de Dados",
    description: "Score de completude por módulo. Identifique lacunas críticas.",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
];

function BiSectionCards() {
  const { data: biDashboards = [] } = useBIDashboards();
  const { data: scheduledReports = [] } = useScheduledReports();
  const { data: qualityScores = [] } = useDataQualityScores();

  const badges: Record<string, string | number | undefined> = {
    "/relatorios/bi": biDashboards.length > 0 ? biDashboards.length : undefined,
    "/relatorios/agendados": scheduledReports.filter((r) => r.is_active).length > 0
      ? `${scheduledReports.filter((r) => r.is_active).length} ativos`
      : undefined,
    "/relatorios/qualidade-dados": qualityScores.length > 0
      ? `${Math.round(qualityScores.reduce((s, sc) => s + Number(sc.completeness_pct ?? 0), 0) / qualityScores.length)}% completo`
      : undefined,
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {BI_SECTIONS.map((section) => {
        const Icon = section.icon;
        const badge = badges[section.href];
        return (
          <Card key={section.href} className="group transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2 ${section.bg}`}>
                  <Icon className={`h-5 w-5 ${section.color}`} />
                </div>
                {badge !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-sm">{section.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                {section.description}
              </p>
              <Button asChild variant="ghost" size="sm" className="mt-3 -ml-2 gap-1 text-xs">
                <Link href={section.href}>
                  Acessar
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
      <div className="space-y-6">
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
              Central de inteligência — dashboards, relatórios e análises estratégicas.
            </p>
          </div>
        </div>

        {/* BI Hub Navigation */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Módulos de Análise
          </h2>
          <BiSectionCards />
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
