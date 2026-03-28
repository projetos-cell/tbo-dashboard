"use client";

import { useState } from "react";
import {
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconShieldCheck,
  IconUserPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared";
import {
  useGateApprovals,
  useCreateGateApproval,
  useUpdateGateApproval,
} from "@/features/projects/hooks/use-d3d-enhanced";
import { D3DGateDecideDialog } from "./d3d-gate-decide-dialog";
import { D3DAddApproverInlineForm } from "./d3d-add-approver-form";
import { D3DApproverRow } from "./d3d-approver-row";
import { toast } from "sonner";
import type { D3DGateApproval } from "@/features/projects/services/d3d-enhancements";

interface D3DGateApprovalPanelProps {
  stageId: string;
  flowId: string;
  tenantId: string;
  canManage?: boolean;
}

interface DecideDialogState {
  approval: D3DGateApproval;
  decision: "approved" | "rejected";
}

export function D3DGateApprovalPanel({
  stageId,
  flowId,
  tenantId,
  canManage = true,
}: D3DGateApprovalPanelProps) {
  const { data: approvals = [], isLoading } = useGateApprovals(stageId);
  const createApproval = useCreateGateApproval();
  const updateApproval = useUpdateGateApproval(stageId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [decideDialog, setDecideDialog] = useState<DecideDialogState | null>(null);
  const [feedback, setFeedback] = useState("");

  const allApproved = approvals.length > 0 && approvals.every((a) => a.status === "approved");
  const hasRejected = approvals.some((a) => a.status === "rejected");
  const pendingCount = approvals.filter((a) => a.status === "pending").length;

  function handleAddApprover(values: { name: string; email: string; deadline: string }) {
    createApproval.mutate(
      {
        tenant_id: tenantId,
        flow_id: flowId,
        stage_id: stageId,
        approver_name: values.name,
        approver_email: values.email || null,
        deadline: values.deadline || null,
      },
      {
        onSuccess: () => {
          setShowAddForm(false);
          toast.success("Aprovador adicionado");
        },
        onError: () => toast.error("Erro ao adicionar aprovador"),
      },
    );
  }

  function handleDecide() {
    if (!decideDialog) return;
    updateApproval.mutate(
      {
        id: decideDialog.approval.id,
        status: decideDialog.decision,
        feedback: feedback.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success(decideDialog.decision === "approved" ? "Gate aprovado!" : "Gate reprovado");
          setDecideDialog(null);
          setFeedback("");
        },
        onError: () => toast.error("Erro ao registrar decisao"),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconShieldCheck className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">
              Aprovadores do Gate{" "}
              <span className="text-muted-foreground font-normal">({approvals.length})</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {allApproved && (
              <Badge className="gap-1 bg-green-500 text-white hover:bg-green-600">
                <IconCheck className="size-3" />
                Gate Liberado
              </Badge>
            )}
            {hasRejected && !allApproved && (
              <Badge variant="destructive" className="gap-1">
                <IconAlertCircle className="size-3" />
                Reprovado
              </Badge>
            )}
            {pendingCount > 0 && !hasRejected && (
              <Badge variant="outline" className="gap-1 border-amber-400/60 text-amber-600">
                <IconClock className="size-3" />
                {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        {approvals.length === 0 ? (
          <EmptyState
            title="Nenhum aprovador"
            description="Adicione aprovadores para liberar este gate do pipeline."
            compact
          />
        ) : (
          <div className="space-y-2">
            {approvals.map((approval) => (
              <D3DApproverRow
                key={approval.id}
                approval={approval}
                canManage={canManage}
                onApprove={(a) => setDecideDialog({ approval: a, decision: "approved" })}
                onReject={(a) => setDecideDialog({ approval: a, decision: "rejected" })}
              />
            ))}
          </div>
        )}

        {canManage && !showAddForm && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowAddForm(true)}
          >
            <IconUserPlus className="size-4" />
            Adicionar aprovador
          </Button>
        )}
        {canManage && showAddForm && (
          <D3DAddApproverInlineForm
            onSubmit={handleAddApprover}
            onCancel={() => setShowAddForm(false)}
            isPending={createApproval.isPending}
          />
        )}
      </div>

      <D3DGateDecideDialog
        open={!!decideDialog}
        onOpenChange={(open) => {
          if (!open) {
            setDecideDialog(null);
            setFeedback("");
          }
        }}
        approverName={decideDialog?.approval.approver_name ?? null}
        decision={decideDialog?.decision ?? "approved"}
        feedback={feedback}
        onFeedbackChange={setFeedback}
        onConfirm={handleDecide}
        isPending={updateApproval.isPending}
      />
    </>
  );
}
