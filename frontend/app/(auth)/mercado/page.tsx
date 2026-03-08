"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/tbo-ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tbo-ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  Home,
  GraduationCap,
  HeartPulse,
  Church,
  Building2,
  HardHat,
  TrendingUp,
  MapPin,
  BarChart3,
} from "lucide-react";
import {
  CENSO_RESUMO,
  POPULACAO_ABSOLUTA,
  DENSIDADE_POPULACIONAL,
  VARIACAO_POPULACIONAL,
  ACRESCIMO_DOMICILIOS,
  POPULACAO_HISTORICA,
  ESTABELECIMENTOS,
  BAIRROS_VARIACAO,
  REGIONAIS,
} from "@/lib/censo-curitiba-data";

// ---------- helpers ----------

function fmtNum(n: number) {
  return n.toLocaleString("pt-BR");
}

function fmtPct(n: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
}

const ICON_MAP: Record<string, React.ElementType> = {
  "graduation-cap": GraduationCap,
  "heart-pulse": HeartPulse,
  church: Church,
  "building-2": Building2,
  "hard-hat": HardHat,
};

const BAR_COLORS = [
  "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe",
];

const PIE_COLORS = ["#2563eb", "#e5e7eb"];

// Variation color scale for the map-like grid
function variationColor(v: number): string {
  if (v < 0) return "bg-red-100 text-red-800 border-red-200";
  if (v < 10) return "bg-blue-50 text-blue-800 border-blue-200";
  if (v < 20) return "bg-blue-100 text-blue-900 border-blue-300";
  if (v < 30) return "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (v < 50) return "bg-amber-100 text-amber-800 border-amber-300";
  return "bg-orange-200 text-orange-900 border-orange-400";
}

// ---------- sub-components ----------

function KPIBig({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-tbo-orange/10 p-2.5">
        <Icon className="h-5 w-5 text-tbo-orange" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  );
}

function HorizontalBarCard({
  title,
  data,
  valueLabel,
  formatValue,
}: {
  title: string;
  data: { bairro: string; valor: number; destaque?: boolean }[];
  valueLabel: string;
  formatValue?: (v: number) => string;
}) {
  const fmt = formatValue ?? fmtNum;
  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={data.length * 38 + 10}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="bairro"
              width={110}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value?: number) => [fmt(value ?? 0), valueLabel]}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={entry.bairro}
                  fill={entry.destaque ? "#f59e0b" : BAR_COLORS[i % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function HistoricalLineCard({
  data,
}: {
  data: { ano: number; populacao: number; domicilios: number | null }[];
}) {
  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Evolucao historica (1980-2022)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="pop"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) =>
                v >= 1_000_000
                  ? (v / 1_000_000).toFixed(1) + "M"
                  : (v / 1_000).toFixed(0) + "k"
              }
            />
            <YAxis
              yAxisId="dom"
              orientation="right"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) =>
                (v / 1_000).toFixed(0) + "k"
              }
            />
            <Tooltip
              formatter={(value, name) => [
                typeof value === "number" ? fmtNum(value) : "—",
                name === "populacao" ? "Populacao" : "Domicilios",
              ]}
            />
            <Legend
              formatter={(value: string) =>
                value === "populacao" ? "Populacao" : "Domicilios"
              }
            />
            <Line
              yAxisId="pop"
              type="monotone"
              dataKey="populacao"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="dom"
              type="monotone"
              dataKey="domicilios"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function OccupancyDonut() {
  const data = [
    { name: "Ocupados", value: CENSO_RESUMO.pctOcupados },
    { name: "Nao ocupados", value: CENSO_RESUMO.pctNaoOcupados },
  ];

  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Condicao de ocupacao
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }: { name?: string; value?: number }) =>
                `${name ?? ""}: ${value ?? 0}%`
              }
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i]} />
              ))}
            </Pie>
            <Tooltip formatter={(v?: number) => fmtPct(v ?? 0)} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function EstabelecimentosGrid() {
  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Estabelecimentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ESTABELECIMENTOS.map((e) => {
            const Icon = ICON_MAP[e.icone] ?? Building2;
            return (
              <div
                key={e.tipo}
                className="flex flex-col items-center gap-1 rounded-lg border p-3 text-center"
              >
                <Icon className="h-5 w-5 text-gray-500" />
                <span className="text-lg font-bold">{fmtNum(e.valor)}</span>
                <span className="text-[11px] text-gray-500 leading-tight">
                  {e.tipo}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function BairrosMapGrid({
  bairros,
}: {
  bairros: [string, { variacao: number; populacao: number; regional: string }][];
}) {
  if (bairros.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Nenhum bairro encontrado para o filtro selecionado.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {bairros.map(([nome, d]) => (
        <div
          key={nome}
          className={`rounded-lg border p-2.5 text-center transition-colors ${variationColor(d.variacao)}`}
        >
          <p className="text-[11px] font-medium leading-tight truncate" title={nome}>
            {nome}
          </p>
          <p className="text-base font-bold">{d.variacao > 0 ? "+" : ""}{fmtPct(d.variacao)}</p>
          <p className="text-[10px] opacity-70">{fmtNum(d.populacao)} hab</p>
        </div>
      ))}
    </div>
  );
}

// ---------- page ----------

type MapMetric = "variacao" | "populacao" | "densidade";

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

    // Sort by chosen metric
    entries.sort((a, b) => {
      if (mapMetric === "variacao") return b[1].variacao - a[1].variacao;
      if (mapMetric === "populacao") return b[1].populacao - a[1].populacao;
      return b[1].variacao - a[1].variacao; // density would need data
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
              icon={Users}
            />
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent>
            <KPIBig
              label="Domicilios particulares"
              value={fmtNum(CENSO_RESUMO.domiciliosParticulares)}
              sub={`Coletivos: ${fmtNum(CENSO_RESUMO.domiciliosColetivos)}`}
              icon={Home}
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
              icon={TrendingUp}
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Left charts + Right charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
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

        {/* Right Column */}
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
      <HistoricalLineCard data={POPULACAO_HISTORICA} />

      {/* Bairros Map Grid */}
      <Card className="py-4">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
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
          {/* Legend */}
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

      {/* Footer */}
      <p className="text-center text-xs text-gray-500">
        Fonte: CNEFE e IBGE — Censo 2022: Agregados por Setores Censitarios |
        Desenvolvido por IPPUC — Coordenacao de Monitoramento e Pesquisa
      </p>
    </div>
  );
}
