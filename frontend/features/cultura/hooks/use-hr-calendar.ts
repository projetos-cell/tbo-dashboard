"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  addDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  getHrCalendarEvents,
  createHrCalendarEvent,
  updateHrCalendarEvent,
  deleteHrCalendarEvent,
  getActiveProfiles,
  filterBirthdaysByMonth,
  filterAnniversariesByMonth,
  projectToYear,
  HR_CATEGORY_COLORS,
  type HrCalendarItem,
  type HrEventInsert,
  type HrEventUpdate,
} from "@/features/cultura/services/hr-calendar";

// ── Helpers ──────────────────────────────────────────────────────────

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

/** Get the visible date range of a month grid (42 cells) */
export function getMonthGridRange(date: Date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { locale: ptBR });
  const gridEnd = endOfWeek(monthEnd, { locale: ptBR });
  return {
    startDate: format(gridStart, "yyyy-MM-dd"),
    endDate: format(gridEnd, "yyyy-MM-dd"),
  };
}

/** Get unique months (1-12) that appear in a date range */
function getMonthsInRange(startDate: string, endDate: string): number[] {
  const start = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");
  const months = new Set<number>();
  let cursor = start;
  while (cursor <= end) {
    months.add(cursor.getMonth() + 1);
    cursor = addDays(cursor, 15);
  }
  months.add(end.getMonth() + 1);
  return Array.from(months);
}

// ── Query Hooks ─────────────────────────────────────────────────────

export function useHrCalendarEvents(startDate: string, endDate: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["hr-calendar-events", tenantId, startDate, endDate],
    queryFn: () => getHrCalendarEvents(supabase, startDate, endDate),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!startDate && !!endDate,
  });
}

export function useActiveProfiles() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["active-profiles-hr", tenantId],
    queryFn: () => getActiveProfiles(supabase),
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId,
  });
}

// ── Mutation Hooks ──────────────────────────────────────────────────

export function useCreateHrEvent() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (event: HrEventInsert) => createHrCalendarEvent(supabase, event),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hr-calendar-events"] });
      toast.success("Evento criado");
    },
    onError: () => toast.error("Erro ao criar evento"),
  });
}

export function useUpdateHrEvent() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: HrEventUpdate }) =>
      updateHrCalendarEvent(supabase, id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hr-calendar-events"] });
      toast.success("Evento atualizado");
    },
    onError: () => toast.error("Erro ao atualizar evento"),
  });
}

export function useDeleteHrEvent() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHrCalendarEvent(supabase, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hr-calendar-events"] });
      toast.success("Evento excluído");
    },
    onError: () => toast.error("Erro ao excluir evento"),
  });
}

// ── Orchestration Hook ──────────────────────────────────────────────

export function useMergedHrCalendar(currentDate: Date) {
  const role = useAuthStore((s) => s.role);
  const { startDate, endDate } = useMemo(
    () => getMonthGridRange(currentDate),
    [currentDate],
  );

  const {
    data: dbEvents = [],
    isLoading: eventsLoading,
    error: eventsError,
  } = useHrCalendarEvents(startDate, endDate);

  const {
    data: profiles = [],
    isLoading: profilesLoading,
  } = useActiveProfiles();

  const items = useMemo(() => {
    const viewYear = currentDate.getFullYear();
    const months = getMonthsInRange(startDate, endDate);

    // 1. DB events — project FREQ=YEARLY to current year
    const projected: HrCalendarItem[] = [];
    for (const ev of dbEvents) {
      // Filter leadership-only events for non-admin
      if (ev.visibility === "leadership" && role === "colaborador") continue;

      if (ev.recurrenceRule === "FREQ=YEARLY") {
        const projectedStart = projectToYear(ev.startDate, viewYear);
        const projectedEnd = ev.endDate ? projectToYear(ev.endDate, viewYear) : null;
        // Only include if within visible range
        if (projectedStart >= startDate && projectedStart <= endDate) {
          projected.push({ ...ev, startDate: projectedStart, endDate: projectedEnd });
        }
      } else {
        projected.push(ev);
      }
    }

    // 2. Birthdays
    const birthdays = filterBirthdaysByMonth(profiles, months);
    const birthdayItems: HrCalendarItem[] = birthdays.map((b) => ({
      id: `birthday-${b.id}`,
      title: `Aniversário: ${b.fullName}`,
      description: null,
      category: "aniversario" as const,
      startDate: projectToYear(b.birthDate, viewYear),
      endDate: null,
      isAllDay: true,
      color: HR_CATEGORY_COLORS.aniversario,
      isComputed: true,
      avatarUrl: b.avatarUrl,
      profileId: b.id,
    }));

    // 3. Work anniversaries
    const anniversaries = filterAnniversariesByMonth(profiles, months);
    const anniversaryItems: HrCalendarItem[] = anniversaries
      .filter((a) => {
        const startYear = new Date(a.startDate + "T12:00:00").getFullYear();
        return viewYear > startYear; // Only show after at least 1 year
      })
      .map((a) => {
        const years = viewYear - new Date(a.startDate + "T12:00:00").getFullYear();
        return {
          id: `anniversary-${a.id}`,
          title: `${years} ano${years > 1 ? "s" : ""} de TBO: ${a.fullName}`,
          description: null,
          category: "aniversario_empresa" as const,
          startDate: projectToYear(a.startDate, viewYear),
          endDate: null,
          isAllDay: true,
          color: HR_CATEGORY_COLORS.aniversario_empresa,
          isComputed: true,
          avatarUrl: a.avatarUrl,
          profileId: a.id,
        };
      });

    // Merge & filter to visible range
    const all = [...projected, ...birthdayItems, ...anniversaryItems]
      .filter((item) => item.startDate >= startDate && item.startDate <= endDate)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    return all;
  }, [dbEvents, profiles, currentDate, startDate, endDate, role]);

  return {
    items,
    isLoading: eventsLoading || profilesLoading,
    error: eventsError,
    startDate,
    endDate,
  };
}
