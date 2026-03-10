"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InlineCurrencyProps {
  value: number | null;
  onSave: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

export function InlineCurrency({
  value,
  onSave,
  placeholder = "—",
  disabled = false,
  className,
}: InlineCurrencyProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(String(value ?? ""));
  const [flashing, setFlashing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync external value
  React.useEffect(() => {
    if (!editing) setDraft(String(value ?? ""));
  }, [value, editing]);

  // Auto-focus + select on edit
  React.useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [editing]);

  const commit = () => {
    const num = parseFloat(draft);
    if (!isNaN(num) && num >= 0 && num !== value) {
      onSave(num);
      setFlashing(true);
      setTimeout(() => setFlashing(false), 800);
    } else {
      setDraft(String(value ?? ""));
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(String(value ?? ""));
    setEditing(false);
  };

  const stopProp = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  // Read-only / disabled
  if (disabled) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        {value != null && value > 0 ? formatBRL(value) : placeholder}
      </span>
    );
  }

  // Edit mode
  if (editing) {
    return (
      <div onClick={stopProp} onPointerDown={stopProp}>
        <input
          ref={inputRef}
          type="number"
          min={0}
          step={100}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
          className={cn(
            "text-sm font-medium bg-transparent border-b border-primary/60",
            "outline-none w-24 text-right text-foreground",
            className,
          )}
        />
      </div>
    );
  }

  // Display mode — clickable
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        stopProp(e);
        setEditing(true);
      }}
      onPointerDown={stopProp}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setEditing(true);
      }}
      className={cn(
        "text-sm font-medium cursor-text rounded px-1 -mx-1",
        "hover:bg-muted/50 transition-colors text-foreground",
        flashing && "animate-save-flash",
        className,
      )}
    >
      {value != null && value > 0 ? formatBRL(value) : placeholder}
    </span>
  );
}
