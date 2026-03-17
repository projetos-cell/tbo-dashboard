"use client";

// Feature #39 — Lista de conteúdos pendentes com ação aprovar/rejeitar + campo de feedback
// Feature #40 — Histórico de aprovações com timeline de status

import { useState } from "react";
import {
  IconCheckbox,
  IconCheck,
  IconX,
  IconRotate,
  IconClock,
  IconMessage,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState, ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import {
  useContentApprovals,
  useUpdateApprovalStatus,
} from "@/features/marketing/hooks/use-marketing-content";
import type { ContentApproval } from "@/features/marketing/types/marketing";

const APPROVAL_STATUS: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: { label: "Pendente", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: IconClock },
  approved: { label: "Aprovado", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: IconCheck },
  rejected: { label: "Rejeitado", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: IconX },
  revision: {
    label: "Revisão",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    icon: IconRotate,
  },
};

// ── Feedback Dialog ──────────────────────────────────────────────────

interface FeedbackDialogProps {
  open: boolean;
  title: string;
  loading: boolean;
  onConfirm: (feedback: string) => void;
  onCancel: () => void;
}

function FeedbackDialog({ open, title, loading, onConfirm, onCancel }: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState("");

  const handleConfirm = () => {
    onConfirm(feedback);
    setFeedback("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Feedback (opcional)</Label>
          <Textarea
            placeholder="Descreva o motivo ou deixe comentários para o autor..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Approval row actions ─────────────────────────────────────────────

function ApprovalActions({ approval }: { approval: ContentApproval }) {
  const [dialog, setDialog] = useState<{
    status: ContentApproval["status"];
    title: string;
  } | null>(null);
  const updateStatus = useUpdateApprovalStatus();

  const act = (
    status: ContentApproval["status"],
    title: string,
    needsFeedback: boolean,
  ) => {
    if (needsFeedback) {
      setDialog({ status, title });
    } else {
      updateStatus.mutate({ id: approval.id, status });
    }
  };

  return (
    <>
      <div className="flex justify-end gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-green-600"
          disabled={updateStatus.isPending}
          title="Aprovar"
          onClick={() => act("approved", "Aprovar conteúdo", false)}
        >
          <IconCheck className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-amber-600"
          disabled={updateStatus.isPending}
          title="Solicitar revisão"
          onClick={() => act("revision", "Solicitar revisão", true)}
        >
          <IconRotate className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-red-600"
          disabled={updateStatus.isPending}
          title="Rejeitar"
          onClick={() => act("rejected", "Rejeitar conteúdo", true)}
        >
          <IconX className="h-4 w-4" />
        </Button>
      </div>

      {dialog && (
        <FeedbackDialog
          open
          title={dialog.title}
          loading={updateStatus.isPending}
          onConfirm={(feedback) => {
            updateStatus.mutate({ id: approval.id, status: dialog.status, feedback });
            setDialog(null);
          }}
          onCancel={() => setDialog(null)}
        />
      )}
    </>
  );
}

// ── Timeline item for history (#40) ─────────────────────────────────

function TimelineItem({
  approval,
  isLast,
}: {
  approval: ContentApproval;
  isLast: boolean;
}) {
  const st = APPROVAL_STATUS[approval.status];
  const StatusIcon = st?.icon ?? IconClock;

  return (
    <div className="flex gap-3">
      {/* Icon + line */}
      <div className="flex flex-col items-center">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: st?.bg ?? "transparent", color: st?.color ?? "currentColor" }}
        >
          <StatusIcon className="size-4" />
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-sm">{approval.content_title}</p>
            {approval.reviewer_name && (
              <p className="text-xs text-muted-foreground">{approval.reviewer_name}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <Badge
              variant="secondary"
              className="text-[11px]"
              style={{ backgroundColor: st?.bg, color: st?.color }}
            >
              {st?.label ?? approval.status}
            </Badge>
            {approval.reviewed_at && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {new Date(approval.reviewed_at).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        </div>

        {/* Feedback bubble */}
        {approval.feedback && (
          <div className="mt-2 flex items-start gap-1.5 rounded-md bg-muted/40 px-3 py-2">
            <IconMessage className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{approval.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

function AprovacoesContent() {
  const { data: approvals, isLoading, error, refetch } = useContentApprovals();

  const pending = (approvals ?? []).filter((a) => a.status === "pending");
  const history = (approvals ?? []).filter((a) => a.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Aprovações</h1>
        <p className="text-sm text-muted-foreground">
          Workflow de revisão e aprovação de conteúdo.
        </p>
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar aprovações." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : !approvals || approvals.length === 0 ? (
        <EmptyState
          icon={IconCheckbox}
          title="Nenhuma aprovação pendente"
          description="Aprovações de conteúdo aparecerão aqui quando conteúdos forem submetidos."
        />
      ) : (
        <>
          {/* Pending table */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Pendentes ({pending.length})
              </h2>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Conteúdo
                      </th>
                      <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                        Submetido
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pending.map((a) => (
                      <tr key={a.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{a.content_title}</td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {new Date(a.submitted_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3">
                          <ApprovalActions approval={a} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* History timeline (#40) */}
          {history.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Histórico ({history.length})
              </h2>
              <div className="pl-1">
                {history.map((a, i) => (
                  <TimelineItem key={a.id} approval={a} isLast={i === history.length - 1} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AprovacoesPage() {
  return (
    <RequireRole module="marketing">
      <AprovacoesContent />
    </RequireRole>
  );
}
