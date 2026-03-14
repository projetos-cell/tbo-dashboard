"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ── Types ───────────────────────────────────────────── */

interface MapaPRProps {
  data: Array<{
    nome: string;
    populacao: number;
    valor: number;
  }>;
  metricLabel: string;
  formatValue?: (v: number) => string;
}

interface RegionPath {
  id: string;
  nome: string;
  d: string;
  labelX: number;
  labelY: number;
}

/* ── Color scale (5-step blue) ───────────────────────── */

const COLOR_SCALE = [
  "#DBEAFE", // blue-100
  "#93C5FD", // blue-300
  "#3B82F6", // blue-500
  "#1D4ED8", // blue-700
  "#1E3A8A", // blue-900
] as const;

function getColor(value: number, min: number, max: number): string {
  if (max === min) return COLOR_SCALE[2];
  const ratio = (value - min) / (max - min);
  const idx = Math.min(Math.floor(ratio * 5), 4);
  return COLOR_SCALE[idx];
}

/* ── Simplified SVG paths for Paraná mesoregiões ────── */
/* viewBox: 0 0 600 400                                  */
/* Approximate geographic placement, not precision GIS   */

const REGIONS: RegionPath[] = [
  {
    id: "noroeste",
    nome: "Noroeste",
    d: "M30,30 L150,25 L160,80 L140,120 L30,125 Z",
    labelX: 85,
    labelY: 75,
  },
  {
    id: "norte-central",
    nome: "Norte Central",
    d: "M150,25 L310,20 L320,75 L300,120 L160,80 Z",
    labelX: 230,
    labelY: 65,
  },
  {
    id: "norte-pioneiro",
    nome: "Norte Pioneiro",
    d: "M310,20 L440,15 L460,70 L430,120 L320,75 Z",
    labelX: 380,
    labelY: 65,
  },
  {
    id: "centro-ocidental",
    nome: "Centro-Ocidental",
    d: "M30,125 L140,120 L160,80 L300,120 L280,190 L130,195 L30,190 Z",
    labelX: 155,
    labelY: 155,
  },
  {
    id: "centro-oriental",
    nome: "Centro-Oriental",
    d: "M300,120 L320,75 L430,120 L460,70 L530,90 L520,180 L440,200 L280,190 Z",
    labelX: 400,
    labelY: 150,
  },
  {
    id: "oeste",
    nome: "Oeste",
    d: "M10,190 L30,190 L130,195 L140,260 L100,310 L10,310 Z",
    labelX: 70,
    labelY: 250,
  },
  {
    id: "centro-sul",
    nome: "Centro-Sul",
    d: "M130,195 L280,190 L300,270 L260,320 L140,310 L140,260 Z",
    labelX: 210,
    labelY: 255,
  },
  {
    id: "metropolitana",
    nome: "Metropolitana de Curitiba",
    d: "M440,200 L520,180 L580,200 L580,300 L510,320 L440,300 Z",
    labelX: 510,
    labelY: 255,
  },
  {
    id: "sudoeste",
    nome: "Sudoeste",
    d: "M10,310 L100,310 L140,310 L140,380 L10,385 Z",
    labelX: 75,
    labelY: 348,
  },
  {
    id: "sudeste",
    nome: "Sudeste",
    d: "M140,310 L260,320 L300,270 L440,300 L510,320 L500,385 L140,380 Z",
    labelX: 320,
    labelY: 350,
  },
];

/* ── Default formatter ───────────────────────────────── */

const defaultFormat = (v: number): string =>
  v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
      ? `${(v / 1_000).toFixed(0)}k`
      : v.toLocaleString("pt-BR");

/* ── Component ───────────────────────────────────────── */

export function MapaPR({ data, metricLabel, formatValue }: MapaPRProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const fmt = formatValue ?? defaultFormat;

  const dataMap = useMemo(() => {
    const map = new Map<string, { populacao: number; valor: number }>();
    for (const d of data) {
      map.set(d.nome, { populacao: d.populacao, valor: d.valor });
    }
    return map;
  }, [data]);

  const { min, max } = useMemo(() => {
    const values = data.map((d) => d.valor);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [data]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGElement>) => {
      const rect = e.currentTarget.closest("svg")?.getBoundingClientRect();
      if (rect) {
        setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    },
    [],
  );

  const hoveredData = hovered ? dataMap.get(hovered) : null;

  /* Legend steps */
  const legendSteps = useMemo(() => {
    const step = (max - min) / 5;
    return COLOR_SCALE.map((color, i) => ({
      color,
      label: fmt(min + step * i),
    }));
  }, [min, max, fmt]);

  return (
    <Card className="py-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Mapa — {metricLabel} por Mesorregiao
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg
            viewBox="0 0 600 410"
            className="h-auto w-full"
            role="img"
            aria-label={`Mapa do Paraná por ${metricLabel}`}
          >
            {REGIONS.map((region) => {
              const entry = dataMap.get(region.nome);
              const valor = entry?.valor ?? 0;
              const fill = getColor(valor, min, max);
              const isHovered = hovered === region.nome;

              return (
                <g key={region.id}>
                  <path
                    d={region.d}
                    fill={fill}
                    stroke="white"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="cursor-pointer transition-all duration-150"
                    style={{
                      filter: isHovered
                        ? "brightness(0.85) drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                        : "none",
                    }}
                    onMouseEnter={() => setHovered(region.nome)}
                    onMouseLeave={() => setHovered(null)}
                    onMouseMove={handleMouseMove}
                  />
                  <text
                    x={region.labelX}
                    y={region.labelY}
                    textAnchor="middle"
                    className="pointer-events-none select-none fill-current text-[9px] font-medium"
                    style={{
                      fill: valor > (min + max) / 2 ? "#fff" : "#1e293b",
                    }}
                  >
                    {region.nome.length > 14
                      ? `${region.nome.slice(0, 12)}...`
                      : region.nome}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hovered && hoveredData && (
            <div
              className="pointer-events-none absolute z-50 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg"
              style={{
                left: Math.min(mouse.x + 12, 400),
                top: mouse.y - 60,
              }}
            >
              <p className="text-sm font-semibold text-gray-900">{hovered}</p>
              <p className="text-xs text-gray-600">
                {metricLabel}: <span className="font-medium">{fmt(hoveredData.valor)}</span>
              </p>
              <p className="text-xs text-gray-500">
                Pop: {defaultFormat(hoveredData.populacao)}
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-1.5">
          <span className="mr-1 text-[10px] text-gray-500">Menor</span>
          {legendSteps.map((step) => (
            <div key={step.color} className="flex flex-col items-center gap-0.5">
              <div
                className="h-3 w-8 rounded-sm"
                style={{ backgroundColor: step.color }}
              />
              <span className="text-[9px] text-gray-500">{step.label}</span>
            </div>
          ))}
          <span className="ml-1 text-[10px] text-gray-500">Maior</span>
        </div>
      </CardContent>
    </Card>
  );
}
