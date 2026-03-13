"use client";

import { useMemo, useState } from "react";
import {
  IconChartBar,
  IconTrendingUp,
  IconUsers,
  IconAward,
  IconPackage,
  IconBulb,
} from "@tabler/icons-react";
import { useDeals, usePipelines } from "@/features/comercial/hooks/use-commercial";
import {
  computeCommercialKPIs,
  computeMonthlyRevenue,
  computeTopClients,
  computeTopOwners,
  computeStageDistribution,
  computePipelineByOwner,
  computeProductMix,
  computeBUDistribution,
  computeAvgPriceByBU,
  computeStrategicInsights,
  type ProductData,
  type BUDistribution,
  type BUAvgPrice,
} from "@/features/comercial/services/commercial-analytics";
import { RequireRole } from "@/features/auth/components/require-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  KpiRow,
  MonthlyRevenueChart,
  StageDonut,
  TopClientsChart,
  TopOwnersChart,
  ClientRankingTable,
  OwnersTable,
  PipelineByOwnerChart,
  BUDonutChart,
  TopProductsChart,
  AvgPriceByBUChart,
  ProductRankingTable,
  InsightsSection,
  DashboardSkeleton,
} from "@/features/comercial/components/comercial-relatorios-components";

// ── Product Mix Section ────────────────────────────────────────────────────────

interface ProductMixSectionProps {
  products: ProductData[];
  buDist: BUDistribution[];
  buAvgPrice: BUAvgPrice[];
}

function ProductMixSection({ products, buDist, buAvgPrice }: ProductMixSectionProps) {
  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Mix de Produtos &amp; Serviços
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Faturamento por Unidade de Negócio
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Participação no revenue total
            </p>
          </CardHeader>
          <CardContent>
            <BUDonutChart data={buDist} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Top 10 Produtos Mais Vendidos
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Por valor total (R$)
            </p>
          </CardHeader>
          <CardContent>
            <TopProductsChart data={products} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Preço Médio por Unidade
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Ticket unitário médio (R$)
            </p>
          </CardHeader>
          <CardContent>
            <AvgPriceByBUChart data={buAvgPrice} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <IconPackage className="h-4 w-4 text-muted-foreground" />
            Tabela de Produtos — Top 15 por Receita
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Desempenho completo · inclui preço médio unitário por produto
          </p>
        </CardHeader>
        <CardContent>
          <ProductRankingTable data={products} />
        </CardContent>
      </Card>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ComercialRelatorios() {
  const [pipelineFilter, setPipelineFilter] = useState("all");
  const { data: pipelines = [] } = usePipelines();

  const { data: deals = [], isLoading } = useDeals({
    pipeline: pipelineFilter !== "all" ? pipelineFilter : undefined,
  });

  const kpis = useMemo(() => computeCommercialKPIs(deals), [deals]);
  const monthly = useMemo(() => computeMonthlyRevenue(deals), [deals]);
  const clients = useMemo(() => computeTopClients(deals), [deals]);
  const owners = useMemo(() => computeTopOwners(deals), [deals]);
  const stages = useMemo(() => computeStageDistribution(deals), [deals]);
  const pipelineByOwner = useMemo(() => computePipelineByOwner(deals), [deals]);
  const products = useMemo(() => computeProductMix(deals), [deals]);
  const buDist = useMemo(() => computeBUDistribution(deals), [deals]);
  const buAvgPrice = useMemo(() => computeAvgPriceByBU(deals), [deals]);
  const insights = useMemo(
    () => computeStrategicInsights(deals, kpis, clients, products, buDist),
    [deals, kpis, clients, products, buDist],
  );

  return (
    <RequireRole module="comercial">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dashboard Comercial
            </h1>
            <p className="text-sm text-muted-foreground">
              Metricas de performance, faturamento e funil de vendas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {pipelines.length > 0 && (
              <Select value={pipelineFilter} onValueChange={setPipelineFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todos os funis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os funis</SelectItem>
                  {pipelines.map((p) => (
                    <SelectItem key={p.pipeline_name} value={p.pipeline_name}>
                      {p.pipeline_name} ({p.deal_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <KpiRow kpis={kpis} />

            {/* Faturamento Mensal + Distribuição por Etapa */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IconChartBar className="h-4 w-4 text-muted-foreground" />
                    Faturamento Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MonthlyRevenueChart data={monthly} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
                    Distribuicao por Etapa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StageDonut data={stages} />
                </CardContent>
              </Card>
            </div>

            {/* Top Clientes + Top Vendedores */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IconUsers className="h-4 w-4 text-muted-foreground" />
                    Top Clientes — Faturamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TopClientsChart data={clients} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IconAward className="h-4 w-4 text-muted-foreground" />
                    Performance por Vendedor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TopOwnersChart data={owners} />
                </CardContent>
              </Card>
            </div>

            {/* Pipeline por Vendedor */}
            {pipelineByOwner.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IconChartBar className="h-4 w-4 text-muted-foreground" />
                    Pipeline por Vendedor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PipelineByOwnerChart data={pipelineByOwner} />
                </CardContent>
              </Card>
            )}

            {/* Ranking de Clientes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconUsers className="h-4 w-4 text-muted-foreground" />
                  Ranking de Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClientRankingTable data={clients} />
              </CardContent>
            </Card>

            {/* Detalhamento por Vendedor */}
            {owners.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IconAward className="h-4 w-4 text-muted-foreground" />
                    Detalhamento por Vendedor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OwnersTable data={owners} />
                </CardContent>
              </Card>
            )}

            {/* Mix de Produtos */}
            {products.length > 0 && (
              <ProductMixSection
                products={products}
                buDist={buDist}
                buAvgPrice={buAvgPrice}
              />
            )}

            {/* Insights & Recomendações */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Insights &amp; Recomendações Estratégicas
              </p>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <IconBulb className="h-4 w-4 text-muted-foreground" />
                  Análise Automática
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Recomendações geradas a partir dos dados do pipeline
                </p>
              </CardHeader>
              <CardContent>
                <InsightsSection insights={insights} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </RequireRole>
  );
}
