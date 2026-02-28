"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AlertItem } from "@/services/dashboard";
import {
  AlertTriangle,
  Clock,
  PauseCircle,
  Target,
  FileWarning,
} from "lucide-react";

interface Props {
  alerts: AlertItem[];
}

const ALERT_ICONS: Record<string, React.ElementType> = {
  overdue_task: Clock,
  stalled_project: PauseCircle,
  okr_at_risk: Target,
  overdue_demand: FileWarning,
};

const SEVERITY_STYLES: Record<string, string> = {
  high: "border-red-200 bg-red-50/50",
  medium: "border-amber-200 bg-amber-50/50",
  low: "border-blue-200 bg-blue-50/50",
};

const SEVERITY_BADGE: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-700",
};

export function AlertsPanel({ alerts }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          Alertas ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm font-medium text-green-600">
              Tudo em ordem!
            </p>
            <p className="text-xs text-muted-foreground">
              Nenhum alerta no momento
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {alerts.map((alert) => {
              const Icon = ALERT_ICONS[alert.type] || AlertTriangle;
              return (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2 transition-colors hover:opacity-80 ${SEVERITY_STYLES[alert.severity]}`}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.detail}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`shrink-0 text-xs ${SEVERITY_BADGE[alert.severity]}`}
                  >
                    {alert.severity === "high" ? "Alto" : alert.severity === "medium" ? "Medio" : "Baixo"}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
