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
import { RECEIVABLE_STATUS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type ReceivableRow = Database["public"]["Tables"]["fin_receivables"]["Row"];

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface ReceivablesTableProps {
  receivables: ReceivableRow[];
  onSelect: (r: ReceivableRow) => void;
}

export function ReceivablesTable({
  receivables,
  onSelect,
}: ReceivablesTableProps) {
  if (!receivables.length) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhuma conta a receber encontrada.
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
          {receivables.map((r) => {
            const st =
              RECEIVABLE_STATUS[r.status as keyof typeof RECEIVABLE_STATUS];
            return (
              <TableRow
                key={r.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelect(r)}
              >
                <TableCell className="font-medium max-w-[250px] truncate">
                  {r.description}
                  {r.installment_number && r.installment_total
                    ? ` (${r.installment_number}/${r.installment_total})`
                    : ""}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {fmt(r.amount)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(r.due_date + "T12:00:00"), "dd MMM yyyy", {
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
                    <Badge variant="secondary">{r.status}</Badge>
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
