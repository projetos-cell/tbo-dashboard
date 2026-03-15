"use client";

import { useState, useRef, useEffect } from "react";
import { IconX, IconSend, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { MessageRow } from "@/features/chat/services/chat";
import type { ProfileInfo } from "@/features/chat/utils/profile-utils";
import { getInitials } from "@/features/chat/utils/profile-utils";
import { getUserColor } from "@/features/chat/utils/chat-colors";
import { MessageContent } from "./message-bubble-parts";
import { useThreadMessages, useSendThreadReply } from "@/features/chat/hooks/use-chat";
import { useAuthStore } from "@/stores/auth-store";

interface ThreadPanelProps {
  parentMessage: MessageRow;
  channelId: string;
  profileMap: Record<string, ProfileInfo>;
  currentUserId: string | undefined;
  onClose: () => void;
}

function ThreadMessage({
  msg,
  profileMap,
  currentUserId,
}: {
  msg: MessageRow;
  profileMap: Record<string, ProfileInfo>;
  currentUserId: string | undefined;
}) {
  const sender = msg.sender_id ? profileMap[msg.sender_id] : undefined;
  const isOwn = msg.sender_id === currentUserId;
  const time = new Date(msg.created_at ?? "").toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex items-start gap-2 px-4 py-1.5 hover:bg-muted/50 transition-colors",
        isOwn && "flex-row-reverse",
      )}
    >
      <Avatar size="sm" className="mt-0.5 shrink-0">
        {sender?.avatarUrl && <AvatarImage src={sender.avatarUrl} alt={sender.name} />}
        <AvatarFallback>{getInitials(sender?.name ?? "U")}</AvatarFallback>
      </Avatar>
      <div className={cn("flex flex-col min-w-0 max-w-[80%]", isOwn && "items-end")}>
        <div className={cn("flex items-baseline gap-2 mb-0.5", isOwn && "flex-row-reverse")}>
          <span className={cn("text-xs font-semibold", getUserColor(msg.sender_id ?? ""))}>
            {sender?.name ?? "Usuário"}
          </span>
          <span className="text-[10px] text-muted-foreground">{time}</span>
        </div>
        <div className="rounded-lg bg-muted/60 px-3 py-1.5 text-sm leading-relaxed break-words">
          <MessageContent content={msg.content ?? ""} profileMap={profileMap} />
        </div>
      </div>
    </div>
  );
}

export function ThreadPanel({
  parentMessage,
  channelId,
  profileMap,
  currentUserId,
  onClose,
}: ThreadPanelProps) {
  const [replyContent, setReplyContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const userId = useAuthStore((s) => s.user?.id);
  const sendReply = useSendThreadReply();
  const { data: threadMessages = [], isLoading } = useThreadMessages(parentMessage.id);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages.length]);

  const parentSender = parentMessage.sender_id ? profileMap[parentMessage.sender_id] : undefined;
  const parentTime = new Date(parentMessage.created_at ?? "").toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  function handleSendReply() {
    const trimmed = replyContent.trim();
    if (!trimmed || !userId) return;
    sendReply.mutate({
      channel_id: channelId,
      sender_id: userId,
      content: trimmed,
      message_type: "text",
      reply_to: parentMessage.id,
    });
    setReplyContent("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  }

  return (
    <div className="flex flex-col h-full w-72 xl:w-80 border-l bg-background shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div>
          <h3 className="text-sm font-semibold">Thread</h3>
          <p className="text-[11px] text-muted-foreground">
            {threadMessages.length} {threadMessages.length === 1 ? "resposta" : "respostas"}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <IconX size={16} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Parent message */}
        <div className="px-4 py-3">
          <div className="flex items-start gap-2">
            <Avatar size="sm" className="mt-0.5 shrink-0">
              {parentSender?.avatarUrl && (
                <AvatarImage src={parentSender.avatarUrl} alt={parentSender.name} />
              )}
              <AvatarFallback>{getInitials(parentSender?.name ?? "U")}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className={cn("text-sm font-semibold", getUserColor(parentMessage.sender_id ?? ""))}>
                  {parentSender?.name ?? "Usuário"}
                </span>
                <span className="text-[10px] text-muted-foreground">{parentTime}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                <MessageContent content={parentMessage.content ?? ""} profileMap={profileMap} />
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Reply count */}
        {threadMessages.length > 0 && (
          <div className="px-4 pt-2 pb-1">
            <span className="text-xs text-muted-foreground font-medium">
              {threadMessages.length} {threadMessages.length === 1 ? "resposta" : "respostas"}
            </span>
          </div>
        )}

        {/* Replies */}
        {isLoading ? (
          <div className="flex justify-center py-4">
            <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : threadMessages.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
            Seja o primeiro a responder nesta thread
          </div>
        ) : (
          <div className="py-2">
            {threadMessages.map((msg) => (
              <ThreadMessage
                key={msg.id}
                msg={msg}
                profileMap={profileMap}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply input */}
      <div className="border-t p-3 shrink-0">
        <div className="flex items-end gap-2 rounded-xl border bg-background px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Responder na thread... (Enter para enviar)"
            className="min-h-[36px] max-h-24 flex-1 resize-none border-0 bg-transparent p-1 text-sm shadow-none focus-visible:ring-0"
            rows={1}
          />
          <Button
            type="button"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg"
            onClick={handleSendReply}
            disabled={!replyContent.trim() || sendReply.isPending}
          >
            <IconSend size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
