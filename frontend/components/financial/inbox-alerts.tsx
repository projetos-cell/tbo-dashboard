"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Info } from "lucide-react";
import type { InboxAlert } from "@/services/financial";

const SEVERITY_CONFIG = {
  danger: { icon: AlertTriangle, iconColor: "text-red-500", badgeBg: "rgba(239,68,68,0.12)", badgeColor: "#ef4444" },
  warning: { icon: Clock, iconColor: "text-yellow-500", badgeBg: "rgba(245,158,11,0.12)", badgeColor: "#f59e0b" },
  info: { icon: Info, iconColor: "text-blue-500", badgeBg: "rgba(59,130,246,0.12)", badgeColor: "#3b82f6" },
} as const;

interface InboxAlertsProps {
  alerts: InboxAlert[];
}

export function InboxAlerts({ alerts }: InboxAlertsProps) {
  if (!alerts.length) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum alerta pendente. Tudo em dia!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const cfg = SEVERITY_CONFIG[alert.severity];
        return (
          <Card key={alert.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <cfg.icon className={`h-5 w-5 shrink-0 ${cfg.iconColor}`} />
              <span className="flex-1 text-sm font-medium">{alert.label}</span>
              <Badge
                variant="secondary"
                style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeColor }}
              >
                {alert.count}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
