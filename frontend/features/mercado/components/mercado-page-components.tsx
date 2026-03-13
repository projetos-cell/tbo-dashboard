"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  IconBuilding,
  IconHelmet,
  IconHeartbeat,
  IconSchool,
  IconBuildingChurch,
} from "@tabler/icons-react";
import {
  CENSO_RESUMO,
  POPULACAO_HISTORICA,
  ESTABELECIMENTOS,
  BAIRROS_VARIACAO,
} from "@/features/mercado/utils/censo-curitiba-data";

/* ── Helpers ─────────────────────────────────────────── */

export function fmtNum(n: number) {
  return n.toLocaleString("pt-BR");
}

export function fmtPct(n: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
}

export const BAR_COLORS = [
  "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe",
];

const PIE_COLORS = ["#2563eb", "#e5e7eb"];

const ICON_MAP: Record<string, React.ElementType> = {
  "graduation-cap": IconSchool,
  "heart-pulse": IconHeartbeat,
  church: IconBuildingChurch,
  "building-2": IconBuilding,
  "hard-hat": IconHelmet,
};

export function variationColor(v: number): string {
  if (v < 0) return "bg-red-100 text-red-800 border-red-200";
  if (v < 10) return "bg-blue-50 text-blue-800 border-blue-200";
  if (v < 20) return "bg-blue-100 text-blue-900 border-blue-300";
  if (v < 30) return "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (v < 50) return "bg-amber-100 text-amber-800 border-amber-300";
  return "bg-orange-200 text-orange-900 border-orange-400";
}

/* ── KPIBig ──────────────────────────────────────────── */

export function KPIBig({
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

/* ── HorizontalBarCard ───────────────────────────────── */

export function HorizontalBarCard({
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

/* ── HistoricalLineCard ──────────────────────────────── */

export function HistoricalLineCard() {
  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Evolucao historica (1980-2022)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={POPULACAO_HISTORICA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
              tickFormatter={(v: number) => (v / 1_000).toFixed(0) + "k"}
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

/* ── OccupancyDonut ──────────────────────────────────── */

export function OccupancyDonut() {
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

/* ── EstabelecimentosGrid ────────────────────────────── */

export function EstabelecimentosGrid() {
  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Estabelecimentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ESTABELECIMENTOS.map((e) => {
            const Icon = ICON_MAP[e.icone] ?? IconBuilding;
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

/* ── BairrosMapGrid ──────────────────────────────────── */

type BairroEntry = [string, (typeof BAIRROS_VARIACAO)[string]];

export function BairrosMapGrid({ bairros }: { bairros: BairroEntry[] }) {
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
