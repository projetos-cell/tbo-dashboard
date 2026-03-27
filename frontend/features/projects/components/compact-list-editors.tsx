"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconCalendar, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PROJECT_STATUS,
  type ProjectStatusKey,
  PROJECT_PRIORITY,
  type ProjectPriorityKey,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { isUUID } from "./compact-list-helpers";

export function EditableText({
  value,
  onSave,
  placeholder = "\u2014",
  className,
  linkHref,
}: {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  linkHref?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setDraft(value);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={cn(
          "w-full rounded border border-border bg-background px-1.5 py-0.5 outline-none ring-1 ring-ring/30",
          className,
        )}
      />
    );
  }

  if (linkHref) {
    return (
      <Link
        href={linkHref}
        className={cn("cursor-pointer truncate hover:underline", className)}
        onClick={(e) => {
          if (e.altKey) {
            e.preventDefault();
            setEditing(true);
          }
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          setEditing(true);
        }}
      >
        {value || placeholder}
      </Link>
    );
  }

  return (
    <span
      className={cn("cursor-text truncate", className)}
      onClick={() => setEditing(true)}
    >
      {value || placeholder}
    </span>
  );
}

export function StatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const current = PROJECT_STATUS[value as ProjectStatusKey];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full transition-colors hover:ring-1 hover:ring-border focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          {current ? (
            <Badge
              variant="secondary"
              className="cursor-pointer text-xs"
              style={{ backgroundColor: current.bg, color: current.color }}
            >
              {current.label}
            </Badge>
          ) : (
            <Badge variant="outline" className="cursor-pointer text-xs text-muted-foreground">
              {isUUID(value) ? "Sem status" : value || "Sem status"}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuLabel className="text-xs">Alterar status</DropdownMenuLabel>
        {(Object.entries(PROJECT_STATUS) as [ProjectStatusKey, (typeof PROJECT_STATUS)[ProjectStatusKey]][]).map(
          ([key, config]) => (
            <DropdownMenuItem
              key={key}
              onClick={(e) => {
                e.stopPropagation();
                onChange(key);
              }}
              className="gap-2"
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span>{config.label}</span>
              {key === value && <span className="ml-auto text-xs text-muted-foreground">atual</span>}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PrioritySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string | null) => void;
}) {
  const current = PROJECT_PRIORITY[value as ProjectPriorityKey];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full transition-colors hover:ring-1 hover:ring-border focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          {current ? (
            <Badge
              variant="secondary"
              className="cursor-pointer text-xs"
              style={{ backgroundColor: current.bg, color: current.color }}
            >
              {current.label}
            </Badge>
          ) : (
            <Badge variant="outline" className="cursor-pointer text-xs text-muted-foreground">
              {value || "\u2014"}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuLabel className="text-xs">Alterar prioridade</DropdownMenuLabel>
        {(Object.entries(PROJECT_PRIORITY) as [ProjectPriorityKey, (typeof PROJECT_PRIORITY)[ProjectPriorityKey]][]).map(
          ([key, config]) => (
            <DropdownMenuItem
              key={key}
              onClick={(e) => {
                e.stopPropagation();
                onChange(key);
              }}
              className="gap-2"
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span>{config.label}</span>
              {key === value && <span className="ml-auto text-xs text-muted-foreground">atual</span>}
            </DropdownMenuItem>
          ),
        )}
        {value && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="gap-2 text-muted-foreground"
            >
              <IconX className="size-3.5" />
              <span>Remover prioridade</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DateCell({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const dateObj = value ? new Date(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <IconCalendar className="size-3" />
          <span>
            {value
              ? format(new Date(value), "dd MMM yyyy", { locale: ptBR })
              : "\u2014"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={dateObj}
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : null);
            setOpen(false);
          }}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}
