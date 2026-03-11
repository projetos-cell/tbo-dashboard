"use client";

import { useMemo, useState } from "react";
import { Instagram } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RsmAccountDashboard } from "@/app/(auth)/rsm/[accountId]/_components/rsm-account-dashboard";
import { RsmPostsDiagnostics } from "@/app/(auth)/rsm/[accountId]/_components/rsm-posts-diagnostics";
import { RsmRecommendedActions } from "@/app/(auth)/rsm/[accountId]/_components/rsm-recommended-actions";
import type { RsmAccountRow, RsmMetricRow, RsmPostRow } from "@/app/(auth)/rsm/[accountId]/_components/rsm-helpers";

interface Props {
  clientName: string;
  accounts: RsmAccountRow[];
  metrics: RsmMetricRow[];
  posts: RsmPostRow[];
}

export function PortalRsmDashboard({ clientName, accounts, metrics, posts }: Props) {
  const [activeAccount, setActiveAccount] = useState(accounts[0]?.id ?? "");

  const accountMetrics = useMemo(
    () => metrics.filter((m) => m.account_id === activeAccount),
    [metrics, activeAccount]
  );

  const accountPosts = useMemo(
    () => posts.filter((p) => p.account_id === activeAccount),
    [posts, activeAccount]
  );

  const currentAccount = accounts.find((a) => a.id === activeAccount);

  if (!currentAccount) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <PortalHeader clientName={clientName} />

      {/* Account Tabs (if multiple) */}
      {accounts.length > 1 ? (
        <Tabs value={activeAccount} onValueChange={setActiveAccount} className="mt-8">
          <TabsList>
            {accounts.map((acc) => (
              <TabsTrigger key={acc.id} value={acc.id} className="gap-2">
                <PlatformIcon platform={acc.platform} />
                @{acc.handle}
              </TabsTrigger>
            ))}
          </TabsList>
          {accounts.map((acc) => (
            <TabsContent key={acc.id} value={acc.id} className="mt-6">
              <AccountSections
                account={acc}
                metrics={metrics.filter((m) => m.account_id === acc.id)}
                posts={posts.filter((p) => p.account_id === acc.id)}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <PlatformIcon platform={currentAccount.platform} />
            <div>
              <h2 className="text-lg font-semibold">@{currentAccount.handle}</h2>
              <p className="text-sm text-muted-foreground capitalize">{currentAccount.platform}</p>
            </div>
          </div>
          <AccountSections
            account={currentAccount}
            metrics={accountMetrics}
            posts={accountPosts}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t pt-6 pb-8 text-center">
        <p className="text-xs text-muted-foreground">
          Relatório gerado por{" "}
          <span className="font-semibold text-foreground">TBO</span>
          {" "}· Redes Sociais Gerenciadas
        </p>
      </footer>
    </div>
  );
}

/* ── Sub-components ── */

function PortalHeader({ clientName }: { clientName: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
          T
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {clientName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Dashboard de Redes Sociais
          </p>
        </div>
      </div>
    </div>
  );
}

function AccountSections({
  account,
  metrics,
  posts,
}: {
  account: RsmAccountRow;
  metrics: RsmMetricRow[];
  posts: RsmPostRow[];
}) {
  return (
    <div className="space-y-10">
      <RsmAccountDashboard account={account} metrics={metrics} />
      <RsmPostsDiagnostics account={account} metrics={metrics} posts={posts} />
      <RsmRecommendedActions account={account} metrics={metrics} posts={posts} />
    </div>
  );
}

function PlatformIcon({ platform }: { platform: string | null }) {
  if (platform === "instagram") {
    return <Instagram className="h-5 w-5 text-pink-500" />;
  }
  return (
    <Badge variant="outline" className="text-xs capitalize">
      {platform ?? "social"}
    </Badge>
  );
}
