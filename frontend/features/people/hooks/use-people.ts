"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import { logPeopleEvent, type EventSeverity } from "@/features/people/services/people-events";
import type { Database } from "@/lib/supabase/types";
import type { PeopleFiltersSpec } from "@/features/people/utils/people-filters";
import type { SortSpec } from "@/services/view-state";
import {
  getPeople,
  getPersonById,
  updatePerson,
  getTeams,
  getProfiles,
  getPeopleKPIs,
  getCriticalScoreCount,
  type PeopleNudgeCounts,
} from "@/features/people/services/people";
import {
  getPeopleSnapshots,
  type PeopleSnapshotMap,
  type PersonSnapshot,
} from "@/features/people/services/people-snapshot";

// ---------------------------------------------------------------------------
// usePeople — full filter engine (server-side)
// ---------------------------------------------------------------------------

export function usePeople(
  filters?: PeopleFiltersSpec,
  sort?: SortSpec[],
  pagination?: { page: number; pageSize: number }
) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["people", tenantId, filters, sort, pagination],
    queryFn: () => getPeople(supabase, tenantId!, filters, sort, pagination),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function usePerson(id: string | undefined) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["person", id],
    queryFn: () => getPersonById(supabase, id!, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!id && !!tenantId,
  });
}

export function useUpdatePerson() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["profiles"]["Update"];
    }) => updatePerson(supabase, id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["people-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["person"] });
      queryClient.invalidateQueries({ queryKey: ["people-events"] });

      const userId = useAuthStore.getState().user?.id ?? "unknown";
      const tenantId = useAuthStore.getState().tenantId;

      const action = variables.updates.role ? "permission_change" : "update";
      logAuditTrail({
        userId,
        action,
        table: "profiles",
        recordId: variables.id,
        after: variables.updates as Record<string, unknown>,
      });

      // Fase 7 — emit people events (fire-and-forget)
      if (tenantId) {
        const sb = createClient();

        // Status change event
        if (variables.updates.status !== undefined) {
          logPeopleEvent(sb, tenantId, variables.id, userId, "status_changed", "info", {
            summary: `Status alterado para ${variables.updates.status}`,
            new_value: variables.updates.status,
          });
        }

        // Performance score change event
        if (variables.updates.media_avaliacao !== undefined) {
          const score = variables.updates.media_avaliacao as number | null;
          let severity: EventSeverity = "info";
          if (score !== null && score < 45) severity = "critical";
          else if (score !== null && score < 60) severity = "warning";

          logPeopleEvent(sb, tenantId, variables.id, userId, "performance_changed", severity, {
            summary: `Score de performance atualizado para ${score ?? "N/A"}`,
            new_value: score,
          });
        }
      }
    },
  });
}

export function useTeams() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["teams", tenantId],
    queryFn: () => getTeams(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ---------------------------------------------------------------------------
// usePeopleKPIs — 8 fixed KPIs via RPC
// ---------------------------------------------------------------------------

export function usePeopleKPIs() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["people-kpis", tenantId],
    queryFn: () => getPeopleKPIs(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ---------------------------------------------------------------------------
// usePeopleNudges — Fase 5: deterministic action nudges
// Combines existing KPI counts with critical_score count
// ---------------------------------------------------------------------------

export function usePeopleNudges(): {
  data: PeopleNudgeCounts | undefined;
  isLoading: boolean;
} {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  const { data: kpis, isLoading: kpisLoading } = usePeopleKPIs();

  const criticalQuery = useQuery({
    queryKey: ["people-critical-score-count", tenantId],
    queryFn: () => getCriticalScoreCount(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });

  const isLoading = kpisLoading || criticalQuery.isLoading;

  if (!kpis || criticalQuery.data === undefined) {
    return { data: undefined, isLoading };
  }

  return {
    data: {
      pending_1on1: kpis.pending_1on1,
      stale_pdi: kpis.stale_pdi,
      critical_score: criticalQuery.data,
      overloaded: kpis.overloaded,
    },
    isLoading,
  };
}

// ---------------------------------------------------------------------------
// useProfiles — lightweight picker
// ---------------------------------------------------------------------------

export function useProfiles() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["profiles", tenantId],
    queryFn: () => getProfiles(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ---------------------------------------------------------------------------
// usePeopleFilterOptions — distinct values for filter dropdowns
// ---------------------------------------------------------------------------

interface FilterOptions {
  areas: string[];
  teams: string[];
  seniorities: string[];
  employmentTypes: string[];
  leaders: { id: string; name: string }[];
}

export function usePeopleFilterOptions() {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery<FilterOptions>({
    queryKey: ["people-filter-options", tenantId],
    queryFn: async () => {
      const [areasRes, teamsRes, seniorRes, contractRes, leadersRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("bu")
            .eq("tenant_id", tenantId!)
            .not("bu", "is", null)
            .order("bu"),
          supabase
            .from("profiles")
            .select("department")
            .eq("tenant_id", tenantId!)
            .not("department", "is", null)
            .order("department"),
          supabase
            .from("profiles")
            .select("nivel_atual")
            .eq("tenant_id", tenantId!)
            .not("nivel_atual", "is", null)
            .order("nivel_atual"),
          supabase
            .from("profiles")
            .select("contract_type")
            .eq("tenant_id", tenantId!)
            .not("contract_type", "is", null)
            .order("contract_type"),
          supabase
            .from("profiles")
            .select("id,full_name")
            .eq("tenant_id", tenantId!)
            .eq("is_coordinator", true)
            .order("full_name"),
        ]);

      return {
        areas: dedupe(areasRes.data?.map((r) => r.bu) ?? []),
        teams: dedupe(teamsRes.data?.map((r) => r.department) ?? []),
        seniorities: dedupe(seniorRes.data?.map((r) => r.nivel_atual) ?? []),
        employmentTypes: dedupe(contractRes.data?.map((r) => r.contract_type) ?? []),
        leaders: (leadersRes.data ?? []).map((r) => ({
          id: r.id,
          name: r.full_name ?? "Sem nome",
        })),
      };
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId,
  });
}

// ---------------------------------------------------------------------------
// usePeopleSnapshot — aggregated micro-metrics for card display
// ---------------------------------------------------------------------------

export function usePeopleSnapshot(
  people: Array<{ id: string; media_avaliacao: number | null }> | undefined
) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  const personIds = people?.map((p) => p.id) ?? [];
  const enabled = !!tenantId && personIds.length > 0;

  // Build a stable key from sorted IDs to avoid re-fetching on reorder
  const idsKey = personIds.slice().sort().join(",");

  return useQuery<PeopleSnapshotMap>({
    queryKey: ["people-snapshot", tenantId, idsKey],
    queryFn: async () => {
      const snapshots = await getPeopleSnapshots(supabase, tenantId!, personIds);

      // Merge performance_score from profiles (already fetched, avoids extra query)
      if (people) {
        for (const p of people) {
          if (snapshots[p.id]) {
            snapshots[p.id].performance_score = p.media_avaliacao;
          }
        }
      }

      return snapshots;
    },
    staleTime: 1000 * 60 * 5,
    enabled,
  });
}

function dedupe(arr: (string | null)[]): string[] {
  return [...new Set(arr.filter((v): v is string => v !== null))];
}
