"use client";

import { IconHistory } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessageEditHistory } from "../hooks/use-message-edit-history";
import { MessageContent } from "./message-bubble-parts";
import type { ProfileInfo } from "../utils/profile-utils";

interface MessageEditHistoryDialogProps {
  messageId: string | null;
  currentContent: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileMap?: Record<string, ProfileInfo>;
}

export function MessageEditHistoryDialog({
  messageId,
  currentContent,
  open,
  onOpenChange,
  profileMap = {},
}: MessageEditHistoryDialogProps) {
  const { data: history, isLoading } = useMessageEditHistory(open ? messageId : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <IconHistory size={16} />
            Histórico de edições
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="flex flex-col gap-3 pr-2">
            {/* Current version */}
            <HistoryEntry
              content={currentContent}
              label="Versão atual"
              isCurrent
              profileMap={profileMap}
            />

            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-md" />
              ))
            ) : !history?.length ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                Sem versões anteriores registradas
              </p>
            ) : (
              history.map((entry, i) => (
                <HistoryEntry
                  key={entry.id}
                  content={entry.content}
                  label={`Versão ${history.length - i}`}
                  date={entry.edited_at}
                  profileMap={profileMap}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function HistoryEntry({
  content,
  label,
  date,
  isCurrent,
  profileMap,
}: {
  content: string;
  label: string;
  date?: string;
  isCurrent?: boolean;
  profileMap: Record<string, ProfileInfo>;
}) {
  const timeStr = date
    ? new Date(date).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className={`rounded-md border p-3 ${isCurrent ? "border-primary/30 bg-primary/5" : "bg-muted/30"}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
        {isCurrent && (
          <span className="text-[10px] rounded-full bg-primary/15 text-primary px-1.5 py-0.5 font-medium">
            atual
          </span>
        )}
        {timeStr && (
          <span className="text-[10px] text-muted-foreground ml-auto">{timeStr}</span>
        )}
      </div>
      <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
        <MessageContent content={content} profileMap={profileMap} />
      </p>
    </div>
  );
}
