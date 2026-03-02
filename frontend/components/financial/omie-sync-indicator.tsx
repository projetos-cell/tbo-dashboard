"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useOmieSyncLogs } from "@/hooks/use-omie-sync";
import type { OmieSyncLog } from "@/services/omie-sync";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min atras`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atras`;
  const days = Math.floor(hours / 24);
  return `${days}d atras`;
}

export function OmieSyncIndicator() {
  const { data: logs } = useOmieSyncLogs();
  const lastLog = logs?.[0] as OmieSyncLog | undefined;

  // Find the last successful sync (success or partial)
  const lastSuccess = logs?.find(
    (l: OmieSyncLog) => l.status === "success" || l.status === "partial"
  ) as OmieSyncLog | undefined;

  if (!lastLog) {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Omie: sem sync
      </Badge>
    );
  }

  // Currently running a sync
  if (lastLog.status === "running") {
    return (
      <Badge variant="default" className="text-xs">
        <Clock className="mr-1 h-3 w-3 animate-spin" />
        Omie: sincronizando...
      </Badge>
    );
  }

  // Last entry was error, but there IS a recent successful sync — show success with subtle note
  if (lastLog.status === "error" && lastSuccess) {
    return (
      <Badge variant="secondary" className="text-xs">
        <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
        Omie: {timeAgo(lastSuccess.finished_at ?? lastSuccess.started_at)}
      </Badge>
    );
  }

  // Last entry was error and NO successful sync found
  if (lastLog.status === "error") {
    return (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Omie: erro na sync
      </Badge>
    );
  }

  // Success or partial
  return (
    <Badge variant="secondary" className="text-xs">
      <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
      Omie: {timeAgo(lastLog.finished_at ?? lastLog.started_at)}
    </Badge>
  );
}
