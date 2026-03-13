"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateEditor({
  value,
  onSave,
  readonly,
}: {
  value: unknown;
  onSave: (v: unknown) => void;
  readonly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dateValue = value ? new Date(String(value)) : undefined;

  function handleSelect(date: Date | undefined) {
    setOpen(false);
    onSave(date ? date.toISOString() : null);
  }

  const label = dateValue
    ? format(dateValue, "dd MMM yyyy", { locale: ptBR })
    : null;

  return (
    <Popover open={open && !readonly} onOpenChange={(o) => !readonly && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "text-sm rounded px-1.5 py-0.5 -mx-1.5 transition-colors flex items-center gap-1",
            readonly
              ? "cursor-default"
              : "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {label ? (
            <span>{label}</span>
          ) : (
            <span className="text-muted-foreground italic text-xs">
              {readonly ? "—" : "Selecionar data"}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          locale={ptBR}
        />
        {dateValue && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => handleSelect(undefined)}
            >
              Limpar data
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
