"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useTicketComments, useCreateComment } from "@/features/helpdesk/hooks/use-helpdesk";
import { toast } from "sonner";
import { IconSend } from "@tabler/icons-react";

interface TicketCommentsProps {
  ticketId: string;
}

export function TicketComments({ ticketId }: TicketCommentsProps) {
  const [body, setBody] = useState("");
  const userId = useAuthStore((s) => s.user?.id);
  const { data: comments = [], isLoading } = useTicketComments(ticketId);
  const createComment = useCreateComment();

  const handleSubmit = async () => {
    if (!body.trim() || !userId) return;
    try {
      await createComment.mutateAsync({
        ticket_id: ticketId,
        author_id: userId,
        body: body.trim(),
      });
      setBody("");
    } catch {
      toast.error("Erro ao enviar comentário");
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Respostas</h4>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && comments.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          Nenhuma resposta ainda. Seja o primeiro a comentar.
        </p>
      )}

      {!isLoading && comments.map((c) => {
        const timeLabel = formatDistanceToNow(new Date(c.created_at), {
          locale: ptBR,
          addSuffix: true,
        });
        return (
          <div key={c.id} className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={c.author?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(c.author?.full_name ?? "?")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">
                  {c.author?.full_name ?? "Usuário"}
                </span>
                <span className="text-[11px] text-muted-foreground">{timeLabel}</span>
                {c.is_internal && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                    Interno
                  </span>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/80">
                {c.body}
              </p>
            </div>
          </div>
        );
      })}

      {/* Reply box */}
      <div className="pt-2 border-t space-y-2">
        <Textarea
          placeholder="Escreva uma resposta..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="resize-none text-sm"
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!body.trim() || createComment.isPending}
          className="gap-1.5"
        >
          <IconSend className="h-4 w-4" />
          Enviar
        </Button>
      </div>
    </div>
  );
}
