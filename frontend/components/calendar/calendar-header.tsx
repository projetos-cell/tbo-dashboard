"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export type CalendarView = "month" | "week";

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  const title =
    view === "month"
      ? format(currentDate, "MMMM yyyy", { locale: ptBR })
      : `Semana de ${format(currentDate, "dd MMM", { locale: ptBR })}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold capitalize">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToday}>
          Hoje
        </Button>

        <div className="flex items-center rounded-md border">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex rounded-md border">
          <Button
            variant={view === "month" ? "default" : "ghost"}
            size="sm"
            className="rounded-r-none"
            onClick={() => onViewChange("month")}
          >
            Mês
          </Button>
          <Button
            variant={view === "week" ? "default" : "ghost"}
            size="sm"
            className="rounded-l-none"
            onClick={() => onViewChange("week")}
          >
            Semana
          </Button>
        </div>
      </div>
    </div>
  );
}
