"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  listRuns,
  createRun,
} from "@/services/reports";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

// ── Schedules ─────────────────────────────────────────────────

export function useReportSchedules() {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["report-schedules", tenantId],
    queryFn: () => listSchedules(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

export function useCreateSchedule() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: Database["public"]["Tables"]["report_schedules"]["Insert"]) =>
      createSchedule(supabase, s),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["report-schedules"] }),
  });
}

export function useUpdateSchedule() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["report_schedules"]["Update"];
    }) => updateSchedule(supabase, id, updates),
    onMutate: async ({ id, updates }) => {
      await qc.cancelQueries({ queryKey: ["report-schedules"] });
      const previous = qc.getQueryData<Database["public"]["Tables"]["report_schedules"]["Row"][]>(["report-schedules"]);
      if (previous) {
        qc.setQueryData(
          ["report-schedules"],
          previous.map((s) => (s.id === id ? { ...s, ...updates } : s))
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["report-schedules"], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["report-schedules"] }),
  });
}

export function useDeleteSchedule() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSchedule(supabase, id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["report-schedules"] });
      const previous = qc.getQueryData<Database["public"]["Tables"]["report_schedules"]["Row"][]>(["report-schedules"]);
      if (previous) {
        qc.setQueryData(
          ["report-schedules"],
          previous.filter((s) => s.id !== id)
        );
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(["report-schedules"], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["report-schedules"] }),
  });
}

// ── Runs ──────────────────────────────────────────────────────

export function useRetryRun() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (run: { schedule_id: string | null; type: string; tenant_id: string }) =>
      createRun(supabase, {
        schedule_id: run.schedule_id,
        type: run.type,
        tenant_id: run.tenant_id,
        status: "pending",
      } as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["report-runs"] }),
  });
}

export function useReportRuns(filters?: {
  scheduleId?: string;
  status?: string;
}) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["report-runs", tenantId, filters],
    queryFn: () => listRuns(supabase, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ── Realtime ──────────────────────────────────────────────────

export function useReportRunsRealtime() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel("report-runs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "report_runs" },
        () => {
          qc.invalidateQueries({ queryKey: ["report-runs"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, qc, tenantId]);
}
