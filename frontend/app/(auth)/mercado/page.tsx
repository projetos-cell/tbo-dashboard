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
import { ReportHeader } from "@/features/mercado/components/report-header";

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
      <ReportHeader
        title="Inteligência Estratégica"
        subtitle="Radar competitivo da TBO — empreendimentos, incorporadoras, preços, estoque e indicadores macro em 5 estados"
        sources={[
          { label: "Órulo API + CSV", date: "Tempo real" },
          { label: "IBGE Censo", date: "Dez 2022" },
          { label: "FipeZap + CBIC", date: "2026" },
        ]}
      />

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

      {/* Navigation Cards — ordenados por valor estratégico */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ModuleCard
          href="/mercado/catalogo"
          icon={IconMapPin}
          title="Catálogo Regional"
          description="Base proprietária de 1.600+ empreendimentos com contatos comerciais, comissões e documentos — SP, RJ, PR, Curitiba, SC."
          highlights={[
            "1.600+ empreendimentos mapeados",
            "5 regiões estratégicas",
            "Contatos diretos + comissões PJ/PF",
          ]}
          badge="ESTRATÉGICO"
        />
        <ModuleCard
          href="/mercado/orulo"
          icon={IconBuilding}
          title="Radar Órulo (API Live)"
          description="Feed em tempo real do mercado nacional — preços, estoque, tipologias. Sincroniza automaticamente com o Supabase."
          highlights={[
            "Dados em tempo real via API v2",
            "Filtros por UF, cidade, tipologia",
            "Sync automático Supabase",
          ]}
          badge="LIVE"
        />
        <ModuleCard
          href="/mercado/lancamentos"
          icon={IconTarget}
          title="Lançamentos PR"
          description="Tracker do mercado primário do Paraná — velocidade de vendas, preço/m² por bairro, posicionamento de incorporadoras."
          highlights={[
            `${LANCAMENTOS.length} empreendimentos monitorados`,
            `Preço/m² médio: R$ ${fmtNum(MERCADO_CURITIBA.precoM2Medio)}`,
            `VSO médio: ${vsoMedio.toFixed(1)}%`,
          ]}
          badge="COMPETITIVO"
          badgeVariant="secondary"
        />
        <ModuleCard
          href="/mercado/indicadores"
          icon={IconChartBar}
          title="Indicadores Macro"
          description="Termômetro do crédito e construção — Selic, FipeZap, CUB, INCC, volume de financiamento e ranking de cidades."
          highlights={[
            `Selic: ${CREDITO_IMOBILIARIO.taxaSelic}% a.a.`,
            `Vol. financiado: R$ ${CREDITO_IMOBILIARIO.volumeFinanciado2025} bi`,
            `Ticket médio CWB: R$ ${fmtNum(MERCADO_CURITIBA.ticketMedio)}`,
          ]}
          badge="MACRO"
          badgeVariant="outline"
        />
        <ModuleCard
          href="/mercado/censo"
          icon={IconUsers}
          title="Demografia PR"
          description="Base demográfica e habitacional do Paraná via IBGE — população, urbanização, déficit, mesorregiões."
          highlights={[
            `${fmtNum(CENSO_PR_RESUMO.populacao)} habitantes`,
            `${CENSO_PR_RESUMO.urbanizacao}% urbanização`,
            `${CENSO_PR_RESUMO.totalMunicipios} municípios`,
          ]}
          badge="IBGE"
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
        Fontes: Órulo API + CSVs · IBGE Censo 2022 · FipeZap · CBIC · SINDUSCON-PR · IPARDES
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
