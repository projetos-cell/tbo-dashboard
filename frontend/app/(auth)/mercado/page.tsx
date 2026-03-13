"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconUsers,
  IconHome,
  IconTrendingUp,
  IconMapPin,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CENSO_RESUMO,
  POPULACAO_ABSOLUTA,
  DENSIDADE_POPULACIONAL,
  VARIACAO_POPULACIONAL,
  ACRESCIMO_DOMICILIOS,
  BAIRROS_VARIACAO,
  REGIONAIS,
} from "@/features/mercado/utils/censo-curitiba-data";
import {
  KPIBig,
  HorizontalBarCard,
  HistoricalLineCard,
  OccupancyDonut,
  EstabelecimentosGrid,
  BairrosMapGrid,
  fmtNum,
  fmtPct,
} from "@/features/mercado/components/mercado-page-components";

type MapMetric = "variacao" | "populacao";

export default function MercadoPage() {
  const [regionalFilter, setRegionalFilter] = useState("Todos");
  const [bairroSearch, setBairroSearch] = useState("");
  const [mapMetric, setMapMetric] = useState<MapMetric>("variacao");

  const filteredBairros = useMemo(() => {
    let entries = Object.entries(BAIRROS_VARIACAO);

    if (regionalFilter !== "Todos") {
      entries = entries.filter(([, d]) => d.regional === regionalFilter);
    }

    if (bairroSearch.trim()) {
      const q = bairroSearch.toLowerCase();
      entries = entries.filter(([nome]) => nome.toLowerCase().includes(q));
    }

    entries.sort((a, b) => {
      if (mapMetric === "populacao") return b[1].populacao - a[1].populacao;
      return b[1].variacao - a[1].variacao;
    });

    return entries;
  }, [regionalFilter, bairroSearch, mapMetric]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Censo 2022 — Curitiba
        </h1>
        <p className="text-gray-500">
          Populacao e domicilios — Primeiros resultados do Censo 2022.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={regionalFilter} onValueChange={setRegionalFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Regional" />
          </SelectTrigger>
          <SelectContent>
            {REGIONAIS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          type="text"
          placeholder="Buscar bairro..."
          value={bairroSearch}
          onChange={(e) => setBairroSearch(e.target.value)}
          className="h-9 rounded-md border bg-white px-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-tbo-orange"
        />
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="Populacao total"
              value={fmtNum(CENSO_RESUMO.populacao)}
              sub={`Densidade media: ${CENSO_RESUMO.densidadeMedia} hab/ha`}
              icon={IconUsers}
            />
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="Domicilios particulares"
              value={fmtNum(CENSO_RESUMO.domiciliosParticulares)}
              sub={`Coletivos: ${fmtNum(CENSO_RESUMO.domiciliosColetivos)}`}
              icon={IconHome}
            />
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent>
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500">Tipo de domicilio</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold">{CENSO_RESUMO.pctCasas}%</span>
                <span className="text-gray-500">Casas</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold">{CENSO_RESUMO.pctApartamentos}%</span>
                <span className="text-gray-500">Aptos</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold">{CENSO_RESUMO.pctOutros}%</span>
                <span className="text-gray-500">Outros</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="Acrescimo de domicilios"
              value="+25%"
              sub="Em relacao ao Censo 2010"
              icon={IconTrendingUp}
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <HorizontalBarCard
            title="Populacao absoluta (top bairros)"
            data={POPULACAO_ABSOLUTA}
            valueLabel="Habitantes"
          />
          <HorizontalBarCard
            title="Densidade populacional (hab/ha)"
            data={DENSIDADE_POPULACIONAL}
            valueLabel="hab/ha"
          />
          <HorizontalBarCard
            title="Variacao populacional 2010-2022 (%)"
            data={VARIACAO_POPULACIONAL}
            valueLabel="%"
            formatValue={fmtPct}
          />
        </div>

        <div className="space-y-4">
          <OccupancyDonut />
          <EstabelecimentosGrid />
          <HorizontalBarCard
            title="Acrescimo de domicilios 2010-2022 (%)"
            data={ACRESCIMO_DOMICILIOS}
            valueLabel="%"
            formatValue={fmtPct}
          />
        </div>
      </div>

      {/* Historical Line Chart */}
      <HistoricalLineCard />

      {/* Bairros Map Grid */}
      <Card className="py-4">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IconMapPin className="h-4 w-4" />
              Bairros — Variacao populacional 2010-2022
            </CardTitle>
            <div className="flex gap-1">
              {(
                [
                  ["variacao", "Variacao %"],
                  ["populacao", "Populacao"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setMapMetric(key)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    mapMetric === key
                      ? "bg-tbo-orange text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-100/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded border border-red-200 bg-red-100 px-2 py-0.5">Negativo</span>
            <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5">0-10%</span>
            <span className="rounded border border-blue-300 bg-blue-100 px-2 py-0.5">10-20%</span>
            <span className="rounded border border-emerald-300 bg-emerald-100 px-2 py-0.5">20-30%</span>
            <span className="rounded border border-amber-300 bg-amber-100 px-2 py-0.5">30-50%</span>
            <span className="rounded border border-orange-400 bg-orange-200 px-2 py-0.5">50%+</span>
          </div>
          <BairrosMapGrid bairros={filteredBairros} />
        </CardContent>
      </Card>

      <p className="text-center text-xs text-gray-500">
        Fonte: CNEFE e IBGE — Censo 2022: Agregados por Setores Censitarios |
        Desenvolvido por IPPUC — Coordenacao de Monitoramento e Pesquisa
      </p>
    </div>
  );
}
