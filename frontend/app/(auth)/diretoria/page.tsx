"use client";

import Link from "next/link";
import { RequireRole } from "@/components/auth/require-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Percent,
  Users,
  Flame,
  ArrowRight,
  TrendingUp,
  Landmark,
  Target,
} from "lucide-react";
import { useExecutiveKpis } from "@/hooks/use-diretoria";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const DASHBOARD_SECTIONS = [
  {
    title: "Resumo Financeiro",
    description:
      "Receita, custos e margens consolidadas. Dados atualizados automaticamente do modulo financeiro.",
    href: "/financeiro",
    icon: Landmark,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Pipeline",
    description:
      "Funil de vendas, oportunidades em aberto e forecast de receita para os proximos meses.",
    href: "/comercial",
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Equipe & OKRs",
    description:
      "Alocacao da equipe, produtividade e progresso dos Objetivos e Resultados-Chave.",
    href: "/okrs",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
];

function DiretoriaContent() {
  const { data: kpis, isLoading } = useExecutiveKpis();

  const executiveKpiCards = [
    {
      title: "Receita (MRR)",
      value: kpis ? formatCurrency(kpis.mrr) : "--",
      description: "Receita total de recebiveis",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Margem",
      value: kpis ? `${kpis.marginPercent}%` : "--",
      description: "Margem sobre receita",
      icon: Percent,
      color: "text-blue-500",
    },
    {
      title: "Equipe Ativa",
      value: kpis ? String(kpis.teamCount) : "--",
      description: "Colaboradores ativos",
      icon: Users,
      color: "text-purple-500",
    },
    {
      title: "Burn Rate",
      value: kpis ? formatCurrency(kpis.burnRate) : "--",
      description: "Despesas pagas no periodo",
      icon: Flame,
      color: "text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Painel da Diretoria
        </h1>
        <p className="text-sm text-muted-foreground">
          Visao executiva consolidada do negocio.
        </p>
      </div>

      {/* Executive KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {executiveKpiCards.map((kpi) => {
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
                  {isLoading ? <Skeleton className="h-7 w-24" /> : kpi.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional KPI Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-7 w-24" />
              ) : kpis ? (
                formatCurrency(kpis.pipelineTotal)
              ) : (
                "--"
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis ? `${kpis.openDeals} deals em aberto` : "Valor total do funil"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-7 w-24" />
              ) : kpis ? (
                formatCurrency(kpis.totalPayables)
              ) : (
                "--"
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pagamentos pendentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso OKRs</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : kpis ? (
                `${kpis.okrAvgProgress}%`
              ) : (
                "--"
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Media dos Key Results
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        {DASHBOARD_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="flex flex-col">
              <CardHeader className="flex flex-row items-start gap-3 pb-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${section.bgColor}`}
                >
                  <Icon className={`h-5 w-5 ${section.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-4">
                  {section.description}
                </p>
              </CardContent>
              <div className="px-6 pb-4">
                <Button variant="ghost" size="sm" className="px-0" asChild>
                  <Link href={section.href}>
                    Ver detalhes
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Footer note */}
      <Card>
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground text-center">
            Dados consolidados automaticamente dos modulos do sistema. Ultima
            atualizacao: tempo real.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DiretoriaPage() {
  return (
    <RequireRole allowed={["admin"]} module="diretoria">
      <DiretoriaContent />
    </RequireRole>
  );
}
