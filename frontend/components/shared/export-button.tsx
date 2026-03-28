"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDownload, IconFileTypeCsv, IconFileTypeXls, IconFileTypePdf, IconLoader2 } from "@tabler/icons-react";
import { exportToCSV, exportToXLSX, exportToPDF, type ExportColumn } from "@/lib/export-utils";
import { toast } from "sonner";

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  columns?: ExportColumn[];
  title?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
  disabled?: boolean;
}

export function ExportButton({
  data,
  filename,
  columns,
  title,
  size = "sm",
  variant = "outline",
  disabled = false,
}: ExportButtonProps) {
  const [loading, setLoading] = useState<"csv" | "xlsx" | "pdf" | null>(null);

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    if (!data.length) {
      toast.warning("Nenhum dado para exportar.");
      return;
    }

    setLoading(format);
    try {
      if (format === "csv") {
        exportToCSV(data, filename, columns);
        toast.success("CSV exportado com sucesso.");
      } else if (format === "xlsx") {
        await exportToXLSX(data, filename, columns);
        toast.success("XLSX exportado com sucesso.");
      } else {
        if (!columns?.length) {
          toast.error("Defina as colunas para exportar em PDF.");
          return;
        }
        exportToPDF(title ?? filename, data, columns);
        toast.success("PDF aberto para impressão.");
      }
    } catch (err) {
      toast.error("Erro ao exportar. Tente novamente.");
      console.error("[ExportButton]", err);
    } finally {
      setLoading(null);
    }
  };

  const isLoading = loading !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled || isLoading}>
          {isLoading ? (
            <IconLoader2 className="h-4 w-4 animate-spin" />
          ) : (
            <IconDownload className="h-4 w-4" />
          )}
          <span className="ml-1.5">Exportar</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Formato
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={isLoading}
          className="gap-2"
        >
          {loading === "csv" ? (
            <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <IconFileTypeCsv className="h-4 w-4 text-green-600" />
          )}
          CSV
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport("xlsx")}
          disabled={isLoading}
          className="gap-2"
        >
          {loading === "xlsx" ? (
            <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <IconFileTypeXls className="h-4 w-4 text-emerald-600" />
          )}
          Excel (XLSX)
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={isLoading}
          className="gap-2"
        >
          {loading === "pdf" ? (
            <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <IconFileTypePdf className="h-4 w-4 text-red-600" />
          )}
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
