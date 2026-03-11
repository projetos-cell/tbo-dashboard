"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DemandDatePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  overdue?: boolean;
}

export function DemandDatePicker({
  value,
  onChange,
  placeholder = "Selecionar...",
  overdue = false,
}: DemandDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const date = value ? parseISO(value) : undefined;

  const handleSelect = (selected: Date | undefined) => {
    if (selected) {
      const iso = format(selected, "yyyy-MM-dd");
      onChange(iso);
    }
    setOpen(false);
  };

  const stopProp = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <div onClick={stopProp} onPointerDown={stopProp}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "text-xs hover:bg-muted/60 rounded px-1 py-0.5 transition-colors text-left",
              !value && "text-muted-foreground",
              overdue && "text-destructive font-medium",
            )}
          >
            {date
              ? format(date, "dd MMM yyyy", { locale: ptBR })
              : placeholder}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            defaultMonth={date}
          />
          {value && (
            <div className="px-3 pb-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs text-muted-foreground"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Limpar data
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
