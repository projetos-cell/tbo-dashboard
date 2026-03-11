"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface UseAIChatOptions {
  context?: "academy" | "pdi" | "okr" | "general";
}

interface UseAIChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  chatId: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const { context = "general" } = options;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || !content.trim()) return;

      setError(null);
      setIsStreaming(true);

      const userMessage: ChatMessage = {
        role: "user",
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Add empty assistant message for streaming
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };
      setMessages([...updatedMessages, assistantMessage]);

      try {
        abortRef.current = new AbortController();

        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            context,
            chat_id: chatIdRef.current,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            (errorData as { error?: string }).error || `Erro ${response.status}`
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let accumulatedContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data) as {
                text?: string;
                chat_id?: string;
                error?: string;
              };

              if (parsed.text) {
                accumulatedContent += parsed.text;
                setMessages((prev) => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last?.role === "assistant") {
                    next[next.length - 1] = {
                      ...last,
                      content: accumulatedContent,
                    };
                  }
                  return next;
                });
              }

              if (parsed.chat_id) {
                chatIdRef.current = parsed.chat_id;
              }

              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (parseErr) {
              if (
                parseErr instanceof Error &&
                parseErr.message !== "Stream interrupted"
              ) {
                // Skip parse errors for incomplete JSON
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        const errorMessage =
          err instanceof Error ? err.message : "Erro ao processar mensagem";
        setError(errorMessage);

        // Remove empty assistant message on error
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && !last.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming, context]
  );

  const clearChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setMessages([]);
    setError(null);
    setIsStreaming(false);
    chatIdRef.current = null;
  }, []);

  return {
    messages,
    isStreaming,
    error,
    chatId: chatIdRef.current,
    sendMessage,
    clearChat,
  };
}
