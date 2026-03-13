"use client";

import { useState, useCallback } from "react";
import { format, addDays, nextMonday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconCalendar,
  IconX,
  IconClock,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TaskDatePickerProps {
  label?: string;
  /** ISO date string "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" */
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Renders trigger in red overdue styling */
  overdue?: boolean;
}

export function TaskDatePicker({
  label,
  value,
  onChange,
  disabled,
  placeholder = "—",
  overdue,
}: TaskDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [showTime, setShowTime] = useState(() => !!value && value.includes("T"));
  const [timeValue, setTimeValue] = useState(() => {
    if (value && value.includes("T")) return value.split("T")[1].slice(0, 5);
    return "12:00";
  });

  const dateOnly = value ? value.split("T")[0] : null;
  const selectedDate = dateOnly ? new Date(dateOnly + "T12:00:00") : undefined;

  const displayDate = dateOnly
    ? showTime && value?.includes("T")
      ? format(new Date(dateOnly + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR }) + " " + timeValue
      : format(new Date(dateOnly + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })
    : null;

  const buildValue = useCallback(
    (dateStr: string, withTime: boolean, time: string): string => {
      return withTime ? `${dateStr}T${time}` : dateStr;
    },
    []
  );

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        onChange(null);
        setOpen(false);
        return;
      }
      const dateStr = format(date, "yyyy-MM-dd");
      onChange(buildValue(dateStr, showTime, timeValue));
      setOpen(false);
    },
    [onChange, showTime, timeValue, buildValue]
  );

  const handleTimeChange = useCallback(
    (time: string) => {
      setTimeValue(time);
      if (dateOnly) onChange(`${dateOnly}T${time}`);
    },
    [dateOnly, onChange]
  );

  const handleToggleTime = useCallback(() => {
    const next = !showTime;
    setShowTime(next);
    if (!next && dateOnly) {
      onChange(dateOnly);
    } else if (next && dateOnly) {
      onChange(`${dateOnly}T${timeValue}`);
    }
  }, [showTime, dateOnly, timeValue, onChange]);

  const handleShortcut = useCallback(
    (type: "today" | "tomorrow" | "next-week" | "clear") => {
      if (type === "clear") {
        onChange(null);
        setOpen(false);
        return;
      }
      const today = new Date();
      let target: Date;
      if (type === "today") target = today;
      else if (type === "tomorrow") target = addDays(today, 1);
      else target = nextMonday(today);

      const dateStr = format(target, "yyyy-MM-dd");
      onChange(buildValue(dateStr, showTime, timeValue));
      setOpen(false);
    },
    [onChange, showTime, timeValue, buildValue]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={label ?? "Selecionar data"}
          className={cn(
            "flex items-center gap-1.5 text-sm rounded px-2 py-1 -mx-2 transition-colors",
            "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:pointer-events-none disabled:opacity-50",
            overdue && value
              ? "text-red-600 font-medium"
              : value
                ? "text-foreground"
                : "text-muted-foreground"
          )}
        >
          <IconCalendar className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{displayDate ?? placeholder}</span>
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

        {/* Quick shortcuts */}
        <div className="border-t px-3 py-2 flex flex-wrap gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => handleShortcut("today")}
          >
            Hoje
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => handleShortcut("tomorrow")}
          >
            Amanhã
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => handleShortcut("next-week")}
          >
            Próx. semana
          </Button>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => handleShortcut("clear")}
            >
              <IconX className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        {/* Time toggle */}
        <div className="border-t px-3 py-2 space-y-2">
          <button
            type="button"
            onClick={handleToggleTime}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconClock className="h-3.5 w-3.5" />
            {showTime ? "Remover horário" : "Adicionar horário"}
          </button>
          {showTime && (
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="h-7 text-xs w-28"
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
