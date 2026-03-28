"use client";

import { useState } from "react";
import {
  IconCheck,
  IconX,
  IconClock,
  IconAlertTriangle,
  IconChevronDown,
  IconChevronUp,
  IconMessageCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared";
import {
  useApprovalLog,
  useRespondToApproval,
} from "@/features/projects/hooks/use-portal";
import { PortalRespondDialog } from "./portal-respond-dialog";
import { toast } from "sonner";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PortalApprovalLog } from "@/features/projects/services/portal-interactions";

interface PortalApprovalTimelineProps {
  projectId: string;
  /** Internal users can approve/reject */
  canRespond?: boolean;
}

const STATUS_CONFIG = {
  pending: {
    label: "Aguardando",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/50",
    dot: "bg-amber-400",
    Icon: IconClock,
  },
  approved: {
    label: "Aprovado",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800/50",
    dot: "bg-green-500",
    Icon: IconCheck,
  },
  rejected: {
    label: "Reprovado",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800/50",
    dot: "bg-red-500",
    Icon: IconX,
  },
  overdue: {
    label: "Atrasado",
    color: "text-red-700",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-300 dark:border-red-700/60",
    dot: "bg-red-600",
    Icon: IconAlertTriangle,
  },
};

interface RespondDialogState {
  id: string;
  taskTitle: string | null;
  decision: "approved" | "rejected";
}

export function PortalApprovalTimeline({
  projectId,
  canRespond = false,
}: PortalApprovalTimelineProps) {
  const { data: approvals = [], isLoading } = useApprovalLog(projectId);
  const respond = useRespondToApproval(projectId);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<RespondDialogState | null>(null);
  const [feedback, setFeedback] = useState("");

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openDialog(
    approval: PortalApprovalLog,
    decision: "approved" | "rejected",
  ) {
    setDialog({
      id: approval.id,
      taskTitle: approval.task_title,
      decision,
    });
    setFeedback("");
  }

  function handleRespond() {
    if (!dialog) return;
    respond.mutate(
      {
        id: dialog.id,
        decision: dialog.decision,
        feedback: feedback.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success(
            dialog.decision === "approved" ? "Aprovado!" : "Reprovado",
          );
          setDialog(null);
        },
        onError: () => toast.error("Erro ao registrar resposta"),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <EmptyState
        title="Sem aprovacoes registradas"
        description="Aprovacoes solicitadas aparecerao aqui em linha do tempo."
        compact
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {approvals.map((approval, index) => {
          const isExpanded = expanded.has(approval.id);
          const effectiveStatus = approval.is_overdue
            ? "overdue"
            : approval.status;
          const conf = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.pending;
          const StatusIcon = conf.Icon;
          const deadline = new Date(approval.deadline_at);
          const deadlinePast = isPast(deadline);

          return (
            <div
              key={approval.id}
              className={`relative rounded-xl border p-4 transition-colors ${conf.bg} ${conf.border} ${
                effectiveStatus === "overdue" ? "ring-1 ring-red-400/40" : ""
              }`}
            >
              {/* Timeline connector */}
              {index < approvals.length - 1 && (
                <div className="absolute left-[1.625rem] top-full z-0 h-3 w-0.5 bg-border" />
              )}

              <div className="flex items-start gap-3">
                {/* Status icon */}
                <div
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full ${conf.dot} shadow-sm`}
                >
                  <StatusIcon className="size-3.5 text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug">
                        {approval.task_title ?? "Tarefa sem titulo"}
                      </p>
                      {approval.client_name && (
                        <p className="text-xs text-muted-foreground">
                          Solicitado para: {approval.client_name}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-[10px] ${conf.color} border-current/30`}
                    >
                      {conf.label}
                    </Badge>
                  </div>

                  {/* Dates */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>
                      Solicitado:{" "}
                      {format(new Date(approval.requested_at), "dd/MM/yyyy HH:mm")}
                    </span>
                    <span className={deadlinePast && !approval.responded_at ? "text-red-600 font-medium" : ""}>
                      Prazo:{" "}
                      {format(deadline, "dd/MM/yyyy HH:mm")}
                      {deadlinePast && !approval.responded_at && " (vencido)"}
                    </span>
                    {approval.responded_at && (
                      <span>
                        Respondido:{" "}
                        {formatDistanceToNow(new Date(approval.responded_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    )}
                  </div>

                  {/* Expandable feedback */}
                  {approval.feedback && (
                    <button
                      onClick={() => toggleExpand(approval.id)}
                      className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <IconMessageCircle className="size-3" />
                      Ver feedback
                      {isExpanded ? (
                        <IconChevronUp className="size-3" />
                      ) : (
                        <IconChevronDown className="size-3" />
                      )}
                    </button>
                  )}

                  {isExpanded && approval.feedback && (
                    <div className="mt-2 rounded-md border border-border/50 bg-card/60 p-2.5 text-xs text-muted-foreground">
                      {approval.feedback}
                    </div>
                  )}

                  {/* Action buttons for pending approvals */}
                  {canRespond && approval.status === "pending" && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 border-green-400/60 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
                        onClick={() => openDialog(approval, "approved")}
                      >
                        <IconCheck className="size-3.5" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 border-red-400/60 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        onClick={() => openDialog(approval, "rejected")}
                      >
                        <IconX className="size-3.5" />
                        Reprovar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Response dialog */}
      <PortalRespondDialog
        open={!!dialog}
        onOpenChange={(open) => !open && setDialog(null)}
        taskTitle={dialog?.taskTitle ?? null}
        decision={dialog?.decision ?? "approved"}
        feedback={feedback}
        onFeedbackChange={setFeedback}
        onConfirm={handleRespond}
        isPending={respond.isPending}
      />
    </>
  );
}
