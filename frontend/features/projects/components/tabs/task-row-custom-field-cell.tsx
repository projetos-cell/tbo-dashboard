"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EditableCustomFieldCellProps {
  value: unknown;
  type: string;
  fieldId: string;
  taskId: string;
  configJson: Record<string, unknown> | null;
  onSave?: (taskId: string, fieldId: string, value: unknown) => void;
}

export function EditableCustomFieldCell({
  value,
  type,
  fieldId,
  taskId,
  configJson,
  onSave,
}: EditableCustomFieldCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<unknown>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const commit = (v: unknown) => {
    setEditing(false);
    if (v !== value && onSave) onSave(taskId, fieldId, v);
  };

  // Checkbox
  if (type === "checkbox") {
    return (
      <button
        type="button"
        className="flex items-center justify-center"
        onClick={(e) => { e.stopPropagation(); commit(!value); }}
      >
        <Checkbox checked={!!value} className="size-4" />
      </button>
    );
  }

  // Select
  if (type === "select") {
    const options = (configJson?.options as string[]) ?? [];
    return (
      <Popover open={editing} onOpenChange={setEditing}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center h-6 rounded hover:bg-muted/50 transition-colors px-0.5"
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          >
            {value ? (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5">{String(value)}</Badge>
            ) : (
              <span className="text-xs text-muted-foreground/50">{"\u2014"}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-36 p-1" align="start" sideOffset={4}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={cn("w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted/50", opt === value && "bg-muted")}
              onClick={(e) => { e.stopPropagation(); commit(opt); }}
            >
              {opt}
            </button>
          ))}
          {value != null && value !== "" && (
            <button
              type="button"
              className="w-full text-left text-xs px-2 py-1.5 rounded text-muted-foreground hover:bg-muted/50"
              onClick={(e) => { e.stopPropagation(); commit(null); }}
            >
              Limpar
            </button>
          )}
        </PopoverContent>
      </Popover>
    );
  }

  // Multi-select
  if (type === "multi_select") {
    const options = (configJson?.options as string[]) ?? [];
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <Popover open={editing} onOpenChange={setEditing}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-0.5 h-6 overflow-hidden rounded hover:bg-muted/50 transition-colors px-0.5"
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          >
            {selected.length > 0 ? (
              <>
                {selected.slice(0, 2).map((v, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] h-5 px-1.5 shrink-0">{v}</Badge>
                ))}
                {selected.length > 2 && <span className="text-[10px] text-muted-foreground shrink-0">+{selected.length - 2}</span>}
              </>
            ) : (
              <span className="text-xs text-muted-foreground/50">{"\u2014"}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1" align="start" sideOffset={4}>
          {options.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                className="flex items-center gap-2 w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted/50"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = checked ? selected.filter((s) => s !== opt) : [...selected, opt];
                  if (onSave) onSave(taskId, fieldId, next);
                }}
              >
                <Checkbox checked={checked} className="size-3.5" />
                {opt}
              </button>
            );
          })}
        </PopoverContent>
      </Popover>
    );
  }

  // Date
  if (type === "date") {
    const dateObj = value ? new Date(String(value)) : undefined;
    return (
      <Popover open={editing} onOpenChange={setEditing}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center h-6 rounded hover:bg-muted/50 transition-colors px-0.5"
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          >
            {dateObj ? (
              <span className="text-xs text-muted-foreground">{format(dateObj, "dd MMM yyyy", { locale: ptBR })}</span>
            ) : (
              <span className="text-xs text-muted-foreground/50">{"\u2014"}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
          <Calendar
            mode="single"
            selected={dateObj}
            onSelect={(d) => { commit(d ? format(d, "yyyy-MM-dd") : null); }}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Text, number, email, url
  const display = renderDisplayValue(value, type);
  if (!editing) {
    return (
      <button
        type="button"
        className="flex items-center h-6 w-full rounded hover:bg-muted/50 transition-colors px-0.5 text-left"
        onClick={(e) => { e.stopPropagation(); setDraft(value ?? ""); setEditing(true); }}
      >
        {display}
      </button>
    );
  }

  return (
    <Input
      ref={inputRef}
      type={type === "number" ? "number" : type === "email" ? "email" : type === "url" ? "url" : "text"}
      className="h-6 text-xs px-1.5"
      value={String(draft ?? "")}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setDraft(type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit(draft);
        if (e.key === "Escape") { setEditing(false); setDraft(value); }
      }}
      onBlur={() => commit(draft)}
    />
  );
}

function renderDisplayValue(value: unknown, type: string) {
  if (value == null || value === "") {
    return <span className="text-xs text-muted-foreground/50">{"\u2014"}</span>;
  }
  switch (type) {
    case "number":
      return <span className="text-xs tabular-nums text-muted-foreground">{String(value)}</span>;
    case "url":
      return (
        <span className="text-xs text-primary truncate">
          {String(value).replace(/^https?:\/\/(www\.)?/, "").slice(0, 30)}
        </span>
      );
    case "email":
      return <span className="text-xs text-primary truncate">{String(value)}</span>;
    default:
      return <span className="truncate text-xs text-muted-foreground">{String(value)}</span>;
  }
}
