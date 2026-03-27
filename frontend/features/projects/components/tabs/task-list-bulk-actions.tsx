"use client";

import { IconTrash } from "@tabler/icons-react";
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

interface TaskListBulkActionsProps {
  count: number;
  totalCount: number;
  confirmOpen: boolean;
  onConfirmOpenChange: (open: boolean) => void;
  onBulkDelete: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export function TaskListBulkActions({
  count,
  totalCount,
  confirmOpen,
  onConfirmOpenChange,
  onBulkDelete,
  onSelectAll,
  onClearSelection,
}: TaskListBulkActionsProps) {
  return (
    <>
      {/* Multi-select floating toolbar */}
      {count > 1 && (
        <div className="sticky top-0 z-30 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 shadow-sm backdrop-blur-sm">
          <span className="text-sm font-medium">{count} tarefas selecionadas</span>
          <button
            type="button"
            className="flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
            onClick={() => onConfirmOpenChange(true)}
          >
            <IconTrash className="size-3" /> Excluir
          </button>
          <div className="flex-1" />
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={onSelectAll}
          >
            Selecionar todas ({totalCount})
          </button>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={onClearSelection}
          >
            Limpar
          </button>
        </div>
      )}

      {/* Bulk delete confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={onConfirmOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {count} tarefas?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. As tarefas selecionadas serão excluídas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir {count} tarefas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
