"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  IconPencil,
  IconTrash,
  IconPin,
  IconPinnedOff,
  IconCornerUpRight,
  IconArrowForwardUp,
  IconBookmark,
  IconMoodPlus,
  IconCheckbox,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

// ── #19 Reaction Emoji Picker ─────────────────────────────────────────

export function ReactionEmojiPicker({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [Picker, setPicker] = useState<React.ComponentType<Record<string, unknown>> | null>(null);
  const [emojiData, setEmojiData] = useState<unknown>(null);

  useEffect(() => {
    if (!open || Picker) return;
    let cancelled = false;
    Promise.all([import("@emoji-mart/react"), import("@emoji-mart/data")]).then(
      ([pickerMod, dataMod]) => {
        if (cancelled) return;
        setPicker(() => pickerMod.default);
        setEmojiData(dataMod.default);
      },
    );
    return () => { cancelled = true; };
  }, [open, Picker]);

  function handleSelect(emoji: { native?: string }) {
    if (emoji.native) {
      onSelect(emoji.native);
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title="Mais reações"
        >
          <IconMoodPlus size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-auto p-0 border-none shadow-lg z-50"
        sideOffset={8}
      >
        <div ref={pickerRef}>
          {Picker && emojiData ? (
            <Picker
              data={emojiData}
              onEmojiSelect={handleSelect}
              theme="auto"
              locale="pt"
              previewPosition="none"
              skinTonePosition="search"
              maxFrequentRows={2}
              perLine={8}
            />
          ) : (
            <div className="flex items-center justify-center h-[350px] w-[352px]">
              <span className="text-xs text-muted-foreground">Carregando...</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Code Block Rendering ───────────────────────────────────────────────

/** Parse plain-text content for code blocks and inline code, render as React nodes */
function renderWithCodeBlocks(content: string): React.ReactNode[] {
  // Split by code blocks (```) or inline code (`)
  const parts = content.split(/(```(?:\w*\n?)?[\s\S]*?```|`[^`\n]+`)/g);

  return parts.map((part, i) => {
    // Fenced code block: ```lang\ncode```
    if (part.startsWith("```")) {
      const match = /^```(\w*)\n?([\s\S]*?)```$/.exec(part);
      const lang = match?.[1] ?? "";
      const code = match?.[2] ?? part.slice(3, -3);
      return (
        <pre
          key={i}
          className="my-1.5 rounded-md border bg-muted/60 px-3 py-2 overflow-x-auto text-left"
        >
          {lang && (
            <span className="mb-1.5 block text-[10px] font-mono text-muted-foreground uppercase tracking-wide">
              {lang}
            </span>
          )}
          <code className="text-[13px] font-mono leading-relaxed text-foreground/90 whitespace-pre">
            {code.trimEnd()}
          </code>
        </pre>
      );
    }
    // Inline code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      const code = part.slice(1, -1);
      return (
        <code
          key={i}
          className="rounded bg-muted/60 px-1.5 py-0.5 text-[13px] font-mono text-foreground/90"
        >
          {code}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function hasCodeSyntax(content: string): boolean {
  return content.includes("```") || /`[^`\n]+`/.test(content);
}

/** Detect if a message was sent as rich HTML (from Tiptap) */
function isHtmlContent(content: string): boolean {
  const trimmed = content.trimStart();
  return trimmed.startsWith("<p>") || trimmed.startsWith("<h") || trimmed.startsWith("<ul") || trimmed.startsWith("<ol") || trimmed.startsWith("<blockquote");
}

// ── Message Content (with mention rendering) ──────────────────────────

export function MessageContent({
  content,
  profileMap,
  onMentionClick,
}: {
  content: string;
  profileMap: Record<string, ProfileInfo>;
  onMentionClick?: (userId: string) => void;
}) {
  // Rich text (HTML from Tiptap)
  if (isHtmlContent(content)) {
    return (
      <span
        className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    );
  }

  // Plain text — check for code blocks first
  if (hasCodeSyntax(content)) {
    return <>{renderWithCodeBlocks(content)}</>;
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
            role={!seg.isSpecial && onMentionClick ? "button" : undefined}
            tabIndex={!seg.isSpecial && onMentionClick ? 0 : undefined}
            onClick={() => {
              if (!seg.isSpecial && onMentionClick) onMentionClick(seg.userId);
            }}
            onKeyDown={(e) => {
              if (!seg.isSpecial && onMentionClick && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onMentionClick(seg.userId);
              }
            }}
            className={cn(
              "inline-flex items-center rounded bg-primary/10 px-1 py-0.5 text-xs font-medium text-primary",
              !seg.isSpecial && onMentionClick
                ? "cursor-pointer hover:bg-primary/20 transition-colors"
                : "cursor-default",
            )}
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
  onBookmark,
  isBookmarked,
  onCreateTask,
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
  onBookmark?: () => void;
  isBookmarked?: boolean;
  onCreateTask?: () => void;
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
          {/* #19 — expanded emoji picker */}
          <ReactionEmojiPicker onSelect={onQuickReact} />
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
      {/* #17 — bookmark */}
      {onBookmark && (
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 ${isBookmarked ? "text-primary" : ""}`}
          onClick={onBookmark}
          title={isBookmarked ? "Remover dos favoritos" : "Salvar mensagem"}
        >
          <IconBookmark size={14} className={isBookmarked ? "fill-primary" : ""} />
        </Button>
      )}
      {/* #43 — create task from message */}
      {onCreateTask && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onCreateTask}
          title="Criar tarefa a partir desta mensagem"
        >
          <IconCheckbox size={14} />
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
