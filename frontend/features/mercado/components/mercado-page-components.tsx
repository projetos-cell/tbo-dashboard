"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconBuilding,
  IconHelmet,
  IconHeartbeat,
  IconSchool,
  IconBuildingChurch,
} from "@tabler/icons-react";
import {
  ESTABELECIMENTOS,
  BAIRROS_VARIACAO,
} from "@/features/mercado/utils/censo-curitiba-data";
import { fmtNum, variationColor } from "./mercado-utils";

// Re-exports for backward compatibility
export { fmtNum, fmtPct, BAR_COLORS, variationColor } from "./mercado-utils";
export {
  HorizontalBarCard,
  HistoricalLineCard,
  OccupancyDonut,
} from "./mercado-charts";

const ICON_MAP: Record<string, React.ElementType> = {
  "graduation-cap": IconSchool,
  "heart-pulse": IconHeartbeat,
  church: IconBuildingChurch,
  "building-2": IconBuilding,
  "hard-hat": IconHelmet,
};

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
          <p
            className="text-[11px] font-medium leading-tight truncate"
            title={nome}
          >
            {nome}
          </p>
          <p className="text-base font-bold">
            {d.variacao > 0 ? "+" : ""}
            {(d.variacao.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}%
          </p>
          <p className="text-[10px] opacity-70">{fmtNum(d.populacao)} hab</p>
        </div>
      ))}
    </div>
  );
}
