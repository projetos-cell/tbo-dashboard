"use client";

import {
  IconPencil,
  IconTrash,
  IconPin,
  IconPinnedOff,
  IconCornerUpRight,
  IconArrowForwardUp,
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

/** Detect if a message was sent as rich HTML (from Tiptap) */
function isHtmlContent(content: string): boolean {
  const trimmed = content.trimStart();
  return trimmed.startsWith("<p>") || trimmed.startsWith("<h") || trimmed.startsWith("<ul") || trimmed.startsWith("<ol") || trimmed.startsWith("<blockquote");
}

// ── Message Content (with mention rendering) ──────────────────────────

export function MessageContent({
  content,
  profileMap,
}: {
  content: string;
  profileMap: Record<string, ProfileInfo>;
}) {
  // Rich text (HTML from Tiptap)
  if (isHtmlContent(content)) {
    return (
      <span
        className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Plain text with @mentions
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

// Quick-react emojis for fast reactions
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙌"];

export function MessageMenu({
  canEdit,
  canDelete,
  canPin,
  isPinned,
  onEdit,
  onDelete,
  onTogglePin,
  onQuickReact,
  onReplyInThread,
  onForward,
}: {
  canEdit: boolean;
  canDelete: boolean;
  canPin: boolean;
  isPinned: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onQuickReact?: (emoji: string) => void;
  onReplyInThread?: () => void;
  onForward?: () => void;
}) {
  if (!canEdit && !canDelete && !canPin && !onQuickReact && !onReplyInThread && !onForward) {
    return null;
  }

  return (
    <div className="flex gap-0.5 rounded-md border bg-background p-0.5 shadow-sm">
      {/* Quick reactions */}
      {onQuickReact && (
        <div className="flex gap-0.5 border-r pr-0.5 mr-0.5">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onQuickReact(emoji)}
              className="h-7 w-7 flex items-center justify-center text-sm rounded hover:bg-accent transition-colors"
              title={`Reagir com ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      {onReplyInThread && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onReplyInThread}
          title="Responder na thread"
        >
          <IconCornerUpRight size={14} />
        </Button>
      )}
      {onForward && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onForward}
          title="Encaminhar mensagem"
        >
          <IconArrowForwardUp size={14} />
        </Button>
      )}
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
