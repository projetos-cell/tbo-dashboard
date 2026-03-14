"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconUsers,
  IconTrendingUp,
  IconBuildingCommunity,
  IconMap2,
  IconHomeOff,
  IconHome,
  IconKey,
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
} from "@tabler/icons-react";
import {
  CENSO_PR_RESUMO,
  CIDADES_PR,
  POPULACAO_HISTORICA_PR,
  MESORREGIOES_PR,
  HABITACAO_PR,
} from "@/features/mercado/utils/censo-pr-data";
import type { CidadePR } from "@/features/mercado/utils/censo-pr-data";
import { fmtNum, fmtPct } from "@/features/mercado/components/mercado-utils";
import { KPIBig } from "@/features/mercado/components/mercado-page-components";
import { ReportHeader } from "@/features/mercado/components/report-header";
import { TopCitiesBarChart, HistoricalEvolutionChart } from "@/features/mercado/components/censo-pr-charts";
import { MapaPR } from "@/features/mercado/components/mapa-pr";

/* ── Sort helpers ────────────────────────────────────── */

type SortKey = "cidade" | "populacao" | "variacao" | "area" | "densidade";
type SortDir = "asc" | "desc";

function sortCidades(data: CidadePR[], key: SortKey, dir: SortDir): CidadePR[] {
  return [...data].sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (typeof va === "string" && typeof vb === "string") {
      return dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return dir === "asc"
      ? (va as number) - (vb as number)
      : (vb as number) - (va as number);
  });
}

/* ── Page ────────────────────────────────────────────── */

export default function CensoPRPage() {
  const [sortKey, setSortKey] = useState<SortKey>("populacao");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(
    () => sortCidades(CIDADES_PR, sortKey, sortDir),
    [sortKey, sortDir],
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <IconArrowsSort className="ml-1 inline h-3 w-3 opacity-40" />;
    return sortDir === "asc"
      ? <IconArrowUp className="ml-1 inline h-3 w-3" />
      : <IconArrowDown className="ml-1 inline h-3 w-3" />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <ReportHeader
        title="Censo IBGE 2022 — Paraná"
        subtitle="Dados demográficos e habitacionais"
        sources={[
          { label: "IBGE Censo", date: "Dez 2022" },
          { label: "IPARDES", date: "2023" },
          { label: "FJP Déficit", date: "2022" },
        ]}
      />

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="Populacao"
              value={fmtNum(CENSO_PR_RESUMO.populacao)}
              sub={`${fmtNum(CENSO_PR_RESUMO.totalMunicipios)} municipios`}
              icon={IconUsers}
            />
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="Crescimento 2010-2022"
              value={fmtPct(CENSO_PR_RESUMO.crescimento)}
              sub={`De ${fmtNum(CENSO_PR_RESUMO.populacao2010)} para ${fmtNum(CENSO_PR_RESUMO.populacao)}`}
              icon={IconTrendingUp}
            />
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="Urbanizacao"
              value={fmtPct(CENSO_PR_RESUMO.urbanizacao)}
              sub={`Densidade: ${CENSO_PR_RESUMO.densidade} hab/km²`}
              icon={IconBuildingCommunity}
            />
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="Municipios"
              value={fmtNum(CENSO_PR_RESUMO.totalMunicipios)}
              sub={`Area: ${fmtNum(Math.round(CENSO_PR_RESUMO.areaTerritorial))} km²`}
              icon={IconMap2}
            />
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="Deficit habitacional"
              value={fmtNum(HABITACAO_PR.deficitHabitacional)}
              sub="Estimativa IPARDES"
              icon={IconHomeOff}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopCitiesBarChart data={sorted} />
        <HistoricalEvolutionChart data={POPULACAO_HISTORICA_PR} />
      </div>

      {/* Mesorregiões */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Mesorregioes do Parana</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {MESORREGIOES_PR.map((m) => (
            <Card key={m.nome} className="py-4">
              <CardContent className="space-y-1.5">
                <p className="text-sm font-semibold leading-tight">{m.nome}</p>
                <p className="text-xl font-bold">{fmtNum(m.populacao)}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {m.municipios} municipios
                  </Badge>
                  <span className="text-xs text-gray-500">{m.cidadePrincipal}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mapa Coroplético */}
      <MapaPR
        data={MESORREGIOES_PR.map((m) => ({
          nome: m.nome,
          populacao: m.populacao,
          valor: m.populacao,
        }))}
        metricLabel="Populacao"
      />

      {/* Cities Table */}
      <Card className="py-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Cidades com 90 mil+ habitantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("cidade")}>
                    Cidade <SortIcon col="cidade" />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("populacao")}>
                    Populacao <SortIcon col="populacao" />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("variacao")}>
                    Variacao % <SortIcon col="variacao" />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("area")}>
                    Area (km²) <SortIcon col="area" />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort("densidade")}>
                    Densidade <SortIcon col="densidade" />
                  </TableHead>
                  <TableHead>Regiao</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((c) => (
                  <TableRow key={c.cidade}>
                    <TableCell className="font-medium">{c.cidade}</TableCell>
                    <TableCell className="text-right">{fmtNum(c.populacao)}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={c.variacao >= 20 ? "border-emerald-300 bg-emerald-50 text-emerald-800" : ""}
                      >
                        {c.variacao > 0 ? "+" : ""}{fmtPct(c.variacao)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{fmtNum(Math.round(c.area))}</TableCell>
                    <TableCell className="text-right">{fmtNum(Math.round(c.densidade))}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">{c.regiao}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Housing Section */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Habitacao</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="py-4">
            <CardContent className="flex items-start gap-3">
              <div className="rounded-lg bg-emerald-100 p-2.5">
                <IconHome className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Domicilios proprios</p>
                <p className="text-2xl font-bold">{fmtPct(HABITACAO_PR.domiciliosProprios)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 p-2.5">
                <IconKey className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Domicilios alugados</p>
                <p className="text-2xl font-bold">{fmtPct(HABITACAO_PR.domiciliosAlugados)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-100 p-2.5">
                <IconHomeOff className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Deficit habitacional</p>
                <p className="text-2xl font-bold">{fmtNum(HABITACAO_PR.deficitHabitacional)}</p>
                <p className="text-xs text-gray-500">
                  Cedidos: {fmtPct(HABITACAO_PR.domiciliosCedidos)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-500">
        Fonte: IBGE — Censo Demografico 2022 | IPARDES
      </p>
    </div>
  );
}
