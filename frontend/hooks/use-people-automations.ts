"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  runPeopleAutomations,
  isAutomationEnabled,
  setAutomationEnabled,
  type AutomationResult,
} from "@/services/people-automations";

// ---------------------------------------------------------------------------
// Fase 6 — Hook: runs automations once per module access (debounced)
// ---------------------------------------------------------------------------

/** Minimum interval between automation runs (minutes) */
const RUN_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

const STORAGE_KEY = "tbo_people_automations_last_run";

function shouldRun(): boolean {
  try {
    const last = localStorage.getItem(STORAGE_KEY);
    if (!last) return true;
    return Date.now() - Number(last) > RUN_INTERVAL_MS;
  } catch {
    return true;
  }
}

function markRan(): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // localStorage may be unavailable
  }
}

// ---------------------------------------------------------------------------
// usePeopleAutomations — fire-and-forget on module mount
// ---------------------------------------------------------------------------

export function usePeopleAutomations(): {
  lastResult: AutomationResult | null;
  isRunning: boolean;
} {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const hasRun = useRef(false);

  const mutation = useMutation({
    mutationKey: ["people-automations-run"],
    mutationFn: async () => {
      if (!tenantId || !userId) return null;
      return runPeopleAutomations(supabase, tenantId, userId);
    },
    onSuccess: (result) => {
      if (!result) return;
      // Invalidate caches if any tasks were created
      if (result.tasksCreated.length > 0 || result.alertsLogged.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["people"] });
        queryClient.invalidateQueries({ queryKey: ["people-kpis"] });
        queryClient.invalidateQueries({ queryKey: ["people-snapshot"] });
        queryClient.invalidateQueries({ queryKey: ["people-critical-score-count"] });
        queryClient.invalidateQueries({ queryKey: ["people-events"] });
      }
      markRan();
    },
  });

  // Run once on mount if enough time has passed
  useEffect(() => {
    if (hasRun.current) return;
    if (!tenantId || !userId) return;
    if (!shouldRun()) return;

    hasRun.current = true;
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, userId]);

  return {
    lastResult: (mutation.data as AutomationResult | undefined) ?? null,
    isRunning: mutation.isPending,
  };
}

// ---------------------------------------------------------------------------
// useAutomationSettings — toggle ON/OFF
// ---------------------------------------------------------------------------

export function useAutomationEnabled() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const queryClient = useQueryClient();

  const query = {
    queryKey: ["people-automations-enabled", tenantId],
    queryFn: async () => {
      if (!tenantId) return true;
      return isAutomationEnabled(supabase, tenantId);
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId,
  };

  const toggle = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!tenantId) return;
      await setAutomationEnabled(supabase, tenantId, enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people-automations-enabled"] });
    },
  });

  return { query, toggle };
}
