"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LOSS_REASONS, type LossReasonValue } from "@/lib/constants";
import { IconAlertTriangle } from "@tabler/icons-react";

interface LossReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealName: string;
  onConfirm: (reason: LossReasonValue, details: string) => void;
}

export function LossReasonDialog({
  open,
  onOpenChange,
  dealName,
  onConfirm,
}: LossReasonDialogProps) {
  const [selectedReason, setSelectedReason] = useState<LossReasonValue | null>(null);
  const [details, setDetails] = useState("");

  function handleConfirm() {
    if (!selectedReason) return;
    onConfirm(selectedReason, details);
    setSelectedReason(null);
    setDetails("");
  }

  function handleCancel() {
    onOpenChange(false);
    setSelectedReason(null);
    setDetails("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-2 bg-red-50">
              <IconAlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <DialogTitle>Motivo da Perda</DialogTitle>
              <DialogDescription className="mt-0.5">
                Por que o deal &ldquo;{dealName}&rdquo; foi perdido?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-2">
            {LOSS_REASONS.map((reason) => (
              <button
                key={reason.value}
                type="button"
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                  selectedReason === reason.value
                    ? "border-red-400 bg-red-50 text-red-700 ring-1 ring-red-200"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
                onClick={() => setSelectedReason(reason.value)}
              >
                {reason.label}
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Detalhes adicionais (opcional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={!selectedReason}
            onClick={handleConfirm}
          >
            Confirmar Perda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
