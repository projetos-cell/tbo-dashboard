"use client";

import { IconCalendarClock, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { MessageRow } from "@/features/chat/services/chat";

interface ScheduledMessagesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: MessageRow[];
  isLoading: boolean;
  onCancel: (messageId: string) => void;
}

export function ScheduledMessagesPanel({
  open,
  onOpenChange,
  messages,
  isLoading,
  onCancel,
}: ScheduledMessagesPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-base">
            <IconCalendarClock size={18} />
            Mensagens agendadas
            {messages.length > 0 && (
              <span className="ml-auto text-xs text-muted-foreground font-normal">
                {messages.length} pendente{messages.length > 1 ? "s" : ""}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma mensagem agendada
            </p>
          ) : (
            messages.map((msg) => {
              const scheduledAt = (msg as Record<string, unknown>).scheduled_at as string | null;
              return (
                <div
                  key={msg.id}
                  className="flex flex-col gap-1 rounded-lg border bg-muted/30 p-3"
                >
                  <p className="text-sm line-clamp-3 text-foreground">{msg.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {scheduledAt
                        ? format(new Date(scheduledAt), "dd/MM 'às' HH:mm", { locale: ptBR })
                        : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => onCancel(msg.id)}
                      title="Cancelar agendamento"
                    >
                      <IconTrash size={12} />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
