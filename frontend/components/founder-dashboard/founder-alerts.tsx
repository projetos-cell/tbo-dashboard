"use client";

import {
  AlertTriangle,
  TrendingDown,
  Users,
  Clock,
  BarChart3,
  Info,
  ShieldAlert,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { FounderAlert } from "@/services/founder-dashboard";

// ── Icon map ─────────────────────────────────────────────────────────────────

const ALERT_ICONS: Record<FounderAlert["type"], typeof AlertTriangle> = {
  margem: TrendingDown,
  runway: ShieldAlert,
  concentracao: Users,
  atraso: Clock,
  despesas: BarChart3,
};

const ALERT_COLORS: Record<FounderAlert["type"], string> = {
  margem: "text-red-600 dark:text-red-400",
  runway: "text-red-600 dark:text-red-400",
  concentracao: "text-amber-600 dark:text-amber-400",
  atraso: "text-orange-600 dark:text-orange-400",
  despesas: "text-amber-600 dark:text-amber-400",
};

const ALERT_BADGE: Record<FounderAlert["type"], "destructive" | "secondary"> = {
  margem: "destructive",
  runway: "destructive",
  concentracao: "secondary",
  atraso: "secondary",
  despesas: "secondary",
};

// ── Component ────────────────────────────────────────────────────────────────

interface FounderAlertsProps {
  alerts: FounderAlert[];
  isLoading?: boolean;
}

export function FounderAlerts({ alerts, isLoading }: FounderAlertsProps) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Alertas Estrategicos</h2>
          {!isLoading && alerts.length > 0 && (
            <Badge variant="destructive">{alerts.length}</Badge>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Informacoes do bloco"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 text-sm space-y-1" side="top">
            <p className="font-medium">Founder Radar</p>
            <p className="text-xs text-muted-foreground">
              Alertas sao regras de risco que mostram qual metrica disparou,
              valor atual e limiar.
            </p>
            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
              <li>Margem abaixo de 30% em algum projeto</li>
              <li>Runway abaixo de 3 meses</li>
              <li>Cliente &gt; 40% da receita</li>
              <li>Pagamentos atrasados &gt; 15 dias</li>
              <li>Despesas crescendo acima da receita</li>
            </ul>
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 mb-2">
            <ShieldAlert className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            Nenhum alerta no momento.
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Todos os indicadores estao dentro dos limiares.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, i) => {
            const Icon = ALERT_ICONS[alert.type] || AlertTriangle;
            const colorClass = ALERT_COLORS[alert.type] || "text-amber-600";
            const badgeVariant = ALERT_BADGE[alert.type] || "secondary";

            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-md border p-3 bg-muted/30"
              >
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${colorClass}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={badgeVariant} className="text-xs">
                      Atual: {formatAlertValue(alert)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Limiar: {formatAlertThreshold(alert)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Value formatting ─────────────────────────────────────────────────────────

function formatAlertValue(alert: FounderAlert): string {
  switch (alert.type) {
    case "margem":
      return `${alert.value.toFixed(1)}%`;
    case "runway":
      return `${alert.value.toFixed(1)} meses`;
    case "concentracao":
      return `${alert.value.toFixed(1)}%`;
    case "atraso":
      return `${alert.value} dias`;
    case "despesas":
      return `${alert.value.toFixed(1)}%`;
    default:
      return String(alert.value);
  }
}

function formatAlertThreshold(alert: FounderAlert): string {
  switch (alert.type) {
    case "margem":
      return `${alert.threshold}%`;
    case "runway":
      return `${alert.threshold} meses`;
    case "concentracao":
      return `${alert.threshold}%`;
    case "atraso":
      return `${alert.threshold} dias`;
    case "despesas":
      return `${alert.threshold}%`;
    default:
      return String(alert.threshold);
  }
}
