"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

type Variant = "h1" | "h2" | "h3" | "body" | "small";

const variantClasses: Record<Variant, string> = {
  h1: "text-2xl font-bold",
  h2: "text-xl font-semibold",
  h3: "text-lg font-medium",
  body: "text-sm",
  small: "text-xs text-muted-foreground",
};

interface InlineEditableProps {
  value: string;
  onSave: (value: string) => void;
  variant?: Variant;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function InlineEditable({
  value,
  onSave,
  variant = "body",
  placeholder = "Clique para editar...",
  className,
  disabled = false,
  maxLength,
}: InlineEditableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const save = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setEditValue(value);
    }
    setIsEditing(false);
  }, [editValue, value, onSave]);

  const cancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        save();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    },
    [save, cancel]
  );

  if (disabled) {
    return (
      <span className={cn(variantClasses[variant], className)}>
        {value || placeholder}
      </span>
    );
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        maxLength={maxLength}
        className={cn(
          variantClasses[variant],
          "bg-transparent border-b border-primary/50 outline-none w-full",
          "focus:border-primary transition-colors",
          className
        )}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => setIsEditing(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
      className={cn(
        variantClasses[variant],
        "cursor-pointer rounded px-0.5 -mx-0.5",
        "hover:bg-accent/50 transition-colors",
        !value && "text-muted-foreground italic",
        className
      )}
    >
      {value || placeholder}
    </span>
  );
}
