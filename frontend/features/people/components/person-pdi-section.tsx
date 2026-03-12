"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookOpen, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePdis } from "@/features/pdi/hooks/use-pdi";

// ── Status badge config ──────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  ativo: {
    label: "Ativo",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  em_andamento: {
    label: "Em andamento",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  atrasado: {
    label: "Atrasado",
    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
  concluido: {
    label: "Concluído",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  pausado: {
    label: "Pausado",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  },
};

// ── Component ────────────────────────────────────────────────────────────────

interface PersonPdiSectionProps {
  personId: string;
}

export function PersonPdiSection({ personId }: PersonPdiSectionProps) {
  const { data: pdis, isLoading } = usePdis({ personId });

  // Most recent active/in-progress PDI first; fall back to any
  const activePdi =
    pdis?.find((p) => p.status === "ativo" || p.status === "em_andamento") ??
    pdis?.[0] ??
    null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Plano de Desenvolvimento
      </p>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      )}

      {!isLoading && !activePdi && (
        <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500">Nenhum PDI criado ainda.</p>
          <Button asChild size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
            <Link href={`/pessoas/pdi?person_id=${personId}`}>
              <Plus className="h-3.5 w-3.5" />
              Criar PDI
            </Link>
          </Button>
        </div>
      )}

      {!isLoading && activePdi && (
        <Link
          href={`/pessoas/pdi?person_id=${personId}`}
          className="group flex items-start justify-between rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-3.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/70"
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <BookOpen className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-medium leading-tight">
                {activePdi.title ?? "PDI sem título"}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                {activePdi.status && (
                  <Badge
                    className={
                      STATUS_CONFIG[activePdi.status]?.className ??
                      "bg-gray-100 text-gray-600"
                    }
                  >
                    {STATUS_CONFIG[activePdi.status]?.label ?? activePdi.status}
                  </Badge>
                )}
                {(() => {
                  const endDate = (activePdi as unknown as Record<string, unknown>)["end_date"];
                  if (!endDate) return null;
                  return (
                    <span className="text-[11px] text-gray-400">
                      até{" "}
                      {format(
                        new Date(String(endDate) + "T12:00:00"),
                        "MMM yyyy",
                        { locale: ptBR }
                      )}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {/* All PDIs count link */}
      {!isLoading && pdis && pdis.length > 1 && (
        <Link
          href={`/pessoas/pdi?person_id=${personId}`}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronRight className="h-3 w-3" />
          Ver todos os PDIs ({pdis.length})
        </Link>
      )}
    </div>
  );
}
