"use client";

// Feature #29 — Calendário: visão mensal real (grid 7×5 com items posicionados por data)
// Feature #30 — Calendário: drag-and-drop de conteúdos entre dias para reagendar

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IconChevronLeft, IconChevronRight, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/shared";
import { RequireRole } from "@/features/auth/components/require-role";
import { useContentItems, useUpdateContentItem } from "@/features/marketing/hooks/use-marketing-content";
import { ContentItemFormModal } from "@/features/marketing/components/content/content-item-form-modal";
import { DroppableCell, DraggableCard } from "@/features/marketing/components/content/calendar-dnd";
import { MARKETING_CONTENT_STATUS } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import type { ContentItem, ContentStatus } from "@/features/marketing/types/marketing";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function buildCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  const days: Date[] = [];
  let cur = start;
  while (cur <= end) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

function CalendarSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((d) => (
          <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground border-r last:border-r-0">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="min-h-[90px] p-1 border-r border-b">
            <Skeleton className="h-5 w-5 rounded-full mb-1" />
            <Skeleton className="h-4 w-full rounded mb-0.5" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarioContent() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeItem, setActiveItem] = useState<ContentItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newItemDate, setNewItemDate] = useState<string | null>(null);

  const tenantId = useAuthStore((s) => s.tenantId);
  const qc = useQueryClient();
  const { data: items, isLoading, error, refetch } = useContentItems();
  const updateMutation = useUpdateContentItem();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const days = buildCalendarDays(currentMonth);
  const today = new Date();

  // Map items by date string
  const itemsByDate = (items ?? []).reduce<Record<string, ContentItem[]>>((acc, item) => {
    if (!item.scheduled_date) return acc;
    const key = item.scheduled_date.split("T")[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // Unscheduled items (sidebar)
  const unscheduled = (items ?? []).filter((i) => !i.scheduled_date);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const item = (items ?? []).find((i) => i.id === event.active.id);
    setActiveItem(item ?? null);
  }, [items]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const itemId = active.id as string;
    const newDateStr = over.id as string; // "yyyy-MM-dd"
    const item = (items ?? []).find((i) => i.id === itemId);
    if (!item) return;

    const currentDateStr = item.scheduled_date?.split("T")[0];
    if (currentDateStr === newDateStr) return;

    // Optimistic update
    const previousData = qc.getQueryData<ContentItem[]>(["marketing-content", tenantId]);
    qc.setQueryData<ContentItem[]>(["marketing-content", tenantId], (old) =>
      (old ?? []).map((i) =>
        i.id === itemId ? { ...i, scheduled_date: newDateStr } : i,
      ),
    );

    updateMutation.mutate(
      { id: itemId, data: { scheduled_date: newDateStr } },
      {
        onError: () => {
          qc.setQueryData(["marketing-content", tenantId], previousData);
        },
      },
    );
  }, [items, qc, tenantId, updateMutation]);

  const handleNewItemOnDate = useCallback((dateStr: string) => {
    setNewItemDate(dateStr);
    setModalOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendário Editorial</h1>
          <p className="text-sm text-muted-foreground">
            Visualize e reagende conteúdos arrastando entre os dias.
          </p>
        </div>
        <Button onClick={() => { setNewItemDate(null); setModalOpen(true); }}>
          <IconPlus className="mr-1 h-4 w-4" /> Novo Conteúdo
        </Button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
          <IconChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-base font-semibold min-w-[160px] text-center capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
          <IconChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())} className="ml-1">
          Hoje
        </Button>
        {unscheduled.length > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {unscheduled.length} sem data
          </Badge>
        )}
      </div>

      {error ? (
        <ErrorState message="Erro ao carregar calendário." onRetry={() => refetch()} />
      ) : isLoading ? (
        <CalendarSkeleton />
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="rounded-lg border overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b bg-muted/50">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="p-2 text-center text-xs font-medium text-muted-foreground border-r last:border-r-0"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayItems = itemsByDate[dateStr] ?? [];
                return (
                  <DroppableCell
                    key={dateStr}
                    dateStr={dateStr}
                    dayNumber={day.getDate()}
                    isToday={isSameDay(day, today)}
                    isCurrentMonth={isSameMonth(day, currentMonth)}
                    items={dayItems}
                    onNewItem={handleNewItemOnDate}
                  />
                );
              })}
            </div>
          </div>

          {/* DragOverlay — ghost card while dragging */}
          <DragOverlay>
            {activeItem && (
              <div
                className="text-[11px] rounded px-2 py-1 border shadow-lg cursor-grabbing"
                style={{
                  backgroundColor:
                    MARKETING_CONTENT_STATUS[activeItem.status as ContentStatus]?.bg ??
                    "rgba(99,102,241,0.15)",
                  color:
                    MARKETING_CONTENT_STATUS[activeItem.status as ContentStatus]?.color ??
                    "#6366f1",
                  borderLeftWidth: 2,
                }}
              >
                {activeItem.title}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <ContentItemFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setNewItemDate(null); }}
        item={
          newItemDate
            ? ({ scheduled_date: newItemDate } as Partial<ContentItem> as ContentItem)
            : null
        }
      />
    </div>
  );
}

export default function CalendarioPage() {
  return (
    <RequireRole module="marketing">
      <CalendarioContent />
    </RequireRole>
  );
}
