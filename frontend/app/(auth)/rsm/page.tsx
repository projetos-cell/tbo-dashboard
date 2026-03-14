"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconRefresh,
  IconSettings2,
  IconCircleCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RequireRole } from "@/features/auth/components/require-role";
import { useRsmAccounts, useRsmPosts } from "@/hooks/use-rsm";
import { computeRsmKPIs } from "@/services/rsm";
import { ErrorState } from "@/components/shared";
import { useSyncInstagram, useInstagramSyncStatus } from "@/hooks/use-instagram-sync";
import { InstagramConfigDialog } from "./_components/instagram-config-dialog";
import { RsmKpiCards } from "./_components/rsm-kpi-cards";
import { RsmTabContas } from "./_components/rsm-tab-contas";
import { RsmTabPosts } from "./_components/rsm-tab-posts";
import { RsmTabIdeias } from "./_components/rsm-tab-ideias";

export default function RsmPage() {
  const [tab, setTab] = useState("contas");
  const [configOpen, setConfigOpen] = useState(false);

  const syncMutation = useSyncInstagram();
  const { data: syncStatus } = useInstagramSyncStatus();

  const {
    data: accounts = [],
    isLoading: loadingAccounts,
    error: accountsError,
    refetch: refetchAccounts,
  } = useRsmAccounts();

  const { data: allPosts = [], error: postsError, refetch: refetchPosts } = useRsmPosts();

  const primaryError = accountsError || postsError;
  const primaryRefetch = () => { refetchAccounts(); refetchPosts(); };

  const kpis = useMemo(() => computeRsmKPIs(accounts, allPosts), [accounts, allPosts]);

  return (
    <RequireRole module="rsm">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Social Media</h1>
            <p className="text-sm text-gray-500">
              Gerencie contas, posts e ideias de redes sociais.
            </p>
            {syncStatus && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                {syncStatus.status === "success" ? (
                  <IconCircleCheck className="h-3 w-3 text-green-500" />
                ) : syncStatus.status === "error" ? (
                  <IconAlertCircle className="h-3 w-3 text-red-500" />
                ) : null}
                <span>
                  Ultimo sync:{" "}
                  {formatDistanceToNow(
                    new Date(syncStatus.finished_at ?? syncStatus.created_at),
                    { addSuffix: true, locale: ptBR }
                  )}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setConfigOpen(true)}>
              <IconSettings2 className="mr-1.5 h-4 w-4" />
              Config
            </Button>
            <Button
              size="sm"
              onClick={() => syncMutation.mutate(7)}
              disabled={syncMutation.isPending}
            >
              <IconRefresh
                className={`mr-1.5 h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`}
              />
              {syncMutation.isPending ? "Sincronizando..." : "Sync Instagram"}
            </Button>
          </div>
        </div>

        <InstagramConfigDialog open={configOpen} onOpenChange={setConfigOpen} />

        {primaryError && (
          <ErrorState message={primaryError.message} onRetry={primaryRefetch} />
        )}

        <RsmKpiCards kpis={kpis} />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="contas">Contas</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="ideias">Ideias</TabsTrigger>
          </TabsList>

          <TabsContent value="contas" className="space-y-4">
            <RsmTabContas accounts={accounts} isLoading={loadingAccounts} />
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <RsmTabPosts />
          </TabsContent>

          <TabsContent value="ideias" className="space-y-4">
            <RsmTabIdeias />
          </TabsContent>
        </Tabs>
      </div>
    </RequireRole>
  );
}
