"use client";

import { RequireRole } from "@/features/auth/components/require-role";
import { useSystemHealth } from "@/hooks/use-system-health";
import { ErrorState } from "@/components/shared";
import { ServiceCards } from "./components/service-cards";
import { SyncMetrics } from "./components/sync-metrics";
import { ErrorTable } from "./components/error-table";

function SystemHealthContent() {
  const { data, isLoading, error, refetch } = useSystemHealth();

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  const integrations = data?.integrations ?? [];
  const recentErrors = data?.errors ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
        <p className="text-sm text-gray-500">
          Monitoramento e status dos servicos e integracoes.
        </p>
      </div>

      <ServiceCards integrations={integrations} isLoading={isLoading} />

      {!isLoading && (
        <SyncMetrics data={data} isLoading={isLoading} />
      )}

      <ErrorTable errors={recentErrors} isLoading={isLoading} />
    </div>
  );
}

export default function SystemHealthPage() {
  return (
    <RequireRole minRole="admin" module="system-health">
      <SystemHealthContent />
    </RequireRole>
  );
}
