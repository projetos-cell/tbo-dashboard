"use client";

import { useState } from "react";
import { IconSend } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DemandCommentComposerProps {
  onSubmit: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function DemandCommentComposer({
  onSubmit,
  disabled,
}: DemandCommentComposerProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escreva um comentario..."
        className="min-h-[60px] resize-none text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <Button
        size="icon"
        className="size-8 shrink-0"
        onClick={handleSubmit}
        disabled={!content.trim() || submitting || disabled}
        aria-label="Enviar comentario"
      >
        <IconSend className="size-3.5" />
      </Button>
    </div>
  );
}
