"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CashFlowDay } from "@/services/financial";

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function colorClass(value: number): string {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "text-muted-foreground";
}

interface CashFlowTableProps {
  days: CashFlowDay[];
}

export function CashFlowTable({ days }: CashFlowTableProps) {
  if (!days.length) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Sem dados de fluxo de caixa.
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Entradas</TableHead>
            <TableHead className="text-right">Saídas</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {days.map((d) => (
            <TableRow key={d.date}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(d.date + "T12:00:00"), "dd MMM (EEE)", {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell className={`text-right ${colorClass(d.inflows)}`}>
                {d.inflows > 0 ? fmt(d.inflows) : "—"}
              </TableCell>
              <TableCell className={`text-right ${colorClass(-d.outflows)}`}>
                {d.outflows > 0 ? fmt(d.outflows) : "—"}
              </TableCell>
              <TableCell className={`text-right font-medium ${colorClass(d.balance)}`}>
                {fmt(d.balance)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
