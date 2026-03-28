"use client";

import { IconCheck, IconX, IconClock } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { D3DGateApproval, GateApprovalStatus } from "@/features/projects/services/d3d-enhancements";

const STATUS_CONFIG: Record<GateApprovalStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = {
  pending: {
    label: "Aguardando",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/50",
    Icon: IconClock,
  },
  approved: {
    label: "Aprovado",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800/50",
    Icon: IconCheck,
  },
  rejected: {
    label: "Reprovado",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800/50",
    Icon: IconX,
  },
};

interface D3DApproverRowProps {
  approval: D3DGateApproval;
  canManage?: boolean;
  onApprove: (approval: D3DGateApproval) => void;
  onReject: (approval: D3DGateApproval) => void;
}

export function D3DApproverRow({
  approval,
  canManage,
  onApprove,
  onReject,
}: D3DApproverRowProps) {
  const conf = STATUS_CONFIG[approval.status];
  const StatusIcon = conf.Icon;
  const hasDeadline = !!approval.deadline;
  const deadlinePast = hasDeadline && isPast(new Date(approval.deadline!));

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${conf.bg} ${conf.border}`}>
      <div
        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
          approval.status === "approved"
            ? "bg-green-500"
            : approval.status === "rejected"
              ? "bg-red-500"
              : "bg-amber-400"
        }`}
      >
        <StatusIcon className="size-3 text-white" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">
            {approval.approver_name ?? "Aprovador sem nome"}
          </span>
          {approval.approver_email && (
            <span className="text-xs text-muted-foreground">{approval.approver_email}</span>
          )}
          <Badge variant="outline" className={`text-[10px] ${conf.color} border-current/30`}>
            {conf.label}
          </Badge>
        </div>

        {hasDeadline && (
          <p className={`mt-0.5 text-xs ${deadlinePast && approval.status === "pending" ? "font-medium text-red-600" : "text-muted-foreground"}`}>
            Prazo: {format(new Date(approval.deadline!), "dd/MM/yyyy HH:mm")}
            {deadlinePast && approval.status === "pending" && " (vencido)"}
          </p>
        )}

        {approval.decided_at && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Decidido{" "}
            {formatDistanceToNow(new Date(approval.decided_at), { addSuffix: true, locale: ptBR })}
          </p>
        )}

        {approval.feedback && (
          <p className="mt-1 rounded bg-background/60 px-2 py-1 text-xs text-muted-foreground">
            {approval.feedback}
          </p>
        )}
      </div>

      {canManage && approval.status === "pending" && (
        <div className="flex shrink-0 gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 border-green-400/60 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
            onClick={() => onApprove(approval)}
          >
            <IconCheck className="size-3.5" />
            Aprovar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 border-red-400/60 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            onClick={() => onReject(approval)}
          >
            <IconX className="size-3.5" />
            Reprovar
          </Button>
        </div>
      )}
    </div>
  );
}
