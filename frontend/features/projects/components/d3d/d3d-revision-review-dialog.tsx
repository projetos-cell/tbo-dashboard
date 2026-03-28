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
import type { RevisionStatus } from "@/features/projects/services/d3d-enhancements";

interface D3DRevisionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revisionNumber: number | null;
  status: RevisionStatus;
  feedback: string;
  onFeedbackChange: (value: string) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function D3DRevisionReviewDialog({
  open,
  onOpenChange,
  revisionNumber,
  status,
  feedback,
  onFeedbackChange,
  onConfirm,
  isPending,
}: D3DRevisionReviewDialogProps) {
  const isApproval = status === "approved";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isApproval ? "Aprovar revisao" : "Solicitar alteracoes"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {revisionNumber !== null && (
            <p className="text-sm text-muted-foreground">
              Revisao #{revisionNumber}
            </p>
          )}
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Feedback (opcional)</p>
            <Textarea
              placeholder="Descreva as alteracoes necessarias ou motivo da aprovacao..."
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
            variant={isApproval ? "default" : "destructive"}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isApproval ? "Confirmar Aprovacao" : "Solicitar Alteracoes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
