"use client";

import Link from "next/link";
import { RequireRole } from "@/components/auth/require-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  ArrowRight,
  FileBarChart,
  Brain,
  BarChart3,
} from "lucide-react";
import { useIntelligenceKpis } from "@/hooks/use-intelligence";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const INTELLIGENCE_SECTIONS = [
  {
    title: "Visao Financeira",
    description: "DRE, margens e fluxo de caixa",
    href: "/financeiro",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Pipeline Comercial",
    description: "Funil de vendas e forecast",
    href: "/comercial",
    icon: TrendingUp,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Desempenho da Equipe",
    description: "Produtividade e alocacao",
    href: "/pessoas",
    icon: Users,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "OKRs & Metas",
    description: "Progresso de objetivos",
    href: "/okrs",
    icon: Target,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

function InteligenciaContent() {
  const { data: kpis, isLoading } = useIntelligenceKpis();

  const kpiCards = [
    {
      title: "Recebiveis em Aberto",
      value: kpis ? formatCurrency(kpis.totalReceivables) : "--",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Pipeline Comercial",
      value: kpis ? formatCurrency(kpis.pipelineTotal) : "--",
      description: kpis ? `${kpis.openDeals} deals abertos` : undefined,
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      title: "Equipe Ativa",
      value: kpis ? String(kpis.teamCount) : "--",
      icon: Users,
      color: "text-purple-500",
    },
    {
      title: "Progresso OKRs",
      value: kpis ? `${kpis.okrAvgProgress}%` : "--",
      icon: Target,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Inteligencia & BI
        </h1>
        <p className="text-sm text-muted-foreground">
          Dashboards analiticos e insights do negocio.
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-7 w-20" /> : kpi.value}
                </div>
                {kpi.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpi.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Section Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {INTELLIGENCE_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.title}
              className="group transition-shadow hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ${section.bgColor}`}
                >
                  <Icon className={`h-5 w-5 ${section.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold">
                    {section.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {section.description}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="ghost" size="sm" className="px-0" asChild>
                  <Link href={section.href}>
                    Acessar
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reports Section */}
      <Card>
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-500/10">
            <FileBarChart className="h-5 w-5 text-slate-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Relatorios Automatizados</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gere relatorios consolidados com dados de todos os modulos do
              sistema.
            </p>
          </div>
          <Button variant="outline" size="sm" disabled>
            Em breve
          </Button>
        </CardContent>
      </Card>

      {/* AI Insights Placeholder */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium">Insights com IA</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            Em breve, a inteligencia artificial analisara seus dados e sugerira
            acoes estrategicas com base em tendencias e padroes identificados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InteligenciaPage() {
  return (
    <RequireRole minRole="lider" module="intelligence">
      <InteligenciaContent />
    </RequireRole>
  );
}
