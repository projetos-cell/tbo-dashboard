"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useOmieSyncLogs, useTriggerOmieSync } from "@/hooks/use-omie-sync";
import type { OmieSyncLog } from "@/services/omie-sync";

// ── Helpers ──────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "---";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status: string) {
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; label: string }> = {
    running: {
      variant: "default",
      icon: <Clock className="mr-1 h-3 w-3 animate-spin" />,
      label: "Em andamento",
    },
    success: {
      variant: "secondary",
      icon: <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />,
      label: "Concluido",
    },
    partial: {
      variant: "outline",
      icon: <AlertTriangle className="mr-1 h-3 w-3 text-yellow-500" />,
      label: "Parcial",
    },
    error: {
      variant: "destructive",
      icon: <XCircle className="mr-1 h-3 w-3" />,
      label: "Erro",
    },
  };

  const cfg = map[status] ?? map.error!;
  return (
    <Badge variant={cfg.variant} className="inline-flex items-center text-xs">
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

// ── Component ────────────────────────────────────────────────

export function OmieSyncPanel() {
  const { data: logs, isLoading } = useOmieSyncLogs();
  const triggerSync = useTriggerOmieSync();

  const lastLog = logs?.[0] as OmieSyncLog | undefined;
  const isRunning = lastLog?.status === "running";

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Integracao Omie</p>
            {lastLog && (
              <p className="text-xs text-muted-foreground">
                Ultima sincronizacao: {formatDate(lastLog.started_at)}
                {" "}
                {statusBadge(lastLog.status)}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={isRunning || triggerSync.isPending}
            onClick={() => triggerSync.mutate()}
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${isRunning || triggerSync.isPending ? "animate-spin" : ""}`}
            />
            {isRunning ? "Sincronizando..." : "Sincronizar com Omie"}
          </Button>
        </div>

        {/* Log Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Fornecedores</TableHead>
                  <TableHead className="text-xs text-right">Clientes</TableHead>
                  <TableHead className="text-xs text-right">A Pagar</TableHead>
                  <TableHead className="text-xs text-right">A Receber</TableHead>
                  <TableHead className="text-xs">Erros</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: OmieSyncLog) => {
                  const errCount = Array.isArray(log.errors) ? log.errors.length : 0;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {formatDate(log.started_at)}
                      </TableCell>
                      <TableCell>{statusBadge(log.status)}</TableCell>
                      <TableCell className="text-xs text-right">
                        {log.vendors_synced ?? 0}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {log.clients_synced ?? 0}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {log.payables_synced ?? 0}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {log.receivables_synced ?? 0}
                      </TableCell>
                      <TableCell className="text-xs">
                        {errCount > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {errCount} erro{errCount > 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">---</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhuma sincronizacao realizada ainda.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
