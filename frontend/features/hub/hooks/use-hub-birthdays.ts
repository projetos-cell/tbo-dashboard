"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getTodayBirthdays,
  getUpcomingBirthdays,
} from "../services/hub-birthdays";
import type { Database } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export function useHubBirthdays() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["hub-birthdays-today", tenantId],
    queryFn: () =>
      getTodayBirthdays(supabase as unknown as SupabaseClient<Database>),
    enabled: !!tenantId,
    staleTime: 30 * 60 * 1000, // 30 min
  });
}

export function useUpcomingBirthdays(days = 7) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["hub-birthdays-upcoming", tenantId, days],
    queryFn: () =>
      getUpcomingBirthdays(
        supabase as unknown as SupabaseClient<Database>,
        days
      ),
    enabled: !!tenantId,
    staleTime: 30 * 60 * 1000,
  });
}
