"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconCircleCheck, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ReviewAnnotation } from "@/features/review/types";

interface ReviewAnnotationThreadProps {
  annotation: ReviewAnnotation;
  currentUserId?: string;
  onReply: (parentId: string, content: string) => void;
  onToggleResolved: (id: string, resolved: boolean) => void;
  onDelete: (id: string) => void;
  isReplying?: boolean;
}

export function ReviewAnnotationThread({
  annotation,
  currentUserId,
  onReply,
  onToggleResolved,
  onDelete,
  isReplying: isReplyingProp = false,
}: ReviewAnnotationThreadProps) {
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(isReplyingProp);

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReply(annotation.id, replyText.trim());
    setReplyText("");
    setShowReplyInput(false);
  };

  return (
    <div className="space-y-3">
      {/* Main annotation */}
      <div className="rounded-lg border p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium truncate">{annotation.author_name}</span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {formatDistanceToNow(new Date(annotation.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
        <p className="text-sm">{annotation.content}</p>
        <div className="flex items-center gap-1.5 pt-1">
          <Button
            size="sm"
            variant={annotation.resolved ? "secondary" : "outline"}
            className="h-6 text-[10px] gap-1"
            onClick={() => onToggleResolved(annotation.id, !annotation.resolved)}
          >
            <IconCircleCheck className="size-3" />
            {annotation.resolved ? "Reabrir" : "Resolver"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[10px]"
            onClick={() => setShowReplyInput((v) => !v)}
          >
            Responder
          </Button>
          {currentUserId === annotation.author_id && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-[10px] text-red-500 hover:text-red-600 ml-auto"
              onClick={() => onDelete(annotation.id)}
            >
              <IconTrash className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Replies */}
      {annotation.replies && annotation.replies.length > 0 && (
        <div className="ml-4 space-y-2 border-l pl-3">
          {annotation.replies.map((reply) => (
            <div key={reply.id} className="rounded-md border p-2.5 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium truncate">{reply.author_name}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(reply.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      {showReplyInput && (
        <div className={cn("ml-4 border-l pl-3 space-y-2")}>
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escreva uma resposta..."
            rows={2}
            className="text-xs resize-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmitReply();
              }
            }}
          />
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              className="h-7 text-xs flex-1"
              disabled={!replyText.trim()}
              onClick={handleSubmitReply}
            >
              Responder
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => {
                setShowReplyInput(false);
                setReplyText("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
