"use client";

import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  TrendingDown,
  Users,
  Clock,
  BarChart3,
  Info,
  ShieldAlert,
} from "lucide-react";
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

const ALERT_BADGE_VARIANT: Record<FounderAlert["type"], "destructive" | "secondary"> = {
  margem: "destructive",
  runway: "destructive",
  concentracao: "secondary",
  atraso: "secondary",
  despesas: "secondary",
};

// ── Inline badge ──────────────────────────────────────────────────────────────

function AlertBadge({
  variant,
  children,
  className = "",
}: {
  variant: "destructive" | "secondary";
  children: React.ReactNode;
  className?: string;
}) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  const colors =
    variant === "destructive"
      ? "bg-red-500/10 text-red-500"
      : "bg-gray-100 text-gray-500";
  return <span className={`${base} ${colors} ${className}`}>{children}</span>;
}

// ── Component ────────────────────────────────────────────────────────────────

interface FounderAlertsProps {
  alerts: FounderAlert[];
  isLoading?: boolean;
}

export function FounderAlerts({ alerts, isLoading }: FounderAlertsProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tooltipOpen) return;
    function handleClick(e: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setTooltipOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [tooltipOpen]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Alertas Estratégicos</h2>
          {!isLoading && alerts.length > 0 && (
            <AlertBadge variant="destructive">{alerts.length}</AlertBadge>
          )}
        </div>

        {/* Tooltip info */}
        <div ref={tooltipRef} className="relative">
          <button
            type="button"
            onClick={() => setTooltipOpen((v) => !v)}
            className="flex h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Informações do bloco"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
          {tooltipOpen && (
            <div className="absolute right-0 bottom-full mb-2 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-lg p-3 space-y-1">
              <p className="text-sm font-medium text-gray-900">Founder Radar</p>
              <p className="text-xs text-gray-500">
                Alertas são regras de risco que mostram qual métrica disparou,
                valor atual e limiar.
              </p>
              <ul className="text-xs text-gray-500 list-disc pl-4 space-y-0.5">
                <li>Margem abaixo de 30% em algum projeto</li>
                <li>Runway abaixo de 3 meses</li>
                <li>Cliente &gt; 40% da receita</li>
                <li>Pagamentos atrasados &gt; 15 dias</li>
                <li>Despesas crescendo acima da receita</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-12 w-full" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 mb-2">
            <ShieldAlert className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-sm text-gray-500">
            Nenhum alerta no momento.
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Todos os indicadores estão dentro dos limiares.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, i) => {
            const Icon = ALERT_ICONS[alert.type] || AlertTriangle;
            const colorClass = ALERT_COLORS[alert.type] || "text-amber-600";
            const badgeVariant = ALERT_BADGE_VARIANT[alert.type] || "secondary";
            const isOverdue = alert.type === "atraso" && alert.client != null;

            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-md border border-gray-200 p-3 bg-gray-100/30"
              >
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${colorClass}`} />
                <div className="flex-1 min-w-0">
                  {isOverdue ? (
                    <>
                      <p className="text-sm font-medium">
                        Recebível atrasado — {fmtBRL(alert.valor ?? 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Cliente: {alert.client} &middot; Atraso: {alert.diasAtraso ?? 0} dias
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <AlertBadge variant="destructive" className="text-xs">
                          {fmtBRL(alert.valor ?? 0)}
                        </AlertBadge>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-md bg-orange-600 px-2.5 py-0.5 text-xs font-medium text-white hover:bg-orange-700 transition-colors"
                          onClick={() => {
                            // TODO: integrate with billing/collection flow
                            window.alert(
                              `Ação: cobrar cliente "${alert.client}" — ${fmtBRL(alert.valor ?? 0)}`
                            );
                          }}
                        >
                          Cobrar Cliente
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <AlertBadge variant={badgeVariant} className="text-xs">
                          Atual: {formatAlertValue(alert)}
                        </AlertBadge>
                        <span className="text-xs text-gray-500">
                          Limiar: {formatAlertThreshold(alert)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Currency formatting ──────────────────────────────────────────────────

function fmtBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
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
