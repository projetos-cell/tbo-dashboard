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
import type { ProjectMargin } from "@/services/founder-dashboard";

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

interface TopProjectsTableProps {
  data: ProjectMargin[];
  isLoading?: boolean;
}

export function TopProjectsTable({ data, isLoading }: TopProjectsTableProps) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Top Projetos por Margem</h2>
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
            <p className="font-medium">Top Projetos por Margem</p>
            <p className="text-xs text-muted-foreground">
              Considera somente transacoes com projeto definido (tag/campo).
            </p>
            <p className="text-xs text-muted-foreground">
              Se nao houver &quot;projeto&quot; no Omie, o estado vazio sera
              exibido.
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
        <p className="text-sm text-muted-foreground py-4 text-center">
          Nenhum projeto com transacoes no periodo.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projeto</TableHead>
              <TableHead className="text-right">Receita</TableHead>
              <TableHead className="text-right">Custos</TableHead>
              <TableHead className="text-right">Margem %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const isLowMargin = row.margemPct < 30;
              return (
                <TableRow
                  key={row.project}
                  className={isLowMargin ? "bg-red-500/5" : ""}
                >
                  <TableCell className="font-medium max-w-[180px] truncate">
                    {row.project}
                  </TableCell>
                  <TableCell className="text-right">
                    {fmt(row.receita)}
                  </TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">
                    {fmt(row.custos)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      isLowMargin
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {fmtPct(row.margemPct)}
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
