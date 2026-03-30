"use client";

// Feature #77 — Persistência de filtros ativos por rota (salvo em Supabase por view_id)

import { useState, useEffect, useCallback, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Persists view-level filter state to Supabase `view_filters` table.
 * Falls back to in-memory state if the table does not yet exist (pre-migration).
 *
 * Usage:
 *   const { filters, setFilters, isLoaded } = useViewFilters("marketing-campanhas", defaultFilters);
 */
export function useViewFilters<T extends Record<string, unknown>>(
  viewId: string,
  defaultFilters: T,
) {
  const [filters, setFiltersState] = useState<T>(defaultFilters);
  const [isLoaded, setIsLoaded] = useState(false);
  const tenantId = useAuthStore((s) => s.tenantId);
  const supabase = createClient();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from Supabase on mount
  useEffect(() => {
    if (!tenantId) return;

    async function load() {
      try {
        const sb = supabase as unknown as SupabaseClient;
        const { data } = await sb
          .from("view_filters")
          .select("filters")
          .eq("view_id", `${tenantId}:${viewId}`)
          .maybeSingle() as { data: { filters: unknown } | null };

        if (data?.filters) {
          const raw = data.filters;
          const parsed: Record<string, unknown> =
            typeof raw === "string"
              ? (JSON.parse(raw) as Record<string, unknown>)
              : (raw as Record<string, unknown>);
          setFiltersState({ ...defaultFilters, ...parsed } as T);
        }
      } catch {
        // Table may not exist yet (pre-migration) — use defaults
      } finally {
        setIsLoaded(true);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, viewId]);

  // Debounced save to Supabase
  const setFilters = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setFiltersState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;

        // Debounce save
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
          if (!tenantId) return;
          try {
            const sb = supabase as unknown as SupabaseClient;
            await sb.from("view_filters").upsert(
              {
                view_id: `${tenantId}:${viewId}`,
                tenant_id: tenantId,
                filters: JSON.stringify(next),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "view_id" },
            );
          } catch {
            // Silently fail — table may not exist yet
          }
        }, 800);

        return next;
      });
    },
    [tenantId, viewId, supabase],
  );

  return { filters, setFilters, isLoaded };
}
