"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconFileText } from "@tabler/icons-react";

interface ProposalConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealName: string;
  onCreateProposal: () => void;
  onSkip: () => void;
}

export function ProposalConfirmDialog({
  open,
  onOpenChange,
  dealName,
  onCreateProposal,
  onSkip,
}: ProposalConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-2 bg-blue-50">
              <IconFileText className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <DialogTitle>Criar Proposta?</DialogTitle>
              <DialogDescription className="mt-0.5">
                O deal &ldquo;{dealName}&rdquo; entrou no estagio de proposta.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-sm text-gray-600 py-2">
          Deseja criar uma proposta comercial vinculada a este deal?
        </p>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onSkip}>
            Nao, apenas mover
          </Button>
          <Button onClick={onCreateProposal}>
            Criar Proposta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
