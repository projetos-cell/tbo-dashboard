"use client";

import { useMemo } from "react";
import { format, addDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconCalendarOff } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { HR_CATEGORY_COLORS, type HrCalendarItem } from "@/features/cultura/services/hr-calendar";

interface HrCalendarSidebarProps {
  items: HrCalendarItem[];
  onSelectEvent: (item: HrCalendarItem) => void;
}

export function HrCalendarSidebar({ items, onSelectEvent }: HrCalendarSidebarProps) {
  const upcoming = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const limit = format(addDays(new Date(), 30), "yyyy-MM-dd");

    return items
      .filter((i) => i.startDate >= today && i.startDate <= limit)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [items]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, HrCalendarItem[]>();
    for (const item of upcoming) {
      const arr = map.get(item.startDate) ?? [];
      arr.push(item);
      map.set(item.startDate, arr);
    }
    return Array.from(map.entries());
  }, [upcoming]);

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <IconCalendarOff className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Nenhum evento nos proximos 30 dias
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(([dateStr, dayItems]) => (
        <div key={dateStr}>
          <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">
            {format(parseISO(dateStr), "EEEE, dd MMM", { locale: ptBR })}
          </p>
          <div className="space-y-1">
            {dayItems.map((item) => {
              const catInfo = HR_CATEGORY_COLORS[item.category];
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectEvent(item)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/50"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: catInfo.text }}
                  />
                  {item.isComputed && item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt=""
                      className="size-5 shrink-0 rounded-full object-cover"
                    />
                  ) : null}
                  <span className="flex-1 truncate text-sm">{item.title}</span>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {catInfo.label}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
