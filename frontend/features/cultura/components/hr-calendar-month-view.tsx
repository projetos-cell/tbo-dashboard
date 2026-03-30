"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { HrCalendarItem } from "@/features/cultura/services/hr-calendar";

interface HrMonthViewProps {
  currentDate: Date;
  items: HrCalendarItem[];
  activeCategories: Set<string>;
  onSelectEvent: (item: HrCalendarItem) => void;
  onSelectDate: (date: Date) => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function HrCalendarMonthView({
  currentDate,
  items,
  activeCategories,
  onSelectEvent,
  onSelectDate,
}: HrMonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { locale: ptBR });
    const calEnd = endOfWeek(monthEnd, { locale: ptBR });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate]);

  const filteredItems = useMemo(
    () => items.filter((i) => activeCategories.has(i.category)),
    [items, activeCategories],
  );

  const itemsByDay = useMemo(() => {
    const map = new Map<string, HrCalendarItem[]>();
    for (const item of filteredItems) {
      const key = item.startDate;
      const arr = map.get(key) ?? [];
      arr.push(item);
      map.set(key, arr);
    }
    return map;
  }, [filteredItems]);

  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const key = format(day, "yyyy-MM-dd");
          const dayItems = itemsByDay.get(key) ?? [];
          const inMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={key}
              className={cn(
                "min-h-24 cursor-pointer border-b border-r p-1 text-xs transition-colors hover:bg-muted/30",
                !inMonth && "bg-muted/10 text-muted-foreground/40",
                idx % 7 === 6 && "border-r-0",
              )}
              onClick={() => onSelectDate(day)}
            >
              <div
                className={cn(
                  "mb-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  isToday(day) && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </div>

              <div className="space-y-0.5">
                {dayItems.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(item);
                    }}
                    className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[10px] leading-tight transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: item.color.bg,
                      color: item.color.text,
                    }}
                  >
                    {item.isComputed && item.avatarUrl ? (
                      <img
                        src={item.avatarUrl}
                        alt=""
                        className="size-3 shrink-0 rounded-full object-cover"
                      />
                    ) : null}
                    <span className="truncate">{item.title}</span>
                  </button>
                ))}
                {dayItems.length > 3 && (
                  <p className="px-1 text-[10px] text-muted-foreground">
                    +{dayItems.length - 3} mais
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
