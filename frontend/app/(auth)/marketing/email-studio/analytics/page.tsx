"use client";

import {
  IconChartBar,
  IconMail,
  IconEye,
  IconClick,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useEmailAnalytics } from "@/features/marketing/hooks/use-email-studio";

function KPICard({
  label,
  value,
  icon: Icon,
  color,
  isLoading,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-16" />
      </div>
    );
  }
  return (
    <div className="rounded-lg border bg-card p-4 space-y-1">
      <div className="flex items-center gap-2">
        <Icon className="size-4" style={{ color }} />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function EmailAnalyticsContent() {
  const { data: analytics, isLoading, error, refetch } = useEmailAnalytics();

  const totals = (analytics ?? []).reduce(
    (acc, a) => ({
      sent: acc.sent + a.total_sent,
      delivered: acc.delivered + a.total_delivered,
      opened: acc.opened + a.total_opened,
      clicked: acc.clicked + a.total_clicked,
    }),
    { sent: 0, delivered: 0, opened: 0, clicked: 0 },
  );

  const avgOpenRate = totals.delivered > 0 ? ((totals.opened / totals.delivered) * 100).toFixed(1) : "0";
  const avgClickRate = totals.opened > 0 ? ((totals.clicked / totals.opened) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics de Email</h1>
        <p className="text-sm text-muted-foreground">
          Metricas consolidadas de todas as campanhas de email.
        </p>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar analytics." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KPICard label="Emails enviados" value={totals.sent.toLocaleString("pt-BR")} icon={IconMail} color="#3b82f6" isLoading={isLoading} />
            <KPICard label="Entregues" value={totals.delivered.toLocaleString("pt-BR")} icon={IconMail} color="#22c55e" isLoading={isLoading} />
            <KPICard label="Taxa de abertura" value={`${avgOpenRate}%`} icon={IconEye} color="#f59e0b" isLoading={isLoading} />
            <KPICard label="Taxa de cliques" value={`${avgClickRate}%`} icon={IconClick} color="#8b5cf6" isLoading={isLoading} />
          </div>

          {!isLoading && analytics && analytics.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Performance por Campanha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Campanha</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Enviados</th>
                        <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">Aberturas</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Open Rate</th>
                        <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground lg:table-cell">Click Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {analytics.map((a) => (
                        <tr key={a.campaign_id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{a.campaign_name}</td>
                          <td className="px-4 py-3 text-right">{a.total_sent.toLocaleString("pt-BR")}</td>
                          <td className="hidden px-4 py-3 text-right md:table-cell">{a.total_opened.toLocaleString("pt-BR")}</td>
                          <td className="px-4 py-3 text-right">{a.open_rate.toFixed(1)}%</td>
                          <td className="hidden px-4 py-3 text-right lg:table-cell">{a.click_rate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : !isLoading ? (
            <EmptyState
              icon={IconChartBar}
              title="Sem dados de analytics"
              description="Envie sua primeira campanha para ver metricas aqui."
            />
          ) : null}
        </>
      )}
    </div>
  );
}

export default function EmailStudioAnalyticsPage() {
  return (
    <RequireRole module="marketing">
      <EmailAnalyticsContent />
    </RequireRole>
  );
}
