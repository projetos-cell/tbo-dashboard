"use client";

import { IconFileTypePdf, IconCalendarEvent } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataSourceBadge {
  label: string;
  date: string; // "Mar 2025" format
}

interface ReportHeaderProps {
  title: string;
  subtitle: string;
  sources: DataSourceBadge[];
}

function formatPrintDate() {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ReportHeader({ title, subtitle, sources }: ReportHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <TooltipProvider>
            {sources.map((s) => (
              <Tooltip key={s.label}>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="gap-1 text-[10px] font-normal"
                  >
                    <IconCalendarEvent className="h-3 w-3" />
                    {s.label}: {s.date}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Dados atualizados em {s.date}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="no-print gap-1.5 shrink-0"
        onClick={() => window.print()}
      >
        <IconFileTypePdf className="h-4 w-4" />
        Exportar PDF
      </Button>
      {/* Visible only in print */}
      <p className="hidden print:block text-xs text-muted-foreground w-full mt-1">
        Relatório gerado em {formatPrintDate()} — TBO OS
      </p>
    </div>
  );
}
