"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  IconPercentage,
  IconBuildingSkyscraper,
  IconCurrencyReal,
  IconHomeDollar,
  IconCrane,
  IconBuildingStore,
  IconClockHour4,
  IconMapPin,
} from "@tabler/icons-react";
import {
  CREDITO_IMOBILIARIO,
  MERCADO_CURITIBA,
  RANKING_MERCADO_PR,
} from "@/features/mercado/utils/indicadores-data";
import { fmtNum, fmtPct } from "@/features/mercado/components/mercado-utils";
import { KPIBig } from "@/features/mercado/components/mercado-page-components";
import {
  FipeZapChart,
  CustosConstrucaoChart,
} from "@/features/mercado/components/indicadores-charts";

/* ── Page ───────────────────────────────────────────── */

export default function IndicadoresPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Indicadores de Mercado
        </h1>
        <p className="text-gray-500">
          Dados macro do mercado imobiliario — Parana e Brasil
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="Taxa Selic"
              value={fmtPct(CREDITO_IMOBILIARIO.taxaSelic)}
              sub="Meta vigente"
              icon={IconPercentage}
            />
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="Taxa media financiamento"
              value={fmtPct(CREDITO_IMOBILIARIO.taxaMediaFinanciamento)}
              sub="% a.a. — media mercado"
              icon={IconHomeDollar}
            />
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="VGV Curitiba"
              value={`R$ ${MERCADO_CURITIBA.vgvAnual} bi`}
              sub="Ano corrente"
              icon={IconBuildingSkyscraper}
            />
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="Ticket medio"
              value={`R$ ${fmtNum(MERCADO_CURITIBA.ticketMedio)}`}
              sub="Lancamentos Curitiba"
              icon={IconCurrencyReal}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts: Precos */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Precos</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <FipeZapChart />
          <CustosConstrucaoChart />
        </div>
      </div>

      {/* Mercado Curitiba */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Mercado Curitiba</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MiniCard
            icon={IconCrane}
            label="Lancamentos no ano"
            value={String(MERCADO_CURITIBA.lancamentosAnual)}
          />
          <MiniCard
            icon={IconBuildingStore}
            label="Unidades lancadas"
            value={fmtNum(MERCADO_CURITIBA.unidadesLancadas)}
          />
          <MiniCard
            icon={IconPercentage}
            label="VSO medio"
            value={fmtPct(MERCADO_CURITIBA.vsoMedio)}
          />
          <MiniCard
            icon={IconBuildingSkyscraper}
            label="Estoque"
            value={`${fmtNum(MERCADO_CURITIBA.estoqueUnidades)} un.`}
          />
          <Card className="py-4">
            <CardContent className="flex items-start gap-3">
              <div className="rounded-lg bg-tbo-orange/10 p-2.5">
                <IconMapPin className="h-5 w-5 text-tbo-orange" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Bairro mais valorizado</p>
                <p className="text-lg font-bold">{MERCADO_CURITIBA.bairroMaisValorizado}</p>
                <p className="text-xs text-gray-500">
                  R$ {fmtNum(MERCADO_CURITIBA.precoM2Batel)}/m2
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ranking PR */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Ranking Parana</h2>
        <Card className="py-4">
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead className="text-right">VGV (R$ mi)</TableHead>
                  <TableHead className="text-right">Lancamentos</TableHead>
                  <TableHead className="text-right">Preco/m2 medio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RANKING_MERCADO_PR.map((c, i) => (
                  <TableRow key={c.cidade}>
                    <TableCell className="font-medium text-gray-400">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {c.cidade}
                      {i === 0 && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          Capital
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {fmtNum(c.vgvAnual)}
                    </TableCell>
                    <TableCell className="text-right">{c.lancamentos}</TableCell>
                    <TableCell className="text-right">
                      R$ {fmtNum(c.precoM2Medio)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Credito Imobiliario */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Credito Imobiliario</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <MiniCard
            icon={IconCurrencyReal}
            label="Volume financiado (SBPE)"
            value={`R$ ${CREDITO_IMOBILIARIO.volumeFinanciado2024} bi`}
          />
          <MiniCard
            icon={IconBuildingStore}
            label="Unidades financiadas"
            value={fmtNum(CREDITO_IMOBILIARIO.unidadesFinanciadas2024)}
          />
          <MiniCard
            icon={IconClockHour4}
            label="Prazo medio"
            value={`${CREDITO_IMOBILIARIO.prazoMedio} meses`}
          />
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-500">
        Fontes: FipeZap, SINDUSCON-PR, CBIC, Banco Central
      </p>
    </div>
  );
}

/* ── MiniCard (local helper) ───────────────────────── */

function MiniCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card className="py-4">
      <CardContent className="flex items-start gap-3">
        <div className="rounded-lg bg-tbo-orange/10 p-2.5">
          <Icon className="h-5 w-5 text-tbo-orange" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
