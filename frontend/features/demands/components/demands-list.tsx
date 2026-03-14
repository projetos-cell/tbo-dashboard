"use client";

import { DataTable } from "@/components/ui/data-table";
import { useTablePreferences } from "@/hooks/use-table-preferences";
import { useDemandColumns } from "@/features/demands/hooks/use-demand-columns";
import type { Database } from "@/lib/supabase/types";

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

const TABLE_ID = "demandas";

interface DemandsListProps {
  demands: DemandRow[];
  onSelect: (demand: DemandRow) => void;
}

export function DemandsList({ demands, onSelect }: DemandsListProps) {
  const { columnPrefs, sortPref, saveColumns, saveSort, reset } =
    useTablePreferences(TABLE_ID);
  const columnDefs = useDemandColumns(onSelect);

  return (
    <DataTable
      tableId={TABLE_ID}
      columnDefs={columnDefs}
      data={demands}
      rowKey={(row) => row.id}
      savedPrefs={columnPrefs ?? undefined}
      onPrefsChange={saveColumns}
      onPrefsReset={reset}
      defaultSort={sortPref}
      onSortChange={saveSort}
      onRowClick={onSelect}
      emptyMessage="Nenhuma demanda encontrada"
    />
  );
}
