"use client";

import { useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  onTyping?: () => void;
}

export function MessageInput({ onSend, disabled, onTyping }: MessageInputProps) {
  const [content, setContent] = useState("");

  function handleSend() {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setContent("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex items-center gap-2 border-t p-3">
      <Input
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          onTyping?.();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Digite uma mensagem..."
        disabled={disabled}
        className="flex-1"
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={disabled || !content.trim()}
        aria-label="Enviar mensagem"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
