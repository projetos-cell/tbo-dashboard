"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FIPEZAP_CURITIBA,
  CUB_PARANA,
  INCC_MENSAL,
  mesLabel,
} from "@/features/mercado/utils/indicadores-data";
import { fmtNum } from "./mercado-utils";

/* ── FipeZap dual-axis chart ────────────────────────── */

const fipezapData = FIPEZAP_CURITIBA.map((d) => ({
  mes: mesLabel(d.mes),
  venda: d.precoM2Venda,
  locacao: d.precoM2Locacao,
}));

export function FipeZapChart() {
  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          FipeZap Curitiba — Preco/m2 (12 meses)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={fipezapData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="venda"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
            />
            <YAxis
              yAxisId="locacao"
              orientation="right"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `R$${v.toFixed(0)}`}
            />
            <Tooltip
              formatter={(value: number | undefined, name: string | undefined) => [
                name === "venda"
                  ? `R$ ${fmtNum(value ?? 0)}/m2`
                  : `R$ ${(value ?? 0).toFixed(2)}/m2`,
                name === "venda" ? "Venda" : "Locacao",
              ]}
            />
            <Legend formatter={(v: string) => (v === "venda" ? "Venda (R$/m2)" : "Locacao (R$/m2)")} />
            <Line
              yAxisId="venda"
              type="monotone"
              dataKey="venda"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              yAxisId="locacao"
              type="monotone"
              dataKey="locacao"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ── CUB + INCC chart ──────────────────────────────── */

const custoData = CUB_PARANA.map((cub, i) => ({
  mes: mesLabel(cub.mes),
  cub: cub.valor,
  incc: INCC_MENSAL[i]?.valor ?? 0,
}));

export function CustosConstrucaoChart() {
  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          CUB/m2 PR + INCC-DI (12 meses)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={custoData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="cub"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
            />
            <YAxis
              yAxisId="incc"
              orientation="right"
              tick={{ fontSize: 11 }}
              domain={["auto", "auto"]}
            />
            <Tooltip
              formatter={(value: number | undefined, name: string | undefined) => [
                name === "cub" ? `R$ ${fmtNum(value ?? 0)}/m2` : (value ?? 0).toFixed(1),
                name === "cub" ? "CUB/m2 PR" : "INCC-DI",
              ]}
            />
            <Legend formatter={(v: string) => (v === "cub" ? "CUB/m2 (R$)" : "INCC-DI (indice)")} />
            <Line
              yAxisId="cub"
              type="monotone"
              dataKey="cub"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              yAxisId="incc"
              type="monotone"
              dataKey="incc"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
