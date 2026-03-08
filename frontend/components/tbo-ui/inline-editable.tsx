"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InlineEditableProps {
  value: string;
  onSave: (value: string) => void;
  variant?: "h1" | "h2" | "h3" | "h4" | "body" | "sm" | "small";
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const variantStyles: Record<NonNullable<InlineEditableProps["variant"]>, string> = {
  h1: "text-2xl font-bold",
  h2: "text-xl font-semibold",
  h3: "text-lg font-semibold",
  h4: "text-base font-semibold",
  body: "text-sm",
  sm: "text-xs",
  small: "text-xs",
};

export function InlineEditable({
  value,
  onSave,
  variant = "body",
  placeholder = "Clique para editar",
  className,
  disabled,
}: InlineEditableProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  React.useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") cancel();
  };

  const textStyle = variantStyles[variant];

  if (disabled) {
    return (
      <span className={cn(textStyle, "block", className)}>
        {value || <span className="text-gray-500">{placeholder}</span>}
      </span>
    );
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className={cn(
          textStyle,
          "w-full rounded border border-tbo-orange bg-white px-1 outline-none ring-2 ring-primary/30",
          className
        )}
      />
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => setEditing(true)}
      onKeyDown={(e) => e.key === "Enter" && setEditing(true)}
      className={cn(
        textStyle,
        "block cursor-text rounded px-1 hover:bg-gray-100/40 transition-colors",
        !value && "text-gray-500",
        className
      )}
    >
      {value || placeholder}
    </span>
  );
}
