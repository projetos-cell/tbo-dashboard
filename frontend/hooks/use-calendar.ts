"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/lib/supabase/types";
import {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
} from "@/services/calendar";

export function useCalendarEvents(timeMin: string, timeMax: string) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["calendar-events", tenantId, timeMin, timeMax],
    queryFn: () => getCalendarEvents(supabase, tenantId!, timeMin, timeMax),
    enabled: !!tenantId && !!timeMin && !!timeMax,
  });
}

export function useCreateCalendarEvent() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      event: Database["public"]["Tables"]["calendar_events"]["Insert"]
    ) => createCalendarEvent(supabase, event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCalendarEvent(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}
