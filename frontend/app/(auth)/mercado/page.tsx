"use client";

import Link from "next/link";
import {
  IconUsers,
  IconBuilding,
  IconTrendingUp,
  IconChartBar,
  IconArrowRight,
  IconMapPin,
  IconCurrencyReal,
  IconTarget,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CENSO_PR_RESUMO } from "@/features/mercado/utils/censo-pr-data";
import { LANCAMENTOS } from "@/features/mercado/utils/lancamentos-pr-data";
import { MERCADO_CURITIBA, CREDITO_IMOBILIARIO } from "@/features/mercado/utils/indicadores-data";
import { KPIBig, fmtNum } from "@/features/mercado/components/mercado-page-components";

export default function MercadoPage() {
  const lancamentosAtivos = LANCAMENTOS.filter(
    (l) => l.status === "lancamento" || l.status === "em-obras",
  ).length;
  const vsoMedio =
    LANCAMENTOS.reduce((acc, l) => acc + (l.unidadesVendidas / l.unidades) * 100, 0) /
    LANCAMENTOS.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Inteligência de Mercado
        </h1>
        <p className="text-muted-foreground">
          Dados demográficos, lançamentos imobiliários e indicadores do Paraná
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="População PR"
              value={fmtNum(CENSO_PR_RESUMO.populacao)}
              sub={`+${CENSO_PR_RESUMO.crescimento}% vs 2010`}
              icon={IconUsers}
            />
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="Lançamentos ativos"
              value={String(lancamentosAtivos)}
              sub={`VSO médio: ${vsoMedio.toFixed(1)}%`}
              icon={IconBuilding}
            />
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="VGV Curitiba"
              value={`R$ ${MERCADO_CURITIBA.vgvAnual} bi`}
              sub={`${fmtNum(MERCADO_CURITIBA.unidadesLancadas)} unidades/ano`}
              icon={IconCurrencyReal}
            />
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="Selic"
              value={`${CREDITO_IMOBILIARIO.taxaSelic}%`}
              sub={`Financ. médio: ${CREDITO_IMOBILIARIO.taxaMediaFinanciamento}% a.a.`}
              icon={IconTrendingUp}
            />
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <ModuleCard
          href="/mercado/censo"
          icon={IconMapPin}
          title="Censo IBGE 2022"
          description="Dados demográficos e habitacionais do Paraná — população, urbanização, déficit habitacional, mesorregiões"
          highlights={[
            `${fmtNum(CENSO_PR_RESUMO.populacao)} habitantes`,
            `${CENSO_PR_RESUMO.urbanizacao}% urbanização`,
            `${CENSO_PR_RESUMO.totalMunicipios} municípios`,
          ]}
          badge="IBGE"
        />
        <ModuleCard
          href="/mercado/lancamentos"
          icon={IconBuilding}
          title="Lançamentos PR"
          description="Tracker de empreendimentos do mercado primário — incorporadoras, tipologias, preço/m², velocidade de vendas"
          highlights={[
            `${LANCAMENTOS.length} empreendimentos`,
            `Preço/m² médio: R$ ${fmtNum(MERCADO_CURITIBA.precoM2Medio)}`,
            `Batel: R$ ${fmtNum(MERCADO_CURITIBA.precoM2Batel)}/m²`,
          ]}
          badge="Órulo"
          badgeVariant="secondary"
        />
        <ModuleCard
          href="/mercado/indicadores"
          icon={IconChartBar}
          title="Indicadores"
          description="FipeZap, CUB, INCC, crédito imobiliário, ranking de cidades e dados macro do mercado"
          highlights={[
            `Ticket médio: R$ ${fmtNum(MERCADO_CURITIBA.ticketMedio)}`,
            `Estoque: ${fmtNum(MERCADO_CURITIBA.estoqueUnidades)} un.`,
            `Vol. financiado: R$ ${CREDITO_IMOBILIARIO.volumeFinanciado2024} bi`,
          ]}
          badge="CBIC"
          badgeVariant="outline"
        />
      </div>

      {/* Recent launches highlight */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconTarget className="h-4 w-4" />
              Últimos lançamentos
            </CardTitle>
            <Link
              href="/mercado/lancamentos"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              Ver todos <IconArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LANCAMENTOS.filter((l) => l.status === "lancamento")
              .slice(0, 4)
              .map((l) => (
                <div
                  key={l.id}
                  className="rounded-lg border p-3 space-y-1.5"
                >
                  <p className="text-sm font-medium truncate">{l.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.incorporadora} · {l.bairro}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span>R$ {fmtNum(l.precoM2)}/m²</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {l.tipologia}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Fontes: IBGE Censo 2022 · IPARDES · FipeZap · CBIC · SINDUSCON-PR ·
        Integração Órulo API em desenvolvimento
      </p>
    </div>
  );
}

/* ── Module navigation card ─────────────────────────────────── */

function ModuleCard({
  href,
  icon: Icon,
  title,
  description,
  highlights,
  badge,
  badgeVariant = "default",
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  highlights: string[];
  badge: string;
  badgeVariant?: "default" | "secondary" | "outline";
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            </div>
            <Badge variant={badgeVariant} className="text-[10px]">
              {badge}
            </Badge>
          </div>
          <CardDescription className="text-xs leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {highlights.map((h) => (
            <div
              key={h}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <div className="h-1 w-1 rounded-full bg-primary/50" />
              {h}
            </div>
          ))}
          <div className="flex items-center gap-1 pt-2 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Explorar <IconArrowRight className="h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
