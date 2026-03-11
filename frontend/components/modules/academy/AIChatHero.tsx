"use client";

import { useState, useCallback } from "react";
import { DynamicGreeting } from "./DynamicGreeting";
import { AIChatInput } from "./AIChatInput";
import { QuickTags } from "./QuickTags";
import { AIChatPanel } from "./AIChatPanel";
import { useAIChat } from "@/features/academy/hooks/use-ai-chat";

export function AIChatHero() {
  const [inputValue, setInputValue] = useState<string | undefined>(undefined);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { messages, isStreaming, error, sendMessage, clearChat } = useAIChat({
    context: "academy",
  });

  const handleTagClick = useCallback((tag: string) => {
    setInputValue(tag);
  }, []);

  const handleSubmit = useCallback(
    (message: string) => {
      setInputValue(undefined);
      setIsChatOpen(true);
      sendMessage(message);
    },
    [sendMessage]
  );

  const handleBack = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  const handleClear = useCallback(() => {
    clearChat();
    setIsChatOpen(false);
  }, [clearChat]);

  if (isChatOpen) {
    return (
      <AIChatPanel
        messages={messages}
        isStreaming={isStreaming}
        error={error}
        onSendMessage={sendMessage}
        onBack={handleBack}
        onClear={handleClear}
      />
    );
  }

  return (
    <section className="relative mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      <div className="relative space-y-8">
        <DynamicGreeting />
        <AIChatInput
          onSubmit={handleSubmit}
          externalValue={inputValue}
        />
        <QuickTags onTagClick={handleTagClick} />
      </div>
    </section>
  );
}
