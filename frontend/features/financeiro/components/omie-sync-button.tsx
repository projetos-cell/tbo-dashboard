"use client";

import {
  IconCheck,
  IconLoader2,
  IconAlertTriangle,
  IconRefresh,
  IconCloudOff,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useOmieSyncLogs, useTriggerOmieSync } from "../hooks/use-omie-sync";
import { isStaleSyncLog, type OmieSyncLog } from "../services/omie-sync";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────────────────

type SyncState = "syncing" | "success" | "partial" | "error" | "stale" | "never";

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `há ${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `há ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  return `há ${Math.floor(hrs / 24)}d`;
}

function resolveSyncState(
  latest: OmieSyncLog | null,
  isStale: boolean,
  isPending: boolean
): SyncState {
  if (isPending) return "syncing";
  if (!latest) return "never";
  if (isStale) return "stale";
  if (latest.status === "running") return "syncing";
  if (latest.status === "success") return "success";
  if (latest.status === "partial") return "partial";
  if (latest.status === "error") return "error";
  return "never";
}

function getTotalRecords(log: OmieSyncLog): number {
  return (
    (log.vendors_synced ?? 0) +
    (log.clients_synced ?? 0) +
    (log.payables_synced ?? 0) +
    (log.receivables_synced ?? 0) +
    (log.categories_synced ?? 0) +
    (log.bank_accounts_synced ?? 0)
  );
}

// ── Style maps ───────────────────────────────────────────────────────────────

const STATE_CONFIG: Record<
  SyncState,
  {
    container: string;
    dot: string;
    label: string;
    actionLabel: string;
  }
> = {
  success: {
    container: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
    dot: "bg-emerald-500",
    label: "Sincronizado",
    actionLabel: "Sync",
  },
  syncing: {
    container: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    dot: "bg-blue-500 animate-pulse",
    label: "Sincronizando...",
    actionLabel: "",
  },
  partial: {
    container: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
    dot: "bg-amber-500",
    label: "Sync parcial",
    actionLabel: "Sync",
  },
  error: {
    container: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    dot: "bg-red-500",
    label: "Erro na sync",
    actionLabel: "Tentar novamente",
  },
  stale: {
    container: "bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-700",
    dot: "bg-gray-400",
    label: "Sync travada",
    actionLabel: "Forçar nova sync",
  },
  never: {
    container: "bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-700",
    dot: "bg-gray-400",
    label: "Nunca sincronizado",
    actionLabel: "Sincronizar agora",
  },
};

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusIcon({ state }: { state: SyncState }) {
  const size = 14;
  if (state === "syncing")
    return <IconLoader2 size={size} className="animate-spin text-blue-600" />;
  if (state === "success")
    return <IconCheck size={size} className="text-emerald-600" />;
  if (state === "partial")
    return <IconAlertTriangle size={size} className="text-amber-600" />;
  if (state === "error")
    return <IconAlertTriangle size={size} className="text-red-600" />;
  return <IconCloudOff size={size} className="text-muted-foreground" />;
}

function MetaInfo({
  state,
  latest,
}: {
  state: SyncState;
  latest: OmieSyncLog | null;
}) {
  if (state === "never") {
    return (
      <span className="text-muted-foreground">Conecte ao Omie para começar</span>
    );
  }

  if (!latest) return null;

  const parts: string[] = [];

  if (state === "syncing") {
    parts.push(`Iniciado ${formatRelativeTime(latest.started_at)}`);
  } else {
    const timeRef = latest.finished_at ?? latest.started_at;
    parts.push(formatRelativeTime(timeRef));

    if (state === "success" || state === "partial") {
      const total = getTotalRecords(latest);
      if (total > 0) parts.push(`${total} registros`);
    }

    if (state === "error" && latest.errors?.[0]) {
      const msg = latest.errors[0].message;
      parts.push(msg.length > 40 ? `${msg.slice(0, 40)}…` : msg);
    }

    if (state === "stale") {
      parts.push("Rodando há mais de 5min");
    }
  }

  return (
    <span className="text-muted-foreground truncate max-w-[200px]">
      {parts.join(" · ")}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function OmieSyncButton() {
  const { data: logs } = useOmieSyncLogs();
  const trigger = useTriggerOmieSync();
  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();

  const latest = logs?.[0] ?? null;
  const isStale = isStaleSyncLog(latest);
  const state = resolveSyncState(latest, isStale, trigger.isPending);
  const config = STATE_CONFIG[state];
  const isDisabled = state === "syncing" || trigger.isPending;

  async function handleSync() {
    try {
      await trigger.mutateAsync(undefined);
      toast.success("Sincronização iniciada", {
        description: "Os dados do Omie serão atualizados em instantes.",
      });
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

  // Tooltip com detalhes extras
  const tooltipLines: string[] = [];
  if (latest) {
    const timeRef = latest.finished_at ?? latest.started_at;
    tooltipLines.push(`Último sync: ${new Date(timeRef).toLocaleString("pt-BR")}`);
    if (latest.trigger_source) {
      const sources = { manual: "Manual", cron: "Automático", webhook: "Webhook" };
      tooltipLines.push(`Origem: ${sources[latest.trigger_source] ?? latest.trigger_source}`);
    }
    if (latest.duration_ms) {
      tooltipLines.push(`Duração: ${(latest.duration_ms / 1000).toFixed(1)}s`);
    }
    if (state === "success" || state === "partial") {
      const total = getTotalRecords(latest);
      tooltipLines.push(
        `Registros: ${total} (${latest.vendors_synced ?? 0} forn · ${latest.clients_synced ?? 0} cli · ${latest.payables_synced ?? 0} AP · ${latest.receivables_synced ?? 0} AR)`
      );
    }
    if (latest.errors && latest.errors.length > 0) {
      tooltipLines.push(`${latest.errors.length} erro(s) registrado(s)`);
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors",
              config.container
            )}
          >
            {/* Status indicator */}
            <div className="flex items-center gap-1.5 shrink-0">
              <StatusIcon state={state} />
              <span className="font-medium">{config.label}</span>
            </div>

            {/* Separator */}
            <div className="h-3 w-px bg-current opacity-15 shrink-0" />

            {/* Meta info */}
            <MetaInfo state={state} latest={latest} />

            {/* Action button */}
            {state !== "syncing" && (
              <>
                <div className="h-3 w-px bg-current opacity-15 shrink-0" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSync}
                  disabled={isDisabled}
                  className={cn(
                    "h-auto px-1.5 py-0.5 text-xs font-medium gap-1",
                    state === "error" && "text-red-700 hover:text-red-800 hover:bg-red-100",
                    state === "success" && "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100",
                    state === "partial" && "text-amber-700 hover:text-amber-800 hover:bg-amber-100",
                    (state === "stale" || state === "never") && "text-gray-700 hover:text-gray-800 hover:bg-gray-100"
                  )}
                >
                  <IconRefresh size={12} />
                  <span className="hidden sm:inline">{config.actionLabel}</span>
                </Button>
              </>
            )}

            {/* Syncing loader */}
            {state === "syncing" && (
              <IconLoader2 size={12} className="animate-spin text-blue-500 shrink-0" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="text-xs max-w-xs">
          {tooltipLines.length > 0 ? (
            tooltipLines.map((line, i) => (
              <p key={i} className={i === 0 ? "font-medium" : "text-muted-foreground"}>
                {line}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground">
              Nenhuma sincronização registrada ainda
            </p>
          )}
          {!isDisabled && (
            <p className="mt-1 text-muted-foreground border-t pt-1">
              Clique no botão para sincronizar
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
