"use client";

import { useState, useMemo, useCallback } from "react";
import { addMonths, subMonths, addWeeks, subWeeks } from "date-fns";
import { CalendarHeader, type CalendarView } from "@/components/calendar/calendar-header";
import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { EventDetail } from "@/components/calendar/event-detail";
import { EventForm } from "@/components/calendar/event-form";
import { useCalendarEvents, useDeleteCalendarEvent } from "@/hooks/use-calendar";
import { getMonthRange, getWeekRange } from "@/services/calendar";
import type { CalendarEvent } from "@/services/calendar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const range = useMemo(() => {
    return view === "month"
      ? getMonthRange(currentDate)
      : getWeekRange(currentDate);
  }, [currentDate, view]);

  const { data: events = [] } = useCalendarEvents(range.start, range.end);

  const deleteEvent = useDeleteCalendarEvent();

  const handlePrev = useCallback(() => {
    setCurrentDate((d) =>
      view === "month" ? subMonths(d, 1) : subWeeks(d, 1)
    );
  }, [view]);

  const handleNext = useCallback(() => {
    setCurrentDate((d) =>
      view === "month" ? addMonths(d, 1) : addWeeks(d, 1)
    );
  }, [view]);

  const handleToday = useCallback(() => setCurrentDate(new Date()), []);

  function handleSelectEvent(event: CalendarEvent) {
    setSelectedEvent(event);
    setDetailOpen(true);
  }

  function handleDelete(id: string) {
    deleteEvent.mutate(id, {
      onSuccess: () => setDetailOpen(false),
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
          <p className="text-sm text-muted-foreground">
            Visualize e gerencie os eventos do time.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      {/* Calendar controls */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      {/* Calendar view */}
      {view === "month" ? (
        <MonthView
          currentDate={currentDate}
          events={events}
          onSelectEvent={handleSelectEvent}
        />
      ) : (
        <WeekView
          currentDate={currentDate}
          events={events}
          onSelectEvent={handleSelectEvent}
        />
      )}

      {/* Event detail sheet */}
      <EventDetail
        event={selectedEvent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDelete={handleDelete}
      />

      {/* New event form */}
      <EventForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
