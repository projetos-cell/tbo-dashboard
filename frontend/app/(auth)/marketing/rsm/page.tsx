"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { IconFileText, IconChartBar, IconBolt, IconDownload } from "@tabler/icons-react";
import { RequireRole } from "@/features/auth/components/require-role";
import {
  useRsmAccounts,
  useRsmAccount,
  useRsmMetrics,
  useRsmPosts,
} from "@/features/marketing/hooks/use-marketing-social";
import { RsmAccountDashboard } from "@/features/marketing/components/rsm/rsm-account-dashboard";
import { RsmPostsDiagnostics } from "@/features/marketing/components/rsm/rsm-posts-diagnostics";
import { RsmRecommendedActions } from "@/features/marketing/components/rsm/rsm-recommended-actions";
import { toast } from "sonner";

const PERIOD_OPTIONS = [
  { value: "1", label: "Último mês" },
  { value: "3", label: "Últimos 3 meses" },
  { value: "6", label: "Últimos 6 meses" },
  { value: "12", label: "Último ano" },
];

function RsmSkeletonContent() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-36 w-full" />
      </div>
    </div>
  );
}

function RsmEmptyState({ onSelectAccount }: { onSelectAccount: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="rounded-full bg-primary/10 p-5">
        <IconChartBar className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Selecione uma conta para começar</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
          Escolha uma conta de rede social no seletor acima para visualizar o relatório semanal.
        </p>
      </div>
      <Button variant="outline" onClick={onSelectAccount}>
        Selecionar conta
      </Button>
    </div>
  );
}

function RsmContent() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [period, setPeriod] = useState<string>("3");

  const { data: accounts, isLoading: loadingAccounts } = useRsmAccounts();
  const { data: account, isLoading: loadingAccount } = useRsmAccount(selectedAccountId);
  const { data: metrics, isLoading: loadingMetrics } = useRsmMetrics(selectedAccountId);
  const { data: posts, isLoading: loadingPosts } = useRsmPosts(
    selectedAccountId ? { accountId: selectedAccountId } : undefined
  );

  const isLoading = loadingAccount || loadingMetrics || loadingPosts;
  const hasAccount = !!selectedAccountId && !!account;

  const filteredMetrics = (metrics ?? []).filter((m) => {
    const monthsAgo = parseInt(period, 10);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsAgo);
    return new Date(m.date) >= cutoff;
  });

  const filteredPosts = (posts ?? []).filter((p) => {
    if (!p.published_date) return false;
    const monthsAgo = parseInt(period, 10);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - monthsAgo);
    return new Date(p.published_date) >= cutoff;
  });

  const handleExportPdf = useCallback(() => {
    toast.info("Exportação de PDF em desenvolvimento. Em breve disponível.");
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RSM — Relatório Semanal de Mídias</h1>
          <p className="text-sm text-muted-foreground">
            Análise de performance, diagnóstico de posts e recomendações estratégicas.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPdf}
          disabled={!hasAccount}
          className="gap-2 self-start sm:self-auto"
        >
          <IconDownload className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-xs">
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
            disabled={loadingAccounts}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loadingAccounts ? "Carregando contas…" : "Selecionar conta"} />
            </SelectTrigger>
            <SelectContent>
              {(accounts ?? []).map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  <span className="flex items-center gap-2">
                    <span className="capitalize font-medium">{acc.platform}</span>
                    <span className="text-muted-foreground">@{acc.handle}</span>
                    {acc.is_active && (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1">ativo</Badge>
                    )}
                  </span>
                </SelectItem>
              ))}
              {!loadingAccounts && (accounts ?? []).length === 0 && (
                <SelectItem value="_empty" disabled>
                  Nenhuma conta cadastrada
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-44">
          <Select value={period} onValueChange={setPeriod} disabled={!hasAccount}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {!selectedAccountId ? (
        <RsmEmptyState onSelectAccount={() => {}} />
      ) : isLoading ? (
        <RsmSkeletonContent />
      ) : !account ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-muted-foreground">Conta não encontrada ou sem dados.</p>
          <Button variant="outline" onClick={() => setSelectedAccountId("")}>
            Limpar seleção
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <IconChartBar className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <IconFileText className="h-4 w-4" />
              Posts
              {filteredPosts.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1.5">
                  {filteredPosts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="acoes" className="gap-2">
              <IconBolt className="h-4 w-4" />
              Ações
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Account Dashboard */}
          <TabsContent value="dashboard" className="mt-0">
            {filteredMetrics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <IconChartBar className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-muted-foreground font-medium">Sem métricas no período selecionado</p>
                <p className="text-sm text-muted-foreground">
                  Tente ampliar o período ou sincronize os dados da conta.
                </p>
              </div>
            ) : (
              <RsmAccountDashboard account={account} metrics={filteredMetrics} />
            )}
          </TabsContent>

          {/* Tab 2: Posts Diagnostics */}
          <TabsContent value="posts" className="mt-0">
            {filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <IconFileText className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-muted-foreground font-medium">Nenhum post no período</p>
                <p className="text-sm text-muted-foreground">
                  Amplie o período selecionado para ver publicações anteriores.
                </p>
              </div>
            ) : (
              <RsmPostsDiagnostics
                account={account}
                metrics={filteredMetrics}
                posts={filteredPosts}
              />
            )}
          </TabsContent>

          {/* Tab 3: Recommended Actions */}
          <TabsContent value="acoes" className="mt-0">
            <RsmRecommendedActions
              account={account}
              metrics={filteredMetrics}
              posts={filteredPosts}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default function RsmPage() {
  return (
    <RequireRole module="marketing">
      <RsmContent />
    </RequireRole>
  );
}
