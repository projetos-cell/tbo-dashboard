"use client";

import Link from "next/link";
import {
  IconAlertTriangle,
  IconAlertCircle,
  IconInfoCircle,
  IconArrowRight,
} from "@tabler/icons-react";
import type { AlertItem } from "@/features/dashboard/services/dashboard";

const SEVERITY_CONFIG = {
  high: {
    icon: IconAlertTriangle,
    dot: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-50/50 dark:bg-red-950/10",
  },
  medium: {
    icon: IconAlertCircle,
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50/50 dark:bg-amber-950/10",
  },
  low: {
    icon: IconInfoCircle,
    dot: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50/50 dark:bg-blue-950/10",
  },
};

interface AlertsCardProps {
  alerts: AlertItem[];
}

export function AlertsCard({ alerts }: AlertsCardProps) {
  const highCount = alerts.filter((a) => a.severity === "high").length;

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">Alertas</p>
          {highCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {highCount}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{alerts.length} total</span>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
          Nenhum alerta ativo
        </div>
      ) : (
        <div className="flex-1 space-y-1.5 overflow-y-auto">
          {alerts.slice(0, 6).map((alert) => {
            const cfg = SEVERITY_CONFIG[alert.severity];
            return (
              <Link
                key={alert.id}
                href={alert.href}
                className={`flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted/60 ${cfg.bg}`}
              >
                <div className={`mt-0.5 size-1.5 shrink-0 rounded-full ${cfg.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{alert.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{alert.detail}</p>
                </div>
                <IconArrowRight className="size-3 shrink-0 text-muted-foreground/50 mt-0.5" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
