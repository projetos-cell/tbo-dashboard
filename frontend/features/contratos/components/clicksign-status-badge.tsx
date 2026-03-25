"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconPlugConnected, IconPlugConnectedX, IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import { useClicksignHealth } from "../hooks/use-clicksign-health";

interface ClicksignStatusBadgeProps {
  /** Compact mode shows only icon */
  compact?: boolean;
}

export function ClicksignStatusBadge({ compact = false }: ClicksignStatusBadgeProps) {
  const { data, isLoading, isError } = useClicksignHealth();

  if (isLoading) {
    return (
      <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground">
        <IconLoader2 className="h-3 w-3 animate-spin" />
        {!compact && "Verificando..."}
      </Badge>
    );
  }

  if (isError || !data) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="text-[10px] gap-1 text-amber-600 border-amber-200">
              <IconAlertTriangle className="h-3 w-3" />
              {!compact && "Indisponivel"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Nao foi possivel verificar o status do Clicksign</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const configs = {
    connected: {
      icon: IconPlugConnected,
      label: data.environment === "sandbox" ? "Sandbox" : "Conectado",
      className: "text-emerald-600 border-emerald-200 bg-emerald-500/10",
      tooltip: `${data.message}${data.latencyMs ? ` (${data.latencyMs}ms)` : ""}`,
    },
    error: {
      icon: IconPlugConnectedX,
      label: "Erro",
      className: "text-red-600 border-red-200 bg-red-500/10",
      tooltip: data.message,
    },
    not_configured: {
      icon: IconAlertTriangle,
      label: "Nao Configurado",
      className: "text-amber-600 border-amber-200 bg-amber-500/10",
      tooltip: data.message,
    },
  };

  const config = configs[data.status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`text-[10px] gap-1 cursor-default ${config.className}`}
          >
            <Icon className="h-3 w-3" />
            {!compact && config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
