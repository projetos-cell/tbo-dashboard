"use client";

import { useState } from "react";
import { IconSend } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@/components/shared/rich-text-editor").then((m) => ({ default: m.RichTextEditor })),
  { ssr: false, loading: () => <div className="h-[80px] animate-pulse rounded-md bg-muted" /> }
);
import { useMentionProvider } from "@/features/tasks/hooks/use-mention-provider";
import type { Database } from "@/lib/supabase/types";

export type Comment = Database["public"]["Tables"]["project_comments"]["Row"] & {
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── CommentComposer ─────────────────────────────────────────────────────────

export function CommentComposer({
  taskId: _taskId, // eslint-disable-line @typescript-eslint/no-unused-vars
  userId,
  onSubmit,
  parentId,
  onCancel,
  autoFocus,
}: {
  taskId: string;
  userId?: string;
  onSubmit: (content: string) => Promise<unknown>;
  parentId?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const mentionProvider = useMentionProvider();

  const handleSubmit = async (html?: string) => {
    const value = html || content;
    const clean = value === "<p></p>" ? "" : value.trim();
    if (!clean || !userId) return;
    setSubmitting(true);
    try {
      await onSubmit(clean);
      setContent("");
      onCancel?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder={parentId ? "Responder..." : "Escreva um comentario..."}
          minimal
          toolbar={false}
          mentionProvider={mentionProvider}
          autoFocus={autoFocus}
          onSubmit={handleSubmit}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Button
          size="icon"
          className="size-8"
          onClick={() => handleSubmit()}
          disabled={(!content.trim() || content === "<p></p>") || submitting}
          aria-label="Enviar comentario"
        >
          <IconSend className="size-3.5" />
        </Button>
        {onCancel && (
          <Button size="icon" variant="ghost" className="size-8" onClick={onCancel} aria-label="Cancelar">
            ✕
          </Button>
        )}
      </div>
    </div>
  );
}
