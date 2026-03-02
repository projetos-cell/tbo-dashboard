"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CloudDownload } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OmieSyncBadgeProps {
  /** ISO timestamp from omie_synced_at column */
  syncedAt: string | null | undefined;
  /** Show inline warning text about edit overwrite */
  showWarning?: boolean;
}

/**
 * Displays a badge indicating the record was synced from Omie.
 * When `showWarning` is true, adds a note that local edits may be overwritten.
 */
export function OmieSyncBadge({ syncedAt, showWarning = false }: OmieSyncBadgeProps) {
  if (!syncedAt) return null;

  const syncDate = format(new Date(syncedAt), "dd/MM/yyyy HH:mm", { locale: ptBR });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1 text-xs border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400"
          >
            <CloudDownload className="h-3 w-3" />
            Omie
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[260px]">
          <p className="text-xs">
            Sincronizado do Omie em {syncDate}.
            {showWarning && (
              <>
                <br />
                <strong>Atencao:</strong> edicoes locais serao sobrescritas na proxima sincronizacao.
              </>
            )}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
