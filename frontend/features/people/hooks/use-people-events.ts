"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getPersonEvents,
  getAllPeopleEvents,
  type PeopleEventsFilter,
} from "@/features/people/services/people-events";

// ---------------------------------------------------------------------------
// Fase 7 — Hooks for People Events timeline
// ---------------------------------------------------------------------------

/** Per-person event timeline */
export function usePersonEvents(personId: string | undefined, limit = 50) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["people-events", "person", personId, tenantId],
    queryFn: () => getPersonEvents(supabase, personId!, limit),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!personId,
  });
}

/** Global timeline with optional filters */
export function usePeopleEvents(filters?: PeopleEventsFilter, limit = 100) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["people-events", "all", tenantId, filters],
    queryFn: () => getAllPeopleEvents(supabase, filters, limit),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}
