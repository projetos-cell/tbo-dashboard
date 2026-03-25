"use client";

import { useRef, useEffect } from "react";
import { IconSparkles, IconUser, IconArrowLeft, IconTrash } from "@tabler/icons-react";
import type { ChatMessage } from "@/features/academy/hooks/use-ai-chat";
import { AIChatInput } from "./AIChatInput";
import { cn } from "@/lib/utils";

interface AIChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  onSendMessage: (content: string) => void;
  onBack: () => void;
  onClear: () => void;
}

function MarkdownContent({ content }: { content: string }) {
  // Simple markdown: bold, italic, code blocks, inline code, lists, headers
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLanguage = "";

  function formatInline(text: string): React.ReactNode {
    // Process inline formatting: **bold**, *italic*, `code`, [links]
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(remaining.slice(0, boldMatch.index));
        }
        parts.push(
          <strong key={key++} className="font-semibold">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
        continue;
      }

      // Inline code
      const codeMatch = remaining.match(/`(.+?)`/);
      if (codeMatch && codeMatch.index !== undefined) {
        if (codeMatch.index > 0) {
          parts.push(remaining.slice(0, codeMatch.index));
        }
        parts.push(
          <code
            key={key++}
            className="rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
        continue;
      }

      parts.push(remaining);
      break;
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={i}
            className="my-2 overflow-x-auto rounded-lg bg-muted/80 p-3 text-sm font-mono"
          >
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="mt-3 mb-1 text-sm font-semibold">
          {formatInline(line.slice(4))}
        </h4>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="mt-3 mb-1 text-base font-semibold">
          {formatInline(line.slice(3))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h2 key={i} className="mt-3 mb-1 text-lg font-bold">
          {formatInline(line.slice(2))}
        </h2>
      );
      continue;
    }

    // Lists
    if (line.match(/^[-*] /)) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-sm leading-relaxed">
          {formatInline(line.slice(2))}
        </li>
      );
      continue;
    }
    if (line.match(/^\d+\. /)) {
      const numEnd = line.indexOf(". ");
      elements.push(
        <li key={i} className="ml-4 list-decimal text-sm leading-relaxed">
          {formatInline(line.slice(numEnd + 2))}
        </li>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm leading-relaxed">
        {formatInline(line)}
      </p>
    );
  }

  // Flush unclosed code block
  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre
        key="code-final"
        className="my-2 overflow-x-auto rounded-lg bg-muted/80 p-3 text-sm font-mono"
      >
        <code>{codeLines.join("\n")}</code>
      </pre>
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function MessageBubble({
  message,
  isLastAssistant,
  isStreaming,
}: {
  message: ChatMessage;
  isLastAssistant: boolean;
  isStreaming: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary/10 text-primary"
            : "bg-gradient-to-br from-[#b8f724]/20 to-[#0a1f1d]/20 text-[#b8f724] dark:text-[#b8f724]"
        )}
      >
        {isUser ? (
          <IconUser className="h-4 w-4" />
        ) : (
          <IconSparkles className="h-4 w-4" />
        )}
      </div>

      {/* Message */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary/50 text-foreground"
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : message.content ? (
          <MarkdownContent content={message.content} />
        ) : isLastAssistant && isStreaming ? (
          <div className="flex items-center gap-1.5 py-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#b8f724]/60" />
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#b8f724]/60 [animation-delay:150ms]" />
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#b8f724]/60 [animation-delay:300ms]" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AIChatPanel({
  messages,
  isStreaming,
  error,
  onSendMessage,
  onBack,
  onClear,
}: AIChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1"
        >
          <IconArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <IconSparkles className="h-4 w-4 text-[#b8f724]" />
            TAI
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            disabled={isStreaming}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1"
          >
            <IconTrash className="h-3.5 w-3.5" />
            Limpar
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {messages.map((msg, i) => (
          <MessageBubble
            key={`${msg.role}-${i}`}
            message={msg}
            isLastAssistant={
              msg.role === "assistant" && i === messages.length - 1
            }
            isStreaming={isStreaming}
          />
        ))}

        {error && (
          <div className="mx-auto max-w-md rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => {
                const lastUserMsg = [...messages]
                  .reverse()
                  .find((m) => m.role === "user");
                if (lastUserMsg) onSendMessage(lastUserMsg.content);
              }}
              className="mt-2 text-xs text-muted-foreground underline hover:text-foreground"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/50 px-4 py-4">
        <AIChatInput onSubmit={onSendMessage} />
      </div>
    </div>
  );
}
