"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { GateApprovalStatus } from "@/features/projects/services/d3d-enhancements";

interface D3DGateDecideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approverName: string | null;
  decision: "approved" | "rejected";
  feedback: string;
  onFeedbackChange: (value: string) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function D3DGateDecideDialog({
  open,
  onOpenChange,
  approverName,
  decision,
  feedback,
  onFeedbackChange,
  onConfirm,
  isPending,
}: D3DGateDecideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {decision === "approved"
              ? "Confirmar aprovacao do gate"
              : "Confirmar reprovacao do gate"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Aprovador:{" "}
            <span className="font-medium text-foreground">
              {approverName ?? "—"}
            </span>
          </p>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Feedback (opcional)</p>
            <Textarea
              placeholder="Justificativa ou observacoes..."
              value={feedback}
              onChange={(e) => onFeedbackChange(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant={decision === "approved" ? "default" : "destructive"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {decision === "approved"
              ? "Confirmar Aprovacao"
              : "Confirmar Reprovacao"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
