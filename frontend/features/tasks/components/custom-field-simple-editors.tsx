"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// ─── Text Editor ─────────────────────────────────────

export function TextEditor({
  value,
  onSave,
  readonly,
}: {
  value: unknown;
  onSave: (v: unknown) => void;
  readonly: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(String(value ?? ""));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    setEditing(false);
    if (local !== String(value ?? "")) onSave(local || null);
  }

  if (!editing || readonly) {
    return (
      <button
        type="button"
        onClick={() => !readonly && setEditing(true)}
        className={cn(
          "text-sm text-left rounded px-1.5 py-0.5 -mx-1.5 transition-colors min-w-[80px]",
          readonly
            ? "cursor-default"
            : "hover:bg-accent/50 cursor-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        {value ? (
          <span>{String(value)}</span>
        ) : (
          <span className="text-muted-foreground italic text-xs">
            {readonly ? "—" : "Clique para editar"}
          </span>
        )}
      </button>
    );
  }

  return (
    <Input
      ref={inputRef}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setLocal(String(value ?? ""));
          setEditing(false);
        }
      }}
      className="h-7 text-sm px-1.5 py-0.5 -mx-1.5 w-auto max-w-[200px]"
    />
  );
}

// ─── Number Editor ───────────────────────────────────

export function NumberEditor({
  value,
  onSave,
  readonly,
}: {
  value: unknown;
  onSave: (v: unknown) => void;
  readonly: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value != null ? String(value) : "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    setEditing(false);
    const num = local === "" ? null : parseFloat(local);
    if (num !== (value ?? null)) onSave(num);
  }

  if (!editing || readonly) {
    return (
      <button
        type="button"
        onClick={() => !readonly && setEditing(true)}
        className={cn(
          "text-sm text-left rounded px-1.5 py-0.5 -mx-1.5 transition-colors min-w-[60px]",
          readonly
            ? "cursor-default"
            : "hover:bg-accent/50 cursor-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        {value != null ? (
          <span>{String(value)}</span>
        ) : (
          <span className="text-muted-foreground italic text-xs">
            {readonly ? "—" : "Clique para editar"}
          </span>
        )}
      </button>
    );
  }

  return (
    <Input
      ref={inputRef}
      type="number"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setLocal(value != null ? String(value) : "");
          setEditing(false);
        }
      }}
      className="h-7 text-sm px-1.5 py-0.5 -mx-1.5 w-[100px]"
    />
  );
}

// ─── Checkbox Editor ─────────────────────────────────

export function CheckboxEditor({
  value,
  onSave,
  readonly,
}: {
  value: unknown;
  onSave: (v: unknown) => void;
  readonly: boolean;
}) {
  const checked = Boolean(value);
  return (
    <Switch
      checked={checked}
      onCheckedChange={(v) => !readonly && onSave(v)}
      disabled={readonly}
      className="scale-75 origin-left"
    />
  );
}
