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
import { IconAlertTriangle } from "@tabler/icons-react";
import { useDeleteTeamMember } from "@/hooks/use-team";
import type { TeamMember } from "@/schemas/team";

type DeleteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
};

export function DeleteUserDialog({
  open,
  onOpenChange,
  member,
}: DeleteUserDialogProps) {
  const deleteMember = useDeleteTeamMember();

  async function handleConfirm() {
    if (!member) return;
    try {
      await deleteMember.mutateAsync(member.id);
      onOpenChange(false);
    } catch {
      // Error handling via toast/boundary
    }
  }

  if (!member) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <IconAlertTriangle size={24} className="text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">
            Excluir membro
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Tem certeza que deseja excluir{" "}
            <strong>{member.full_name}</strong> ({member.email})? Esta acao
            remove o acesso permanentemente e nao pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteMember.isPending}
          >
            {deleteMember.isPending ? "Excluindo..." : "Sim, excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
