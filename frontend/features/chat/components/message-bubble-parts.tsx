"use client";

import {
  IconPencil,
  IconTrash,
  IconPin,
  IconPinnedOff,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
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
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";
import { parseMentions } from "./mention-popup";

// ── Message Content (with mention rendering) ──────────────────────────

export function MessageContent({
  content,
  profileMap,
}: {
  content: string;
  profileMap: Record<string, ProfileInfo>;
}) {
  if (!content.includes("<@")) {
    return <>{content}</>;
  }

  const segments = parseMentions(content, profileMap);
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <span key={i}>{seg.value}</span>
        ) : (
          <span
            key={i}
            className="inline-flex items-center rounded bg-primary/10 px-1 py-0.5 text-xs font-medium text-primary cursor-default"
          >
            @{seg.name}
          </span>
        ),
      )}
    </>
  );
}

// ── Context Menu ──────────────────────────────────────────────────────

export function MessageMenu({
  canEdit,
  canDelete,
  canPin,
  isPinned,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  canEdit: boolean;
  canDelete: boolean;
  canPin: boolean;
  isPinned: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  if (!canEdit && !canDelete && !canPin) return null;

  return (
    <div className="flex gap-0.5 rounded-md border bg-background p-0.5 shadow-sm">
      {canPin && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onTogglePin}
          title={isPinned ? "Desafixar" : "Fixar"}
        >
          {isPinned ? <IconPinnedOff size={14} /> : <IconPin size={14} />}
        </Button>
      )}
      {canEdit && (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
          <IconPencil size={14} />
        </Button>
      )}
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <IconTrash size={14} />
        </Button>
      )}
    </div>
  );
}

// ── Delete Confirmation Dialog ────────────────────────────────────────

export function MessageDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir mensagem</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. A mensagem será removida para todos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
