"use client";

import { useState } from "react";
import {
  IconMessageCircle,
  IconSend,
  IconTrash,
  IconLock,
  IconWorld,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared";
import { usePortalComments, useCreatePortalComment, useDeletePortalComment } from "@/features/projects/hooks/use-portal";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PortalCommentsSectionProps {
  projectId: string;
  /** If true the user is an internal team member and can see/post internal comments */
  isInternal?: boolean;
  /** Display name for the commenter (for external portal clients) */
  authorName?: string;
  /** Email for the commenter (for external portal clients) */
  authorEmail?: string;
  tenantId: string;
}

export function PortalCommentsSection({
  projectId,
  isInternal = false,
  authorName,
  authorEmail,
  tenantId,
}: PortalCommentsSectionProps) {
  const user = useAuthStore((s) => s.user);
  const [content, setContent] = useState("");
  const [isInternalComment, setIsInternalComment] = useState(false);

  const { data: allComments = [], isLoading } = usePortalComments(projectId);
  const createComment = useCreatePortalComment();
  const deleteComment = useDeletePortalComment(projectId);

  // External clients only see public comments; internal sees all
  const visibleComments = isInternal
    ? allComments
    : allComments.filter((c) => !c.is_internal);

  const resolvedAuthorName =
    authorName ?? user?.user_metadata?.name ?? user?.email ?? "Equipe";
  const resolvedAuthorEmail = authorEmail ?? user?.email ?? "";

  function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed) return;

    createComment.mutate(
      {
        tenant_id: tenantId,
        project_id: projectId,
        author_name: resolvedAuthorName,
        author_email: resolvedAuthorEmail,
        content: trimmed,
        is_internal: isInternal ? isInternalComment : false,
      },
      {
        onSuccess: () => {
          setContent("");
          toast.success("Comentario adicionado");
        },
        onError: () => {
          toast.error("Erro ao adicionar comentario");
        },
      },
    );
  }

  function handleDelete(id: string) {
    deleteComment.mutate(id, {
      onSuccess: () => toast.success("Comentario removido"),
      onError: () => toast.error("Erro ao remover comentario"),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <IconMessageCircle className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">
          Comentarios{" "}
          <span className="text-muted-foreground font-normal">
            ({visibleComments.length})
          </span>
        </h3>
      </div>

      {/* Comments list */}
      {visibleComments.length === 0 ? (
        <EmptyState
          title="Sem comentarios"
          description="Seja o primeiro a deixar um comentario neste projeto."
          compact
        />
      ) : (
        <div className="space-y-2">
          {visibleComments.map((comment) => (
            <div
              key={comment.id}
              className={`group relative rounded-lg border p-3 transition-colors ${
                comment.is_internal
                  ? "border-amber-200/60 bg-amber-50/40 dark:border-amber-800/40 dark:bg-amber-950/20"
                  : "border-border/50 bg-card hover:bg-accent/20"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium leading-none">
                      {comment.author_name}
                    </span>
                    {comment.is_internal && (
                      <Badge
                        variant="outline"
                        className="h-4 gap-1 border-amber-400/60 bg-amber-100/50 px-1.5 text-[10px] text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      >
                        <IconLock className="size-2.5" />
                        Interno
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
                {isInternal && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => handleDelete(comment.id)}
                    disabled={deleteComment.isPending}
                  >
                    <IconTrash className="size-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="space-y-2 rounded-lg border border-border/60 bg-card p-3">
        <Textarea
          placeholder="Escreva um comentario..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <div className="flex items-center justify-between">
          {isInternal && (
            <div className="flex items-center gap-2">
              <Switch
                id="internal-toggle"
                checked={isInternalComment}
                onCheckedChange={setIsInternalComment}
                className="scale-75"
              />
              <Label
                htmlFor="internal-toggle"
                className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground"
              >
                {isInternalComment ? (
                  <IconLock className="size-3" />
                ) : (
                  <IconWorld className="size-3" />
                )}
                {isInternalComment ? "Interno (so equipe)" : "Publico (cliente ve)"}
              </Label>
            </div>
          )}
          <div className="ml-auto">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim() || createComment.isPending}
              className="gap-1.5"
            >
              <IconSend className="size-3.5" />
              Comentar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
