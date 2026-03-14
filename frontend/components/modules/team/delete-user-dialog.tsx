"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
      // Toast de erro tratado pelo mutation hook
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
          <AlertDialogDescription className="text-center space-y-2">
            <span>
              Tem certeza que deseja excluir{" "}
              <strong>{member.full_name}</strong> ({member.email})?
            </span>
            <span className="block text-xs text-destructive/80">
              Esta acao remove permanentemente o perfil, historico, acessos e
              conta de autenticacao. Nao pode ser desfeita.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMember.isPending}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteMember.isPending}
          >
            {deleteMember.isPending ? "Excluindo..." : "Sim, excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
