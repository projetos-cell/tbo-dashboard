"use client";

import { useState, useRef, useEffect } from "react";
import {
  IconSend,
  IconAt,
  IconMoodSmile,
  IconPaperclip,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface ChatMessage {
  id: string;
  sender_type: string; // "client" | "team"
  sender_name: string | null;
  content: string;
  created_at: string;
}

interface PortalChatPanelProps {
  messages: ChatMessage[];
  clientName: string | null;
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PortalChatPanel({
  messages,
  clientName,
  onSendMessage,
  isLoading = false,
}: PortalChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage?.(trimmed);
    setInput("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold text-zinc-900">Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-xs text-zinc-400">
              Inicie uma conversa com a equipe do projeto
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isClient = msg.sender_type === "client";
          return (
            <div
              key={msg.id}
              className={cn("flex gap-2.5", isClient && "flex-row-reverse")}
            >
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarFallback
                  className={cn(
                    "text-[10px] font-medium",
                    isClient ? "bg-orange-100 text-orange-700" : "bg-zinc-100 text-zinc-600"
                  )}
                >
                  {getInitials(msg.sender_name)}
                </AvatarFallback>
              </Avatar>
              <div className={cn("max-w-[75%]", isClient && "text-right")}>
                <div
                  className={cn(
                    "inline-block rounded-xl px-3.5 py-2 text-sm",
                    isClient
                      ? "rounded-br-sm bg-orange-600 text-white"
                      : "rounded-bl-sm bg-zinc-100 text-zinc-800"
                  )}
                >
                  {msg.content}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <span>{msg.sender_name ?? (isClient ? "Voce" : "Equipe")}</span>
                  <span>·</span>
                  <span>
                    {formatDistanceToNow(new Date(msg.created_at), {
                      addSuffix: false,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-3">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Adicionar mensagem..."
            className="flex-1 text-sm"
          />
          <div className="flex items-center gap-0.5">
            <button type="button" className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
              <IconAt className="h-4 w-4" />
            </button>
            <button type="button" className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
              <IconMoodSmile className="h-4 w-4" />
            </button>
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim()}
              className="ml-1 h-8 w-8 rounded-full p-0"
            >
              <IconSend className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
