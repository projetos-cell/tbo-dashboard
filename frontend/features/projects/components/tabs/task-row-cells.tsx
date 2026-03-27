"use client";

import { useState } from "react";
import {
  IconCalendar,
  IconX,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  type TaskStatusKey,
  type TaskPriorityKey,
} from "@/lib/constants";

// Re-export custom field cell from its own module
export { EditableCustomFieldCell } from "./task-row-custom-field-cell";

// ─── Task Status Select ────────────────────────────────────────────

export function TaskStatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const current = TASK_STATUS[value as TaskStatusKey];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full transition-colors hover:ring-1 hover:ring-border focus:outline-none"
        >
          {current ? (
            <Badge
              variant="secondary"
              className="cursor-pointer text-xs"
              style={{ backgroundColor: current.bg, color: current.color }}
            >
              {current.label}
            </Badge>
          ) : (
            <Badge variant="outline" className="cursor-pointer text-xs text-muted-foreground">
              {value || "Sem status"}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuLabel className="text-xs">Alterar status</DropdownMenuLabel>
        {(Object.entries(TASK_STATUS) as [TaskStatusKey, (typeof TASK_STATUS)[TaskStatusKey]][]).map(
          ([key, config]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onChange(key)}
              className="gap-2"
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span>{config.label}</span>
              {key === value && <span className="ml-auto text-xs text-muted-foreground">atual</span>}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Task Priority Select ──────────────────────────────────────────

export function TaskPrioritySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string | null) => void;
}) {
  const current = value ? TASK_PRIORITY[value as TaskPriorityKey] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-1.5 truncate rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
        >
          {current ? (
            <>
              <div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: current.color }}
              />
              <span className="truncate text-xs">{current.label}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{"\u2014"}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuLabel className="text-xs">Prioridade</DropdownMenuLabel>
        {value && (
          <DropdownMenuItem onClick={() => onChange(null)} className="gap-2 text-muted-foreground">
            <IconX className="size-3.5" />
            Remover
          </DropdownMenuItem>
        )}
        {(Object.entries(TASK_PRIORITY) as [TaskPriorityKey, (typeof TASK_PRIORITY)[TaskPriorityKey]][]).map(
          ([key, config]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onChange(key)}
              className="gap-2"
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span>{config.label}</span>
              {key === value && <span className="ml-auto text-xs text-muted-foreground">atual</span>}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Task Date Range Cell (F06) ────────────────────────────────────

export function TaskDateRangeCell({
  startDate,
  dueDate,
  overdue,
  onChangeDue,
}: {
  startDate: string | null;
  dueDate: string | null;
  overdue: boolean;
  onChangeDue: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const dateObj = dueDate ? new Date(dueDate) : undefined;
  const hasRange = startDate && dueDate;

  const rangeProgress = hasRange
    ? (() => {
        const start = new Date(startDate).getTime();
        const end = new Date(dueDate).getTime();
        const now = Date.now();
        const total = end - start;
        if (total <= 0) return 100;
        const elapsed = Math.min(Math.max(now - start, 0), total);
        return Math.round((elapsed / total) * 100);
      })()
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex flex-col gap-0.5 w-full rounded px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground text-left",
            overdue && "text-red-600",
          )}
        >
          <div className="flex items-center gap-1">
            <IconCalendar className="size-3 shrink-0" />
            <span className="text-xs truncate">
              {hasRange
                ? `${format(new Date(startDate), "dd MMM", { locale: ptBR })} \u2192 ${format(new Date(dueDate), "dd MMM", { locale: ptBR })}`
                : dueDate
                  ? format(new Date(dueDate), "dd MMM yyyy", { locale: ptBR })
                  : "\u2014"}
            </span>
          </div>
          {hasRange && (
            <div className="h-0.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  overdue ? "bg-red-400" : rangeProgress! >= 75 ? "bg-amber-400" : "bg-blue-400",
                )}
                style={{ width: `${rangeProgress}%` }}
              />
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={dateObj}
          onSelect={(date) => {
            onChangeDue(date ? format(date, "yyyy-MM-dd") : null);
            setOpen(false);
          }}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}
