"use client";

import { useState } from "react";
import { useAuditLogs } from "@/hooks/use-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, ChevronLeft, ChevronRight } from "lucide-react";

const ACTION_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  create: { label: "Criação", variant: "default" },
  update: { label: "Atualização", variant: "secondary" },
  delete: { label: "Exclusão", variant: "destructive" },
};

const ENTITY_LABELS: Record<string, string> = {
  profiles: "Perfil",
  projects: "Projeto",
  tasks: "Tarefa",
  crm_deals: "Deal",
  meetings: "Reunião",
  clients: "Cliente",
  contracts: "Contrato",
};

export function AuditLogTable() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useAuditLogs({ page });

  const logs = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / 25);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Logs de Auditoria ({totalCount})
        </CardTitle>
        <CardDescription>
          Registro de ações realizadas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum log de auditoria encontrado.
          </p>
        ) : (
          <div className="divide-y">
            {logs.map((log) => {
              const actionInfo = ACTION_LABELS[log.action] ?? {
                label: log.action,
                variant: "outline" as const,
              };
              const entityLabel = ENTITY_LABELS[log.entity_type ?? ""] ?? log.entity_type;
              const meta = log.metadata as Record<string, unknown> | null;
              const date = new Date(log.created_at ?? "");

              return (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={actionInfo.variant} className="text-xs">
                        {actionInfo.label}
                      </Badge>
                      <span className="text-sm font-medium">{entityLabel}</span>
                      {log.entity_id && (
                        <span className="text-xs text-muted-foreground font-mono truncate max-w-[140px]">
                          {log.entity_id.slice(0, 8)}
                        </span>
                      )}
                    </div>
                    {meta && (meta as Record<string, unknown>).changed_fields ? (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        Campos: {Object.keys(
                          (meta as Record<string, unknown>).changed_fields as Record<string, unknown>,
                        ).join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Página {page + 1} de {totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
