"use client";

import { use, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconShare, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState } from "@/components/shared";
import { useRsmAccount, useRsmMetrics, useRsmPosts } from "@/hooks/use-rsm";
import { usePortalAccessByClient } from "@/features/clientes/hooks/use-portal-cliente";
import { useToast } from "@/hooks/use-toast";
import { RsmAccountDashboard } from "./_components/rsm-account-dashboard";
import { RsmPostsDiagnostics } from "./_components/rsm-posts-diagnostics";
import { RsmRecommendedActions } from "./_components/rsm-recommended-actions";

interface Props {
  params: Promise<{ accountId: string }>;
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  facebook: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  linkedin: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  tiktok: "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300",
  youtube: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  twitter: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  x: "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300",
};

export default function RsmAccountDetailPage({ params }: Props) {
  const { accountId } = use(params);
  const router = useRouter();

  const {
    data: account,
    isLoading: loadingAccount,
    error: accountError,
    refetch: refetchAccount,
  } = useRsmAccount(accountId);

  const {
    data: metrics = [],
    isLoading: loadingMetrics,
    error: metricsError,
    refetch: refetchMetrics,
  } = useRsmMetrics(accountId);

  const {
    data: posts = [],
    isLoading: loadingPosts,
    error: postsError,
    refetch: refetchPosts,
  } = useRsmPosts({ accountId, status: "published" });

  const { data: portalAccess } = usePortalAccessByClient(
    account?.client_id ?? null
  );

  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShareLink = useCallback(() => {
    if (!portalAccess?.access_token) return;
    const url = `${window.location.origin}/portal/${portalAccess.access_token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast({ title: "Link copiado!", description: "Link de visualização copiado para a área de transferência." });
      setTimeout(() => setCopied(false), 2000);
    });
  }, [portalAccess, toast]);

  const isLoading = loadingAccount || loadingMetrics || loadingPosts;
  const error = accountError || metricsError || postsError;

  const handleRetry = () => {
    refetchAccount();
    refetchMetrics();
    refetchPosts();
  };

  return (
    <RequireRole module="rsm">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/rsm")}
            className="shrink-0"
          >
            <IconArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            {loadingAccount ? (
              <div className="space-y-1">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : account ? (
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight truncate">
                    @{account.handle}
                  </h1>
                  <Badge
                    variant="secondary"
                    className={
                      PLATFORM_COLORS[account.platform.toLowerCase()] ??
                      "bg-gray-100 text-gray-800"
                    }
                  >
                    {account.platform}
                  </Badge>
                  {portalAccess?.access_token && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2 gap-1.5 text-xs"
                      onClick={handleShareLink}
                    >
                      {copied ? (
                        <IconCheck className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <IconShare className="h-3.5 w-3.5" />
                      )}
                      {copied ? "Copiado!" : "Compartilhar"}
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Dashboard de performance da conta
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {error && (
          <ErrorState message={error.message} onRetry={handleRetry} />
        )}

        {/* Loading skeleton */}
        {isLoading && !error && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        )}

        {/* Dashboard */}
        {!isLoading && account && (
          <>
            <RsmAccountDashboard account={account} metrics={metrics} />
            <RsmPostsDiagnostics account={account} metrics={metrics} posts={posts} />
            <RsmRecommendedActions account={account} metrics={metrics} posts={posts} />
          </>
        )}
      </div>
    </RequireRole>
  );
}
