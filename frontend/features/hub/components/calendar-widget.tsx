"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconCalendar, IconChevronRight } from "@tabler/icons-react";
import { useCalendarEvents } from "@/features/calendar/hooks/use-calendar";
import type { CalendarEvent } from "@/features/calendar/services/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "./section-card";

/* ─── Helpers ──────────────────────────────────────────────────── */

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function buildCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { day: number; inMonth: boolean }[] = [];
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - daysInMonth - startDow + 1, inMonth: false });
  }
  const today = new Date();
  const todayDay = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1;
  const todayIdx = cells.findIndex((c) => c.inMonth && c.day === todayDay);
  const rowOfToday = todayIdx >= 0 ? Math.floor(todayIdx / 7) : 0;
  const startRow = Math.max(0, rowOfToday);
  const sliced = cells.slice(startRow * 7, (startRow + 2) * 7);
  return { cells: sliced, todayDay };
}

function getDayRange(date: Date): { start: string; end: string } {
  const s = new Date(date);
  s.setHours(0, 0, 0, 0);
  const e = new Date(date);
  e.setHours(23, 59, 59, 999);
  return { start: s.toISOString(), end: e.toISOString() };
}

function getMonthRangeLocal(year: number, month: number) {
  const s = new Date(year, month, 1);
  const e = new Date(year, month + 1, 0, 23, 59, 59);
  return { start: s.toISOString(), end: e.toISOString() };
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function isEventNow(event: CalendarEvent): boolean {
  const now = Date.now();
  const start = new Date(event.startAt).getTime();
  const end = event.endAt ? new Date(event.endAt).getTime() : start + 3600000;
  return now >= start && now <= end;
}

/* ─── Component ───────────────────────────────────────────────── */

export function CalendarWidget() {
  const now = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date(now));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const { cells, todayDay } = useMemo(() => buildCalendarGrid(year, month), [year, month]);

  const monthRange = useMemo(() => getMonthRangeLocal(year, month), [year, month]);
  const { data: monthEvents = [], isLoading: monthLoading } = useCalendarEvents(
    monthRange.start,
    monthRange.end,
  );

  const todayRange = useMemo(() => getDayRange(now), [now]);
  const { data: todayEvents = [], isLoading: todayLoading } = useCalendarEvents(
    todayRange.start,
    todayRange.end,
  );

  const daysWithEvents = useMemo(() => {
    const s = new Set<number>();
    for (const ev of monthEvents) {
      const d = new Date(ev.startAt);
      if (d.getMonth() === month) s.add(d.getDate());
    }
    return s;
  }, [monthEvents, month]);

  const visibleEvents = todayEvents.slice(0, 4);

  return (
    <SectionCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Calendario</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="p-0.5 rounded hover:bg-black/5 transition-colors"
            aria-label="Mes anterior"
          >
            <IconChevronRight className="size-3.5 rotate-180 text-muted-foreground" />
          </button>
          <span className="text-xs font-medium min-w-[90px] text-center text-muted-foreground">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="p-0.5 rounded hover:bg-black/5 transition-colors"
            aria-label="Proximo mes"
          >
            <IconChevronRight className="size-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0 mb-1" role="row">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {d}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {monthLoading ? (
        <div className="grid grid-cols-7 gap-0 mb-3">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center py-1.5">
              <Skeleton className="size-7 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0 mb-3" role="grid">
          {cells.map((cell, i) => {
            const isToday = cell.inMonth && cell.day === todayDay;
            const hasEvent = cell.inMonth && daysWithEvents.has(cell.day);
            return (
              <div key={i} className="flex flex-col items-center py-1" role="gridcell">
                <span
                  className={`inline-flex items-center justify-center size-7 text-xs font-medium rounded-full transition-colors ${
                    isToday
                      ? "bg-hub-orange text-white shadow-[0_4px_12px_rgba(196,90,26,0.3)]"
                      : cell.inMonth
                        ? "text-foreground"
                        : "text-muted-foreground opacity-40"
                  }`}
                  aria-current={isToday ? "date" : undefined}
                >
                  {cell.day}
                </span>
                {hasEvent && !isToday && (
                  <span className="size-1 rounded-full mt-0.5 bg-hub-orange" />
                )}
                {isToday && hasEvent && (
                  <span className="size-1 rounded-full mt-0.5 bg-white" />
                )}
                {!hasEvent && <span className="size-1 mt-0.5" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Today events */}
      <div className="space-y-2 pt-2 border-t border-hub-border-solid">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-hub-orange-muted">
            Hoje
          </span>
          <span className="text-[10px] text-muted-foreground">
            {todayEvents.length} evento{todayEvents.length !== 1 ? "s" : ""}
          </span>
        </div>

        {todayLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-10 rounded" />
                <Skeleton className="h-4 flex-1 rounded" />
              </div>
            ))}
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="text-center py-3">
            <IconCalendar className="size-5 mx-auto mb-1 text-muted-foreground opacity-40" />
            <p className="text-[11px] text-muted-foreground">Nenhum evento hoje</p>
            <Link href="/agenda" className="text-[11px] font-medium mt-1 inline-block text-hub-orange">
              Criar evento
            </Link>
          </div>
        ) : (
          visibleEvents.map((ev) => {
            const happening = isEventNow(ev);
            return (
              <div
                key={ev.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                  happening ? "bg-hub-orange-glow" : ""
                }`}
              >
                <span
                  className={`text-[11px] font-mono font-medium shrink-0 w-10 text-right ${
                    happening ? "text-hub-orange" : "text-muted-foreground"
                  }`}
                >
                  {ev.isAllDay ? "dia" : formatTime(ev.startAt)}
                </span>
                <span
                  className={`w-0.5 h-4 rounded-full shrink-0 ${
                    happening ? "bg-hub-orange" : "bg-hub-border-solid"
                  }`}
                />
                <span
                  className={`text-xs flex-1 truncate text-foreground ${
                    happening ? "font-semibold" : ""
                  }`}
                >
                  {ev.title}
                </span>
                {ev.googleEventId && (
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-hub-bg-alt text-muted-foreground">
                    G
                  </span>
                )}
                {happening && (
                  <span className="size-2 rounded-full animate-pulse shrink-0 bg-hub-orange" />
                )}
              </div>
            );
          })
        )}

        {todayEvents.length > 4 && (
          <p className="text-[10px] text-center text-muted-foreground">
            +{todayEvents.length - 4} mais
          </p>
        )}
      </div>

      <Link
        href="/agenda"
        className="w-full mt-3 text-center text-[11px] font-medium py-2 rounded-lg block text-hub-orange bg-hub-orange-glow"
      >
        Ver agenda completa
      </Link>
    </SectionCard>
  );
}
