"use client";

import {
  IconSend,
  IconCheck,
  IconClock,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useEmailSends } from "@/features/marketing/hooks/use-email-studio";

const SEND_STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  queued: { label: "Na fila", color: "#6b7280", bg: "rgba(107,114,128,0.12)", icon: IconClock },
  sending: { label: "Enviando", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: IconSend },
  completed: { label: "Concluido", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: IconCheck },
  failed: { label: "Falhou", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: IconAlertTriangle },
};

function EnviosContent() {
  const { data: sends, isLoading, error, refetch } = useEmailSends();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Envios</h1>
        <p className="text-sm text-muted-foreground">
          Historico de envios e status em tempo real.
        </p>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar envios." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : !sends || sends.length === 0 ? (
        <EmptyState
          icon={IconSend}
          title="Nenhum envio registrado"
          description="Os envios aparecerao aqui quando voce disparar campanhas de email."
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Campanha</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Destinatarios</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Entregues</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Aberturas</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sends.map((send) => {
                const statusDef = SEND_STATUS_MAP[send.status];
                return (
                  <tr key={send.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{send.campaign_name}</td>
                    <td className="px-4 py-3">{send.recipient_count.toLocaleString("pt-BR")}</td>
                    <td className="hidden px-4 py-3 md:table-cell">{send.delivered.toLocaleString("pt-BR")}</td>
                    <td className="hidden px-4 py-3 lg:table-cell">{send.opened.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3">
                      {statusDef ? (
                        <Badge variant="secondary" style={{ backgroundColor: statusDef.bg, color: statusDef.color }}>
                          {statusDef.label}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">{send.status}</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {send.sent_at ? new Date(send.sent_at).toLocaleDateString("pt-BR") : "--"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
            {sends.length} {sends.length === 1 ? "envio" : "envios"}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmailStudioEnviosPage() {
  return (
    <RequireRole module="marketing">
      <EnviosContent />
    </RequireRole>
  );
}
