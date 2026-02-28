"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  useOkrComments,
  useCreateOkrComment,
  useDeleteOkrComment,
} from "@/hooks/use-okrs";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";

interface OkrCommentsProps {
  objectiveId: string;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min atras`;
  if (diffHours < 24) return `${diffHours}h atras`;
  if (diffDays < 30) return `${diffDays}d atras`;
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function OkrComments({ objectiveId }: OkrCommentsProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const userEmail = useAuthStore((s) => s.user?.email);

  const { data: comments, isLoading } = useOkrComments({ objectiveId });
  const createComment = useCreateOkrComment();
  const deleteComment = useDeleteOkrComment();
  const { toast } = useToast();

  const [body, setBody] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd() {
    if (!body.trim() || !tenantId || !userId) return;

    try {
      await createComment.mutateAsync({
        tenant_id: tenantId,
        objective_id: objectiveId,
        author_id: userId,
        body: body.trim(),
      });
      setBody("");
      toast({ title: "Comentario adicionado" });
    } catch {
      toast({ title: "Erro ao adicionar comentario", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteComment.mutateAsync(id);
      setDeletingId(null);
      toast({ title: "Comentario excluido" });
    } catch {
      toast({ title: "Erro ao excluir comentario", variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Comentarios</h4>

      {/* Comment list */}
      {!comments || comments.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum comentario.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border bg-muted/30 p-3 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium truncate">
                    {c.author_id === userId
                      ? userEmail ?? c.author_id
                      : c.author_id}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatRelativeTime(c.created_at)}
                  </span>
                </div>

                {c.author_id === userId && (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center h-5 w-5 rounded hover:bg-muted shrink-0"
                    aria-label="Excluir comentario"
                    onClick={() => setDeletingId(c.id)}
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{c.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation AlertDialog */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(v) => { if (!v) setDeletingId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={deleteComment.isPending}
            >
              {deleteComment.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New comment */}
      <div className="space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="Escreva um comentario..."
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!body.trim() || createComment.isPending}
        >
          {createComment.isPending ? "Salvando..." : "Comentar"}
        </Button>
      </div>
    </div>
  );
}
