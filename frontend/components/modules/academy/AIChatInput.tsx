"use client";

import { useState, useEffect, useCallback } from "react";
import { IconSparkles, IconArrowRight } from "@tabler/icons-react";

const PLACEHOLDER_TEXTS = [
  "Como posicionar um lançamento imobiliário?",
  "Me ajuda a criar um conceito de branding",
  "Estratégias de marketing para alto padrão",
  "Como usar 3D na apresentação de projetos?",
  "Melhores práticas de audiovisual imobiliário",
];

interface AIChatInputProps {
  onSubmit?: (message: string) => void;
  externalValue?: string;
}

export function AIChatInput({ onSubmit, externalValue }: AIChatInputProps) {
  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    if (externalValue !== undefined) {
      setValue(externalValue);
    }
  }, [externalValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
        setFadeIn(true);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = useCallback(() => {
    if (value.trim().length < 3) return;
    onSubmit?.(value.trim());
    setValue("");
  }, [value, onSubmit]);

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="relative flex items-center rounded-2xl border border-border/50 bg-secondary/30 px-5 py-4 backdrop-blur-sm transition-colors focus-within:border-primary/30 focus-within:bg-secondary/50">
        <IconSparkles className="mr-3 h-5 w-5 shrink-0 text-primary/60" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          className={`flex-1 bg-transparent text-base outline-none placeholder:transition-opacity placeholder:duration-300 ${
            fadeIn ? "placeholder:opacity-100" : "placeholder:opacity-0"
          }`}
          placeholder={PLACEHOLDER_TEXTS[placeholderIndex]}
          aria-label="Pergunte à IA"
        />
        <button
          onClick={handleSubmit}
          disabled={value.trim().length < 3}
          className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-40 disabled:hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          aria-label="Enviar mensagem"
        >
          <IconArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
