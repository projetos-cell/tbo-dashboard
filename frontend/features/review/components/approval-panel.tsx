"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  IconCheck,
  IconX,
  IconMessage,
  IconChevronDown,
  IconChevronUp,
  IconUserCircle,
} from "@tabler/icons-react";
import { useReviewApprovals, useSubmitApproval } from "@/features/review/hooks/use-review-approvals";
import { APPROVAL_STATUS_CONFIG } from "@/features/review/constants";
import { useAuthStore } from "@/stores/auth-store";
import { hasPermission } from "@/lib/permissions";

interface ApprovalPanelProps {
  versionId: string;
}

export function ApprovalPanel({ versionId }: ApprovalPanelProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const canApprove = hasPermission(role, "review.approve");

  const { data: approvals = [], isLoading } = useReviewApprovals(versionId);
  const submitApproval = useSubmitApproval(versionId);

  const myApproval = approvals.find((a) => a.user_id === user?.id);
  const approvedCount = approvals.filter((a) => a.status === "approved").length;
  const totalCount = approvals.length;

  const handleSubmit = (status: "approved" | "rejected" | "changes_requested") => {
    submitApproval.mutate(
      { status, notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          setNotes("");
        },
      }
    );
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm font-medium hover:bg-accent transition-colors">
          <div className="flex items-center gap-2">
            <IconCheck className="h-4 w-4 text-muted-foreground" />
            <span>Aprovações</span>
            {totalCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {approvedCount}/{totalCount}
              </Badge>
            )}
          </div>
          {open ? (
            <IconChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <IconChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 rounded-lg border bg-card p-4 space-y-4">
          {/* Existing approvals list */}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : approvals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma aprovação registrada.</p>
          ) : (
            <div className="space-y-2">
              {approvals.map((approval) => {
                const cfg = APPROVAL_STATUS_CONFIG[approval.status];
                return (
                  <div
                    key={approval.id}
                    className="flex items-start gap-3 rounded-md border px-3 py-2"
                  >
                    <IconUserCircle className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium truncate">{approval.user_name}</span>
                        <Badge
                          style={{
                            backgroundColor: cfg.bg,
                            color: cfg.color,
                            border: `1px solid ${cfg.color}40`,
                          }}
                          className="text-xs px-1.5"
                        >
                          {cfg.label}
                        </Badge>
                      </div>
                      {approval.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {approval.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action area for current user */}
          {canApprove && (
            <div className="border-t pt-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {myApproval ? "Atualizar minha aprovação" : "Registrar minha decisão"}
              </p>
              <Textarea
                placeholder="Notas opcionais..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="text-sm resize-none"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-green-500/40 text-green-600 hover:bg-green-50 hover:border-green-500 dark:hover:bg-green-950"
                  disabled={submitApproval.isPending}
                  onClick={() => handleSubmit("approved")}
                >
                  <IconCheck className="mr-1 h-3.5 w-3.5" />
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-orange-500/40 text-orange-600 hover:bg-orange-50 hover:border-orange-500 dark:hover:bg-orange-950"
                  disabled={submitApproval.isPending}
                  onClick={() => handleSubmit("changes_requested")}
                >
                  <IconMessage className="mr-1 h-3.5 w-3.5" />
                  Alterações
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-500/40 text-red-600 hover:bg-red-50 hover:border-red-500 dark:hover:bg-red-950"
                  disabled={submitApproval.isPending}
                  onClick={() => handleSubmit("rejected")}
                >
                  <IconX className="mr-1 h-3.5 w-3.5" />
                  Rejeitar
                </Button>
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
