"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDownload, IconFileSpreadsheet, IconBraces } from "@tabler/icons-react";
import { useTableExport, type ExportColumn } from "@/hooks/use-table-export";

interface TableExportButtonProps<T> {
  filename: string;
  columns: ExportColumn<T>[];
  data: T[];
}

export function TableExportButton<T>({
  filename,
  columns,
  data,
}: TableExportButtonProps<T>) {
  const { exportCSV, exportJSON } = useTableExport<T>();

  if (!data.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <IconDownload className="size-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => exportCSV({ filename, columns, data })}
        >
          <IconFileSpreadsheet className="size-4" />
          <span>CSV (.csv)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => exportJSON({ filename, columns, data })}
        >
          <IconBraces className="size-4" />
          <span>JSON (.json)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
