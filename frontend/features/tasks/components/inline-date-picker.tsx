"use client";

import { useCallback, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";

interface InlineDatePickerProps {
  value?: string; // ISO date string "YYYY-MM-DD"
  onChange: (date: Date | undefined) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerless?: boolean; // When true, renders no trigger (used by context menu)
  placeholder?: string;
  overdue?: boolean;
}

export function InlineDatePicker({
  value,
  onChange,
  open,
  onOpenChange,
  triggerless,
  placeholder = "—",
  overdue,
}: InlineDatePickerProps) {
  const selectedDate = useMemo(
    () => (value ? new Date(value + "T12:00:00") : undefined),
    [value]
  );

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      onChange(date);
      onOpenChange?.(false);
    },
    [onChange, onOpenChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(undefined);
      onOpenChange?.(false);
    },
    [onChange, onOpenChange]
  );

  if (triggerless) {
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <span className="sr-only">Selecionar data</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            locale={ptBR}
            initialFocus
          />
          {value && (
            <div className="border-t px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={handleClear}
              >
                <X className="mr-1 h-3 w-3" /> Remover prazo
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-1 text-xs rounded px-1 py-0.5 -mx-1 hover:bg-muted/60 transition-colors ${
            overdue
              ? "font-medium text-red-600"
              : value
                ? "text-muted-foreground"
                : "text-muted-foreground/50"
          }`}
        >
          <CalendarIcon className="h-3 w-3 shrink-0" />
          <span>
            {value
              ? format(new Date(value + "T12:00:00"), "dd MMM", { locale: ptBR })
              : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          locale={ptBR}
          initialFocus
        />
        {value && (
          <div className="border-t px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={handleClear}
            >
              <X className="mr-1 h-3 w-3" /> Remover prazo
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
