"use client";

import { RequireRole } from "@/components/auth/require-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Database as DatabaseIcon,
  RefreshCcw,
  Mic,
  HardDrive,
  Activity,
  AlertTriangle,
  BarChart3,
  Server,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { useSystemHealth } from "@/hooks/use-system-health";
import type { Database } from "@/lib/supabase/types";

type SyncLogRow = Database["public"]["Tables"]["sync_logs"]["Row"];

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleString("pt-BR");
}

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

type ServiceStatus = "operational" | "degraded" | "down" | "unknown";

function deriveStatus(lastStatus: string | null, isActive: boolean): ServiceStatus {
  if (!isActive) return "down";
  if (!lastStatus) return "unknown";
  if (lastStatus === "success" || lastStatus === "completed") return "operational";
  if (lastStatus === "error" || lastStatus === "failed") return "degraded";
  return "operational";
}

const STATUS_CONFIG: Record<
  ServiceStatus,
  { dot: string; badge: "default" | "secondary" | "destructive" | "outline"; label: string }
> = {
  operational: { dot: "bg-green-500", badge: "default", label: "Operacional" },
  degraded: { dot: "bg-yellow-500", badge: "secondary", label: "Degradado" },
  down: { dot: "bg-red-500", badge: "destructive", label: "Inativo" },
  unknown: { dot: "bg-gray-400", badge: "outline", label: "Desconhecido" },
};

const PROVIDER_ICONS: Record<string, React.ElementType> = {
  notion: RefreshCcw,
  fireflies: Mic,
  omie: DatabaseIcon,
  reportei: BarChart3,
  storage: HardDrive,
};

function SystemHealthContent() {
  const { data, isLoading, error } = useSystemHealth();

  const integrations = data?.integrations ?? [];
  const recentErrors = data?.errors ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
        <p className="text-sm text-muted-foreground">
          Monitoramento e status dos servicos e integracoes.
        </p>
      </div>

      {/* Service Status Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex flex-col items-center gap-3 py-5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Supabase status card (always shown) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <DatabaseIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Supabase</p>
                  <p className="text-xs text-muted-foreground">Operacional</p>
                </div>
                <p className="text-[10px] text-muted-foreground/70">
                  Verificado: Agora
                </p>
              </CardContent>
            </Card>

            {/* Dynamic integration cards */}
            {integrations.map((integ) => {
              const status = deriveStatus(integ.lastSyncStatus, integ.isActive);
              const config = STATUS_CONFIG[status];
              const Icon = PROVIDER_ICONS[integ.provider.toLowerCase()] ?? Activity;
              return (
                <Card key={integ.provider}>
                  <CardContent className="flex flex-col items-center gap-3 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium capitalize">{integ.provider}</p>
                      <p className="text-xs text-muted-foreground">{config.label}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground/70">
                      Ultimo sync: {timeAgo(integ.lastSyncAt)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}

            {/* Show placeholders if less than 4 integrations */}
            {integrations.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-5">
                  <Activity className="h-5 w-5 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    Nenhuma integracao configurada
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Specific Sync Status */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Metricas de Sincronizacao
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Sincronizacoes Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.totalSyncs ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ultimas 50 sincronizacoes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Taxa de Sucesso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.successRate ?? 100}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Disponibilidade recente
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Erros Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${(data?.errorCount ?? 0) > 0 ? "text-red-500" : ""}`}>
                    {data?.errorCount ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Erros de sincronizacao
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Fireflies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.fireflies
                      ? `${data.fireflies.meetings_created ?? 0} reunioes`
                      : "--"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data?.fireflies
                      ? `Ultimo sync: ${timeAgo(data.fireflies.started_at)}`
                      : "Sem dados de sync"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Last Errors Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          Ultimos Erros
        </h2>
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentErrors.length === 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servico</TableHead>
                    <TableHead>Erro</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <CheckCircle2 className="mb-2 h-8 w-8 text-green-500/60" />
                        <p className="text-sm text-muted-foreground">
                          Nenhum erro registrado recentemente.
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Todos os servicos estao operando normalmente.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servico</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentErrors.map((err) => (
                    <TableRow key={err.id}>
                      <TableCell className="capitalize font-medium">
                        {err.provider}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {err.entity_type ?? "sync"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(err.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Erro
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SystemHealthPage() {
  return (
    <RequireRole allowed={["founder"]} module="system-health">
      <SystemHealthContent />
    </RequireRole>
  );
}
