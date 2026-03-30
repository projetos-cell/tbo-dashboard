"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sanitizeHtml } from "@/lib/sanitize";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconClock,
  IconDownload,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getRunById } from "@/services/reports";
import type { Database } from "@/lib/supabase/types";
import type { Json } from "@/lib/supabase/types";

type ReportRunRow = Database["public"]["Tables"]["report_runs"]["Row"];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof IconCircleCheck }> = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: IconClock },
  running: { label: "Executando", color: "bg-blue-100 text-blue-800", icon: IconClock },
  completed: { label: "Concluido", color: "bg-green-100 text-green-800", icon: IconCircleCheck },
  failed: { label: "Falhou", color: "bg-red-100 text-red-800", icon: IconAlertTriangle },
};

interface RunContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runId: string | null;
  scheduleName?: string;
}

function formatJsonContent(content: Json | null): string {
  if (!content) return "Sem conteudo disponivel.";
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return String(content);
  }
}

export function RunContentDialog({ open, onOpenChange, runId, scheduleName }: RunContentDialogProps) {
  const supabase = createClient();

  const { data: run, isLoading } = useQuery({
    queryKey: ["report-run", runId],
    queryFn: () => getRunById(supabase, runId!),
    enabled: !!runId && open,
  });

  const statusCfg = run ? STATUS_CONFIG[run.status] ?? STATUS_CONFIG.pending : null;

  function handleDownloadJson() {
    if (!run?.content) return;
    const blob = new Blob([JSON.stringify(run.content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${run.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {scheduleName ? `Execucao: ${scheduleName}` : "Detalhes da Execucao"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : run ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {statusCfg && (
                <Badge variant="secondary" className={`gap-1 ${statusCfg.color}`}>
                  <statusCfg.icon className="h-3 w-3" />
                  {statusCfg.label}
                </Badge>
              )}
              <Badge variant="outline">{run.type}</Badge>
              {run.generated_at && (
                <span className="text-muted-foreground">
                  Gerado em {format(new Date(run.generated_at), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                </span>
              )}
              {run.completed_at && (
                <span className="text-muted-foreground">
                  Concluido em {format(new Date(run.completed_at), "HH:mm:ss", { locale: ptBR })}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Timeline</p>
              <div className="relative space-y-3 pl-5 before:absolute before:left-[7px] before:top-1 before:h-[calc(100%-8px)] before:w-px before:bg-border">
                {run.created_at && (
                  <div className="relative flex items-start gap-2">
                    <div className="absolute -left-5 top-1 h-2.5 w-2.5 rounded-full bg-blue-400" />
                    <div>
                      <p className="text-xs font-medium">Criado</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(run.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                {run.generated_at && run.generated_at !== run.created_at && (
                  <div className="relative flex items-start gap-2">
                    <div className="absolute -left-5 top-1 h-2.5 w-2.5 rounded-full bg-violet-400" />
                    <div>
                      <p className="text-xs font-medium">Gerado</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(run.generated_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                {run.completed_at && (
                  <div className="relative flex items-start gap-2">
                    <div className={`absolute -left-5 top-1 h-2.5 w-2.5 rounded-full ${run.status === "failed" ? "bg-red-400" : "bg-emerald-400"}`} />
                    <div>
                      <p className="text-xs font-medium">{run.status === "failed" ? "Falhou" : "Concluido"}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(run.completed_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
                {!run.completed_at && (run.status === "pending" || run.status === "running") && (
                  <div className="relative flex items-start gap-2">
                    <div className="absolute -left-5 top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-yellow-400" />
                    <div>
                      <p className="text-xs font-medium">Em andamento...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {run.error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-800">Erro</p>
                <p className="mt-1 text-sm text-red-700">{run.error}</p>
              </div>
            )}

            {run.html_content ? (
              <div className="rounded-md border p-4">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(run.html_content) }}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Conteudo</p>
                  {run.content && Object.keys(run.content as object).length > 0 && (
                    <Button variant="outline" size="sm" onClick={handleDownloadJson}>
                      <IconDownload className="mr-1.5 h-3.5 w-3.5" />
                      Baixar JSON
                    </Button>
                  )}
                </div>
                <pre className="max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs">
                  {formatJsonContent(run.content)}
                </pre>
              </div>
            )}

            {run.metadata && Object.keys(run.metadata as object).length > 0 && (
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-muted-foreground">
                  Metadados
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-2 text-xs">
                  {JSON.stringify(run.metadata, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Execucao nao encontrada.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
