"use client";

import { Info } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { UnitRevenue } from "@/services/founder-dashboard";

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

interface UnitRevenueTableProps {
  data: UnitRevenue[];
  isLoading?: boolean;
}

export function UnitRevenueTable({ data, isLoading }: UnitRevenueTableProps) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Receita por Unidade (MTD)</h2>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Informacoes do bloco"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 text-sm space-y-1" side="top">
            <p className="font-medium">Receita por Unidade de Negocio</p>
            <p className="text-xs text-muted-foreground">
              Receita e custos agrupados por centro de custo/unidade.
            </p>
            <p className="text-xs text-muted-foreground">
              Se um projeto cruzar unidades, a regra e a do centro de custo da
              transacao no Omie.
            </p>
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Nenhum dado disponivel no periodo.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Receita</TableHead>
              <TableHead className="text-right">Margem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const margemPct =
                row.receita > 0
                  ? ((row.receita - row.margem) / row.receita) * 100
                  : 0;
              // margem field is actually the cost, so real margin = receita - margem value
              // Wait — looking at the service, `margem` IS the margin value (receita - custos)
              const realMargemPct =
                row.receita > 0 ? (row.margem / row.receita) * 100 : 0;

              return (
                <TableRow key={row.unit}>
                  <TableCell className="font-medium">{row.unit}</TableCell>
                  <TableCell className="text-right">{fmt(row.receita)}</TableCell>
                  <TableCell
                    className={`text-right ${
                      realMargemPct < 30
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {fmt(row.margem)} ({fmtPct(realMargemPct)})
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
