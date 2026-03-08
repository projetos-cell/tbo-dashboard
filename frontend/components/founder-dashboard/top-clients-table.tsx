"use client";

import { Info } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tbo-ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/tbo-ui/table";
import { Badge } from "@/components/tbo-ui/badge";
import { Skeleton } from "@/components/tbo-ui/skeleton";
import type { ClientRevenue } from "@/services/founder-dashboard";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ── Component ────────────────────────────────────────────────────────────────

interface TopClientsTableProps {
  data: ClientRevenue[];
  concentracaoTop3: number;
  isLoading?: boolean;
}

export function TopClientsTable({
  data,
  concentracaoTop3,
  isLoading,
}: TopClientsTableProps) {
  const concentracaoColor =
    concentracaoTop3 > 70
      ? "text-red-600 dark:text-red-400"
      : concentracaoTop3 > 50
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400";

  const concentracaoBadge =
    concentracaoTop3 > 70
      ? "destructive"
      : concentracaoTop3 > 50
        ? "secondary"
        : "outline";

  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Top Clientes por Receita</h2>
          {!isLoading && data.length > 0 && (
            <Badge variant={concentracaoBadge as "destructive" | "secondary" | "outline"}>
              Top3: {fmtPct(concentracaoTop3)}
            </Badge>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Informacoes do bloco"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 text-sm space-y-1" side="top">
            <p className="font-medium">Top Clientes por Receita</p>
            <p className="text-xs text-gray-500">
              Ajuda a identificar risco de concentracao de receita.
            </p>
            <p className="text-xs text-gray-500">
              Regra de alerta: Top1 &gt; 40% (atencao); Top3 &gt; 70% (risco).
            </p>
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          Nenhum dado disponivel no periodo.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Receita</TableHead>
              <TableHead className="text-right">% Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => {
              const isHighConcentration = row.pctTotal > 40;
              return (
                <TableRow
                  key={row.client}
                  className={isHighConcentration ? "bg-amber-500/5" : ""}
                >
                  <TableCell className="font-medium max-w-[180px] truncate">
                    <span className="text-xs font-mono text-gray-500 mr-2">
                      {i + 1}.
                    </span>
                    {row.client}
                  </TableCell>
                  <TableCell className="text-right">
                    {fmt(row.receita)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      isHighConcentration
                        ? "text-amber-600 dark:text-amber-400"
                        : ""
                    }`}
                  >
                    {fmtPct(row.pctTotal)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
