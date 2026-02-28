"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
}

function formatDisplay(range: DateRange): string {
  if (!range.start && !range.end) return "";
  const startStr = range.start
    ? format(range.start, "dd MMM yyyy", { locale: ptBR })
    : "...";
  const endStr = range.end
    ? format(range.end, "dd MMM yyyy", { locale: ptBR })
    : "...";
  return `${startStr} — ${endStr}`;
}

export function DateRangePicker({
  value,
  onChange,
  className,
  disabled = false,
  placeholder = "Selecionar datas...",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const display = formatDisplay(value);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    onChange({
      ...value,
      start: dateStr ? new Date(dateStr + "T00:00:00") : null,
    });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    onChange({
      ...value,
      end: dateStr ? new Date(dateStr + "T00:00:00") : null,
    });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ start: null, end: null });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-start font-normal gap-2",
            !display && "text-muted-foreground",
            className
          )}
        >
          <CalendarDays className="size-4 shrink-0" />
          <span className="truncate">{display || placeholder}</span>
          {display && (
            <X
              className="size-3.5 ml-auto shrink-0 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Início</Label>
            <Input
              type="date"
              value={toDateInputValue(value.start)}
              onChange={handleStartChange}
              className="h-8 w-36 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fim</Label>
            <Input
              type="date"
              value={toDateInputValue(value.end)}
              onChange={handleEndChange}
              min={toDateInputValue(value.start)}
              className="h-8 w-36 text-sm"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
