"use client";

import { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCalendarEvent } from "@/hooks/use-calendar";
import { useAuthStore } from "@/stores/auth-store";

const eventSchema = z.object({
  title: z.string().min(1, "Titulo e obrigatorio"),
  date: z.string().min(1, "Data e obrigatoria"),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  location: z.string().optional(),
  is_all_day: z.boolean(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventForm({ open, onOpenChange }: EventFormProps) {
  const tenantId = useAuthStore((s) => s.tenantId);
  const createEvent = useCreateCalendarEvent();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  function reset() {
    setTitle("");
    setDate("");
    setStartTime("09:00");
    setEndTime("10:00");
    setLocation("");
    setIsAllDay(false);
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = eventSchema.safeParse({
      title: title.trim(),
      date,
      start_time: startTime,
      end_time: endTime,
      location: location.trim(),
      is_all_day: isAllDay,
    });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof EventFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof EventFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (!tenantId) return;

    const startAt = isAllDay
      ? `${date}T00:00:00`
      : `${date}T${startTime}:00`;
    const endAt = isAllDay
      ? `${date}T23:59:59`
      : `${date}T${endTime}:00`;

    createEvent.mutate(
      {
        tenant_id: tenantId,
        title: title.trim(),
        start_at: startAt,
        end_at: endAt,
        is_all_day: isAllDay,
        location: location.trim() || null,
        source: "manual",
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ev-title">Título *</Label>
            <Input
              id="ev-title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((prev) => ({ ...prev, title: undefined })); }}
              placeholder="Reunião de equipe"
              required
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ev-date">Data *</Label>
            <Input
              id="ev-date"
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setErrors((prev) => ({ ...prev, date: undefined })); }}
              required
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ev-allday"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="h-4 w-4 rounded border"
            />
            <Label htmlFor="ev-allday" className="text-sm font-normal">
              Dia inteiro
            </Label>
          </div>

          {!isAllDay && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ev-start">Início</Label>
                <Input
                  id="ev-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-end">Fim</Label>
                <Input
                  id="ev-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="ev-location">Local</Label>
            <Input
              id="ev-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Sala de reuniões"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? "Criando..." : "Criar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
