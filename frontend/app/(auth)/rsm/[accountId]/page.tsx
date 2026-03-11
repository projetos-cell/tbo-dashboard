"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RequireRole } from "@/features/auth/components/require-role";
import { ErrorState } from "@/components/shared";
import { useRsmAccount, useRsmMetrics, useRsmPosts } from "@/hooks/use-rsm";
import { PortalRsmDashboard } from "@/app/(public)/portal/[token]/dashboard";

interface Props {
  params: Promise<{ accountId: string }>;
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-100 text-pink-800",
  facebook: "bg-blue-100 text-blue-800",
  linkedin: "bg-sky-100 text-sky-800",
  tiktok: "bg-slate-100 text-slate-800",
  youtube: "bg-red-100 text-red-800",
  twitter: "bg-cyan-100 text-cyan-800",
  x: "bg-slate-100 text-slate-800",
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

  const isLoading = loadingAccount || loadingMetrics || loadingPosts;
  const error = accountError || metricsError || postsError;

  const handleRetry = () => {
    refetchAccount();
    refetchMetrics();
    refetchPosts();
  };

  return (
    <RequireRole module="rsm">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/rsm")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
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
          <div className="rounded-xl overflow-hidden" style={{ background: "#080c10", color: "#e8e8e8" }}>
            <PortalRsmDashboard
              clientName={account.handle}
              accounts={[account]}
              metrics={metrics}
              posts={posts}
            />
          </div>
        )}
      </div>
    </RequireRole>
  );
}
