"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconChartBar } from "@tabler/icons-react";

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Nunca";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Agora";
  if (mins < 60) return `Ha ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Ha ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Ha ${days}d`;
}

interface SyncMetricsProps {
  data:
    | {
        totalSyncs: number;
        successRate: number;
        errorCount: number;
        fireflies: { meetings_created: number | null; started_at: string | null } | null;
      }
    | undefined;
  isLoading: boolean;
}

export function SyncMetrics({ data, isLoading }: SyncMetricsProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <IconChartBar className="h-4 w-4 text-gray-500" />
        Metricas de Sincronizacao
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Sincronizacoes Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.totalSyncs ?? 0}</div>
                <p className="text-xs text-gray-500 mt-1">Ultimas 50 sincronizacoes</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{data?.successRate ?? 100}%</div>
                <p className="text-xs text-gray-500 mt-1">Disponibilidade recente</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Erros Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div
                  className={`text-2xl font-bold ${(data?.errorCount ?? 0) > 0 ? "text-red-500" : ""}`}
                >
                  {data?.errorCount ?? 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Erros de sincronizacao</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Fireflies</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {data?.fireflies
                    ? `${data.fireflies.meetings_created ?? 0} reunioes`
                    : "--"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {data?.fireflies
                    ? `Ultimo sync: ${timeAgo(data.fireflies.started_at)}`
                    : "Sem dados de sync"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
