"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PromotionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  fromLevelName?: string;
  toLevelName: string;
  pathName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PromotionConfirmDialog({
  open,
  onOpenChange,
  personName,
  fromLevelName,
  toLevelName,
  pathName,
  onConfirm,
  onCancel,
}: PromotionConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar promoção</AlertDialogTitle>
          <AlertDialogDescription>
            Você está promovendo <strong>{personName}</strong>{" "}
            {fromLevelName && (
              <>de <strong>{fromLevelName}</strong> </>
            )}
            para <strong>{toLevelName}</strong>{" "}
            no núcleo <strong>{pathName}</strong>.
            <br /><br />
            Esta ação será registrada no histórico de progressão.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Confirmar promoção
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
