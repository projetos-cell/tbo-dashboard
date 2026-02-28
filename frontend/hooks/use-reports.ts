"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  listRuns,
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
    queryFn: () => listSchedules(supabase, tenantId!),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["report-schedules"] }),
  });
}

export function useDeleteSchedule() {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSchedule(supabase, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["report-schedules"] }),
  });
}

// ── Runs ──────────────────────────────────────────────────────

export function useReportRuns(filters?: {
  scheduleId?: string;
  status?: string;
}) {
  const supabase = useSupabase();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["report-runs", tenantId, filters],
    queryFn: () => listRuns(supabase, tenantId!, filters),
    enabled: !!tenantId,
  });
}
