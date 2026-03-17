"use client";

import {
  IconChartBar,
  IconTrendingUp,
  IconEye,
  IconHeart,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useRsmAccounts, useRsmPosts } from "@/features/marketing/hooks/use-marketing-social";

function KPICard({ label, value, icon: Icon, color, isLoading }: { label: string; value: string; icon: React.ElementType; color: string; isLoading?: boolean }) {
  if (isLoading) return <div className="rounded-lg border bg-card p-4 space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-7 w-16" /></div>;
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

function PerformanceContent() {
  const { data: accounts, isLoading: la, error, refetch } = useRsmAccounts();
  const { data: posts, isLoading: lp } = useRsmPosts();
  const isLoading = la || lp;

  const totalFollowers = (accounts ?? []).reduce((s, a) => s + (a.followers_count ?? 0), 0);
  const publishedPosts = (posts ?? []).filter((p) => p.status === "publicado");
  const totalPosts = publishedPosts.length;
  const totalAccounts = (accounts ?? []).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Performance por Canal</h1>
        <p className="text-sm text-muted-foreground">Metricas consolidadas de todas as redes sociais.</p>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar performance." onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KPICard label="Seguidores totais" value={totalFollowers.toLocaleString("pt-BR")} icon={IconTrendingUp} color="#3b82f6" isLoading={isLoading} />
            <KPICard label="Posts publicados" value={String(totalPosts)} icon={IconChartBar} color="#8b5cf6" isLoading={isLoading} />
            <KPICard label="Contas conectadas" value={String(totalAccounts)} icon={IconHeart} color="#ef4444" isLoading={isLoading} />
            <KPICard label="Total de posts" value={String((posts ?? []).length)} icon={IconEye} color="#22c55e" isLoading={isLoading} />
          </div>

          {!isLoading && accounts && accounts.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Performance por Conta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Conta</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plataforma</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Seguidores</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {accounts.map((account) => (
                        <tr key={account.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">@{account.handle}</td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">{account.platform}</td>
                          <td className="px-4 py-3 text-right">{(account.followers_count ?? 0).toLocaleString("pt-BR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : !isLoading ? (
            <EmptyState icon={IconChartBar} title="Sem dados de performance" description="Conecte contas e publique posts para ver metricas." />
          ) : null}
        </>
      )}
    </div>
  );
}

export default function PerformancePage() {
  return (
    <RequireRole module="marketing">
      <PerformanceContent />
    </RequireRole>
  );
}
