"use client";

import { useState } from "react";
import { IconMessageCircle, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconCheck } from "@tabler/icons-react";
import { ReviewAnnotationThread } from "./review-annotation-thread";
import type { ReviewAnnotation } from "@/features/review/types";

interface ReviewViewerSidebarProps {
  annotations: ReviewAnnotation[];
  selectedPinId: string | null;
  newPin: { x: number; y: number } | null;
  newComment: string;
  showResolved: boolean;
  isCreating: boolean;
  currentUserId?: string;
  onNewCommentChange: (value: string) => void;
  onCreateAnnotation: () => void;
  onCancelNewPin: () => void;
  onSelectPin: (id: string | null) => void;
  onReply: (parentId: string, content: string) => void;
  onToggleResolved: (id: string, resolved: boolean) => void;
  onDelete: (id: string) => void;
  onShowResolvedChange: (value: boolean) => void;
}

export function ReviewViewerSidebar({
  annotations,
  selectedPinId,
  newPin,
  newComment,
  showResolved,
  isCreating,
  currentUserId,
  onNewCommentChange,
  onCreateAnnotation,
  onCancelNewPin,
  onSelectPin,
  onReply,
  onToggleResolved,
  onDelete,
  onShowResolvedChange,
}: ReviewViewerSidebarProps) {
  const rootAnnotations = annotations.filter((a) => !a.parent_id);
  const visibleAnnotations = showResolved
    ? rootAnnotations
    : rootAnnotations.filter((a) => !a.resolved);
  const unresolvedCount = rootAnnotations.filter((a) => !a.resolved).length;

  const selectedAnnotation = selectedPinId
    ? annotations.find((a) => a.id === selectedPinId)
    : null;

  return (
    <div className="w-80 border-l bg-background flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b">
        <div className="flex items-center gap-2">
          <IconMessageCircle className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Comentários</span>
          {unresolvedCount > 0 && (
            <Badge variant="secondary" className="h-5 text-[10px] px-1.5">
              {unresolvedCount}
            </Badge>
          )}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => onShowResolvedChange(e.target.checked)}
            className="rounded border-border"
          />
          Resolvidos
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* New pin form */}
        {newPin && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 p-3 space-y-2">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Novo comentário
            </p>
            <Textarea
              value={newComment}
              onChange={(e) => onNewCommentChange(e.target.value)}
              placeholder="Descreva a alteração necessária..."
              rows={3}
              className="text-xs resize-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onCreateAnnotation();
                }
              }}
            />
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                className="h-7 text-xs flex-1"
                disabled={!newComment.trim() || isCreating}
                onClick={onCreateAnnotation}
              >
                Comentar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={onCancelNewPin}
              >
                <IconX className="size-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Selected annotation thread */}
        {selectedAnnotation && !newPin && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Comentário selecionado</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px]"
                onClick={() => onSelectPin(null)}
              >
                Ver todos
              </Button>
            </div>
            <ReviewAnnotationThread
              annotation={selectedAnnotation}
              currentUserId={currentUserId}
              onReply={onReply}
              onToggleResolved={onToggleResolved}
              onDelete={(id) => {
                onDelete(id);
                onSelectPin(null);
              }}
            />
          </div>
        )}

        {/* All annotations list */}
        {!newPin && !selectedAnnotation && (
          <div className="space-y-2">
            {visibleAnnotations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                Clique na imagem para adicionar um comentário
              </p>
            ) : (
              visibleAnnotations.map((ann, i) => (
                <button
                  key={ann.id}
                  type="button"
                  className={cn(
                    "w-full text-left rounded-md border p-2.5 space-y-1 transition-colors hover:bg-muted/50",
                    ann.resolved && "opacity-60"
                  )}
                  onClick={() => onSelectPin(ann.id)}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex items-center justify-center size-5 rounded-full text-[9px] font-bold text-white shrink-0",
                        ann.resolved ? "bg-green-500" : "bg-orange-500"
                      )}
                    >
                      {ann.resolved ? <IconCheck className="size-2.5" /> : i + 1}
                    </span>
                    <span className="text-xs font-medium truncate">{ann.author_name}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                      {formatDistanceToNow(new Date(ann.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 pl-7">
                    {ann.content}
                  </p>
                  {ann.replies && ann.replies.length > 0 && (
                    <p className="text-[10px] text-muted-foreground pl-7">
                      {ann.replies.length} {ann.replies.length === 1 ? "resposta" : "respostas"}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
