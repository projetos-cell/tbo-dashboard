"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PAYABLE_STATUS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type PayableRow = Database["public"]["Tables"]["fin_payables"]["Row"];

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface PayablesTableProps {
  payables: PayableRow[];
  onSelect: (p: PayableRow) => void;
}

export function PayablesTable({ payables, onSelect }: PayablesTableProps) {
  if (!payables.length) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhuma conta a pagar encontrada.
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payables.map((p) => {
            const st =
              PAYABLE_STATUS[p.status as keyof typeof PAYABLE_STATUS];
            return (
              <TableRow
                key={p.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelect(p)}
              >
                <TableCell className="font-medium max-w-[250px] truncate">
                  {p.description}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {fmt(p.amount)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(p.due_date + "T12:00:00"), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  {st ? (
                    <Badge
                      variant="secondary"
                      style={{ backgroundColor: st.bg, color: st.color }}
                    >
                      {st.label}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{p.status}</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
