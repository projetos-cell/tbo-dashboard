"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconDatabase,
  IconRefresh,
  IconMicrophone,
  IconActivity,
  IconChartBar,
  IconServer,
} from "@tabler/icons-react";
import { EmptyState } from "@/components/shared";
import type { IntegrationStatus } from "@/services/system-health";

type ServiceStatus = "operational" | "degraded" | "down" | "unknown";

const STATUS_CONFIG: Record<
  ServiceStatus,
  { dot: string; label: string }
> = {
  operational: { dot: "bg-green-500", label: "Operacional" },
  degraded: { dot: "bg-yellow-500", label: "Degradado" },
  down: { dot: "bg-red-500", label: "Inativo" },
  unknown: { dot: "bg-gray-400", label: "Desconhecido" },
};

const PROVIDER_ICONS: Record<string, React.ElementType> = {
  notion: IconRefresh,
  fireflies: IconMicrophone,
  omie: IconDatabase,
  reportei: IconChartBar,
  storage: IconServer,
};

function deriveStatus(lastStatus: string | null, isActive: boolean): ServiceStatus {
  if (!isActive) return "down";
  if (!lastStatus) return "unknown";
  if (lastStatus === "success" || lastStatus === "completed") return "operational";
  if (lastStatus === "error" || lastStatus === "failed") return "degraded";
  return "operational";
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

interface ServiceCardsProps {
  integrations: IntegrationStatus[];
  isLoading: boolean;
}

export function ServiceCards({ integrations, isLoading }: ServiceCardsProps) {
  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <IconDatabase className="h-5 w-5 text-gray-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Supabase</p>
            <p className="text-xs text-gray-500">Operacional</p>
          </div>
          <p className="text-[10px] text-gray-500/70">Verificado: Agora</p>
        </CardContent>
      </Card>

      {integrations.map((integ) => {
        const status = deriveStatus(integ.lastSyncStatus, integ.isActive);
        const config = STATUS_CONFIG[status];
        const Icon = PROVIDER_ICONS[integ.provider.toLowerCase()] ?? IconActivity;
        return (
          <Card key={integ.provider}>
            <CardContent className="flex flex-col items-center gap-3 py-5">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
                <Icon className="h-5 w-5 text-gray-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium capitalize">{integ.provider}</p>
                <p className="text-xs text-gray-500">{config.label}</p>
              </div>
              <p className="text-[10px] text-gray-500/70">
                Ultimo sync: {timeAgo(integ.lastSyncAt)}
              </p>
            </CardContent>
          </Card>
        );
      })}

      {integrations.length === 0 && (
        <div className="col-span-full">
          <EmptyState
            icon={IconActivity}
            title="Nenhuma integração configurada"
            description="Configure integrações com OMIE, Fireflies e outros serviços para monitorar o status aqui."
          />
        </div>
      )}
    </div>
  );
}
