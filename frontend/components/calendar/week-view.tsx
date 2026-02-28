"use client";

import { useMemo } from "react";
import {
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  format,
  differenceInMinutes,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/services/calendar";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 – 20:00

export function WeekView({ currentDate, events, onSelectEvent }: WeekViewProps) {
  const weekStart = useMemo(
    () => startOfWeek(currentDate, { locale: ptBR }),
    [currentDate]
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const allDayEvents = useMemo(
    () => events.filter((e) => e.isAllDay),
    [events]
  );
  const timedEvents = useMemo(
    () => events.filter((e) => !e.isAllDay),
    [events]
  );

  function getEventsForDay(day: Date) {
    return timedEvents.filter((e) => isSameDay(new Date(e.startAt), day));
  }

  function getAllDayForDay(day: Date) {
    return allDayEvents.filter((e) => isSameDay(new Date(e.startAt), day));
  }

  function getTopPx(event: CalendarEvent) {
    const start = new Date(event.startAt);
    const mins = differenceInMinutes(start, startOfDay(start)) - 7 * 60; // offset from 7:00
    return Math.max(0, (mins / 60) * 60); // 60px per hour
  }

  function getHeightPx(event: CalendarEvent) {
    const start = new Date(event.startAt);
    const end = new Date(event.endAt);
    const mins = differenceInMinutes(end, start);
    return Math.max(20, (mins / 60) * 60);
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-muted/40">
        <div />
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "px-2 py-2 text-center text-xs",
              isToday(day) && "font-bold text-primary"
            )}
          >
            <span className="block">{format(day, "EEE", { locale: ptBR })}</span>
            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                isToday(day) && "bg-primary text-primary-foreground"
              )}
            >
              {format(day, "d")}
            </span>
          </div>
        ))}
      </div>

      {/* All-day row */}
      {allDayEvents.length > 0 && (
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
          <div className="px-1 py-1 text-[10px] text-muted-foreground">
            Dia todo
          </div>
          {weekDays.map((day) => {
            const dayAllDay = getAllDayForDay(day);
            return (
              <div key={day.toISOString()} className="border-l p-0.5">
                {dayAllDay.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    className="mb-0.5 block w-full truncate rounded px-1 py-0.5 text-left text-[10px] hover:opacity-80"
                    style={{
                      backgroundColor: "rgba(139,92,246,0.15)",
                      color: "#7c3aed",
                    }}
                  >
                    {ev.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Time grid */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
        {/* Time labels */}
        <div>
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex h-[60px] items-start justify-end border-b pr-2 text-[10px] text-muted-foreground"
            >
              {`${String(h).padStart(2, "0")}:00`}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day) => {
          const dayEvents = getEventsForDay(day);
          return (
            <div key={day.toISOString()} className="relative border-l">
              {/* Hour lines */}
              {HOURS.map((h) => (
                <div key={h} className="h-[60px] border-b" />
              ))}

              {/* Events */}
              {dayEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className="absolute left-0.5 right-0.5 overflow-hidden rounded px-1 py-0.5 text-left text-[10px] leading-tight hover:opacity-80"
                  style={{
                    top: `${getTopPx(ev)}px`,
                    height: `${getHeightPx(ev)}px`,
                    backgroundColor: "rgba(59,130,246,0.15)",
                    color: "#2563eb",
                  }}
                >
                  <span className="font-medium">
                    {format(new Date(ev.startAt), "HH:mm")}
                  </span>{" "}
                  {ev.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
