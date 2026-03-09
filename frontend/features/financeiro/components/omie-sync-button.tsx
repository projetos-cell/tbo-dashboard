"use client";

import { RefreshCw, CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useOmieSyncLogs, useTriggerOmieSync } from "../hooks/use-omie-sync";
import { isStaleSyncLog } from "../services/omie-sync";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `há ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  return `há ${Math.floor(hrs / 24)}d`;
}

function SyncStatusIcon({ status }: { status: string }) {
  if (status === "running")
    return <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />;
  if (status === "success")
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
  if (status === "partial")
    return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
  if (status === "error")
    return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
  return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
}

const STATUS_LABEL: Record<string, string> = {
  running: "Sincronizando...",
  success: "Sincronizado",
  partial: "Parcial",
  error: "Erro",
};

export function OmieSyncButton() {
  const { data: logs } = useOmieSyncLogs();
  const trigger = useTriggerOmieSync();
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  const latest = logs?.[0] ?? null;
  const isStale = isStaleSyncLog(latest);
  const isSyncing = latest?.status === "running" && !isStale;

  async function handleSync() {
    try {
      await trigger.mutateAsync(undefined);
      toast.success("Sincronização iniciada", {
        description: "Os dados do Omie serão atualizados em instantes.",
      });
      // Refresh finance queries after a short delay
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["founder-dashboard"] });
        qc.invalidateQueries({ queryKey: ["finance"] });
        if (tenantId) {
          qc.invalidateQueries({ queryKey: ["omie-sync-logs", tenantId] });
        }
      }, 3000);
    } catch {
      toast.error("Falha ao iniciar sincronização", {
        description: "Verifique as credenciais do Omie em Configurações.",
      });
    }
  }

  const tooltipLines: string[] = [];
  if (latest) {
    tooltipLines.push(
      `Último sync: ${formatRelativeTime(latest.started_at)}`
    );
    if (latest.status === "success" || latest.status === "partial") {
      const total =
        (latest.vendors_synced ?? 0) +
        (latest.clients_synced ?? 0) +
        (latest.payables_synced ?? 0) +
        (latest.receivables_synced ?? 0);
      tooltipLines.push(`${total} registros sincronizados`);
      if (latest.duration_ms)
        tooltipLines.push(`${(latest.duration_ms / 1000).toFixed(1)}s`);
    }
    if (latest.status === "error" && latest.errors?.[0]) {
      tooltipLines.push(`Erro: ${latest.errors[0].message}`);
    }
  } else {
    tooltipLines.push("Nenhum sync registrado");
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing || trigger.isPending}
            className="gap-1.5 text-xs h-8"
          >
            {isSyncing || trigger.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {latest && !trigger.isPending ? (
              <span className="flex items-center gap-1">
                <SyncStatusIcon status={latest.status} />
                <span>{STATUS_LABEL[latest.status] ?? "Omie"}</span>
              </span>
            ) : (
              <span>Sincronizar Omie</span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {tooltipLines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
          {!isSyncing && <p className="mt-1 text-muted-foreground">Clique para sincronizar</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
