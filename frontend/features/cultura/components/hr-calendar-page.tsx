"use client";

import { useState, useMemo, useCallback } from "react";
import { addMonths, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendarPlus,
  IconCalendarHeart,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { RBACGuard } from "@/components/shared/rbac-guard";
import { useMergedHrCalendar } from "@/features/cultura/hooks/use-hr-calendar";
import { HR_CATEGORY_COLORS, type HrCalendarItem, type HrDisplayCategory } from "@/features/cultura/services/hr-calendar";
import { HrCalendarMonthView } from "./hr-calendar-month-view";
import { HrCalendarSidebar } from "./hr-calendar-sidebar";
import { HrEventForm } from "./hr-event-form";
import { HrEventDetail } from "./hr-event-detail";

const ALL_CATEGORIES = Object.keys(HR_CATEGORY_COLORS) as HrDisplayCategory[];

export function HrCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<HrCalendarItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HrCalendarItem | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>("");
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    () => new Set(ALL_CATEGORIES),
  );

  const { items, isLoading } = useMergedHrCalendar(currentDate);

  const handlePrev = () => setCurrentDate((d) => subMonths(d, 1));
  const handleNext = () => setCurrentDate((d) => addMonths(d, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleSelectEvent = useCallback((item: HrCalendarItem) => {
    setSelectedEvent(item);
    setDetailOpen(true);
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    setDefaultDate(format(date, "yyyy-MM-dd"));
    setEditingEvent(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((item: HrCalendarItem) => {
    setEditingEvent(item);
    setFormOpen(true);
  }, []);

  const handleNewEvent = useCallback(() => {
    setEditingEvent(null);
    setDefaultDate(format(new Date(), "yyyy-MM-dd"));
    setFormOpen(true);
  }, []);

  function toggleCategory(cat: string) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  const monthLabel = format(currentDate, "MMMM yyyy", { locale: ptBR });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <IconCalendarHeart className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Calendario RH</h1>
            <p className="text-sm text-muted-foreground">
              Feriados, ciclos de gestao, aniversarios e eventos
            </p>
          </div>
        </div>

        <RBACGuard allowedRoles={["admin"]}>
          <Button onClick={handleNewEvent} size="sm">
            <IconCalendarPlus className="mr-1.5 size-4" />
            Novo Evento
          </Button>
        </RBACGuard>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_CATEGORIES.map((cat) => {
          const info = HR_CATEGORY_COLORS[cat];
          const active = activeCategories.has(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                active
                  ? "border-transparent"
                  : "border-border opacity-40 grayscale"
              }`}
              style={
                active
                  ? { backgroundColor: info.bg, color: info.text, borderColor: info.text + "30" }
                  : undefined
              }
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: active ? info.text : "currentColor" }}
              />
              {info.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Calendar grid */}
        <div className="flex-1">
          {/* Nav bar */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold capitalize">{monthLabel}</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handlePrev} className="size-8">
                <IconChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs">
                Hoje
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNext} className="size-8">
                <IconChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border">
              {Array.from({ length: 42 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse bg-muted/30" />
              ))}
            </div>
          ) : (
            <HrCalendarMonthView
              currentDate={currentDate}
              items={items}
              activeCategories={activeCategories}
              onSelectEvent={handleSelectEvent}
              onSelectDate={handleSelectDate}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 xl:w-80">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-semibold">Proximos Eventos</h3>
            <HrCalendarSidebar
              items={items}
              onSelectEvent={handleSelectEvent}
            />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <HrEventForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingEvent={editingEvent}
        defaultDate={defaultDate}
      />

      <HrEventDetail
        item={selectedEvent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
      />
    </div>
  );
}
