"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getD3DGateApprovals,
  createGateApproval,
  updateGateApproval,
  getD3DStageRevisions,
  createStageRevision,
  updateRevisionStatus,
  getD3DTimeMetrics,
} from "@/features/projects/services/d3d-enhancements";

const STALE = 1000 * 60 * 5; // 5 min

// ─── Gate Approvals ───────────────────────────────────────────────────────────

export function useGateApprovals(stageId: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["d3d-gate-approvals", tenantId, stageId],
    queryFn: () => {
      const supabase = createClient();
      return getD3DGateApprovals(supabase, stageId);
    },
    staleTime: STALE,
    enabled: !!stageId,
  });
}

export function useCreateGateApproval() {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (params: Parameters<typeof createGateApproval>[1]) => {
      const supabase = createClient();
      return createGateApproval(supabase, params);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["d3d-gate-approvals", tenantId, vars.stage_id],
      });
    },
  });
}

export function useUpdateGateApproval(stageId: string) {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: ({
      id,
      ...params
    }: { id: string } & Parameters<typeof updateGateApproval>[2]) => {
      const supabase = createClient();
      return updateGateApproval(supabase, id, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["d3d-gate-approvals", tenantId, stageId],
      });
    },
  });
}

// ─── Stage Revisions ──────────────────────────────────────────────────────────

export function useStageRevisions(stageId: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["d3d-stage-revisions", tenantId, stageId],
    queryFn: () => {
      const supabase = createClient();
      return getD3DStageRevisions(supabase, stageId);
    },
    staleTime: STALE,
    enabled: !!stageId,
  });
}

export function useCreateStageRevision() {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (params: Parameters<typeof createStageRevision>[1]) => {
      const supabase = createClient();
      return createStageRevision(supabase, params);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["d3d-stage-revisions", tenantId, vars.stage_id],
      });
    },
  });
}

export function useUpdateRevisionStatus(stageId: string) {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: ({
      id,
      ...params
    }: { id: string } & Parameters<typeof updateRevisionStatus>[2]) => {
      const supabase = createClient();
      return updateRevisionStatus(supabase, id, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["d3d-stage-revisions", tenantId, stageId],
      });
    },
  });
}

// ─── Time Metrics ─────────────────────────────────────────────────────────────

export function useD3DTimeMetrics(flowId: string) {
  const tenantId = useAuthStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["d3d-time-metrics", tenantId, flowId],
    queryFn: () => {
      const supabase = createClient();
      return getD3DTimeMetrics(supabase, flowId);
    },
    staleTime: STALE,
    enabled: !!flowId,
  });
}
