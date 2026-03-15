"use client";

import { useState } from "react";
import { IconCalendarClock } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScheduledMessagePickerProps {
  disabled?: boolean;
  onSchedule: (scheduledAt: Date) => void;
}

export function ScheduledMessagePicker({ disabled, onSchedule }: ScheduledMessagePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");

  function getScheduledDate(): Date | null {
    if (!selectedDate) return null;
    return setMinutes(setHours(selectedDate, parseInt(hour, 10) || 0), parseInt(minute, 10) || 0);
  }

  function handleConfirm() {
    const date = getScheduledDate();
    if (!date || date <= new Date()) return;
    onSchedule(date);
    setOpen(false);
    setSelectedDate(undefined);
    setHour("12");
    setMinute("00");
  }

  const scheduledDate = getScheduledDate();
  const isValid = !!scheduledDate && scheduledDate > new Date();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          disabled={disabled}
          title="Agendar mensagem"
        >
          <IconCalendarClock size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end" side="top">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Agendar envio</p>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            locale={ptBR}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Hora:</span>
            <input
              type="number"
              min={0}
              max={23}
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="w-14 rounded border px-2 py-1 text-sm text-center bg-background"
            />
            <span className="text-sm">:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className="w-14 rounded border px-2 py-1 text-sm text-center bg-background"
            />
          </div>
          {scheduledDate && (
            <p className="text-xs text-muted-foreground">
              Enviar em{" "}
              <strong>{format(scheduledDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</strong>
            </p>
          )}
          <Button size="sm" disabled={!isValid} onClick={handleConfirm}>
            Confirmar agendamento
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
