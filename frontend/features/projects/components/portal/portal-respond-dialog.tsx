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

interface PortalRespondDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string | null;
  decision: "approved" | "rejected";
  feedback: string;
  onFeedbackChange: (value: string) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function PortalRespondDialog({
  open,
  onOpenChange,
  taskTitle,
  decision,
  feedback,
  onFeedbackChange,
  onConfirm,
  isPending,
}: PortalRespondDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {decision === "approved"
              ? "Confirmar aprovacao"
              : "Confirmar reprovacao"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {taskTitle && (
            <p className="text-sm text-muted-foreground">
              Tarefa:{" "}
              <span className="font-medium text-foreground">{taskTitle}</span>
            </p>
          )}
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Feedback (opcional)</p>
            <Textarea
              placeholder="Deixe um comentario sobre a decisao..."
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
