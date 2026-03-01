"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { PAYABLE_STATUS } from "@/lib/constants";
import { useTablePreferences } from "@/hooks/use-table-preferences";
import type { ColumnDef } from "@/lib/column-types";
import type { Database } from "@/lib/supabase/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMemo } from "react";

type PayableRow = Database["public"]["Tables"]["fin_payables"]["Row"];

const TABLE_ID = "fin_payables";

function fmt(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface PayablesTableProps {
  payables: PayableRow[];
  onSelect: (p: PayableRow) => void;
}

export function PayablesTable({ payables, onSelect }: PayablesTableProps) {
  const { columnPrefs, sortPref, saveColumns, saveSort, reset } = useTablePreferences(TABLE_ID);

  const columnDefs: ColumnDef<PayableRow>[] = useMemo(
    () => [
      {
        id: "description",
        label: "Descricao",
        hideable: false,
        sortable: true,
        sortType: "string",
        sortAccessor: (row) => row.description,
        cellRender: (row) => (
          <span className="font-medium max-w-[250px] truncate block">
            {row.description}
          </span>
        ),
      },
      {
        id: "amount",
        label: "Valor",
        sortable: true,
        sortType: "number",
        sortAccessor: (row) => row.amount,
        cellRender: (row) => (
          <span className="whitespace-nowrap">{fmt(row.amount)}</span>
        ),
      },
      {
        id: "due_date",
        label: "Vencimento",
        sortable: true,
        sortType: "date",
        sortAccessor: (row) => row.due_date,
        cellRender: (row) => (
          <span className="whitespace-nowrap">
            {format(new Date(row.due_date + "T12:00:00"), "dd MMM yyyy", {
              locale: ptBR,
            })}
          </span>
        ),
      },
      {
        id: "status",
        label: "Status",
        sortable: true,
        sortType: "string",
        sortAccessor: (row) => row.status,
        cellRender: (row) => {
          const st = PAYABLE_STATUS[row.status as keyof typeof PAYABLE_STATUS];
          return st ? (
            <Badge
              variant="secondary"
              style={{ backgroundColor: st.bg, color: st.color }}
            >
              {st.label}
            </Badge>
          ) : (
            <Badge variant="secondary">{row.status}</Badge>
          );
        },
      },
    ],
    []
  );

  return (
    <DataTable
      tableId={TABLE_ID}
      columnDefs={columnDefs}
      data={payables}
      rowKey={(row) => row.id}
      savedPrefs={columnPrefs}
      onPrefsChange={saveColumns}
      onPrefsReset={reset}
      defaultSort={sortPref}
      onSortChange={saveSort}
      onRowClick={onSelect}
      emptyMessage="Nenhuma conta a pagar encontrada."
    />
  );
}
