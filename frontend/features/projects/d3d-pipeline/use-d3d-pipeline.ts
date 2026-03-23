import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getD3DFlows,
  getD3DFlowByProject,
  getD3DFlowByToken,
  createD3DFlow,
  updateD3DStageStatus,
  updateD3DStageImage,
  advanceD3DFlow,
  toggleD3DShare,
} from "./service";

// ── Query Keys ───────────────────────────────────────────────────────

const KEYS = {
  all: ["d3d-flows"] as const,
  byProject: (id: string) => ["d3d-flow", "project", id] as const,
  byToken: (token: string) => ["d3d-flow", "token", token] as const,
};

// ── Queries ──────────────────────────────────────────────────────────

/** All D3D flows for tenant */
export function useD3DFlows() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => {
      const supabase = createClient();
      return getD3DFlows(supabase);
    },
  });
}

/** Single flow by project ID */
export function useD3DFlowByProject(projectId: string | undefined) {
  return useQuery({
    queryKey: KEYS.byProject(projectId ?? ""),
    queryFn: () => {
      const supabase = createClient();
      return getD3DFlowByProject(supabase, projectId!);
    },
    enabled: !!projectId,
  });
}

/** Flow by share token (portal) */
export function useD3DFlowByToken(token: string | undefined) {
  return useQuery({
    queryKey: KEYS.byToken(token ?? ""),
    queryFn: () => {
      const supabase = createClient();
      return getD3DFlowByToken(supabase, token!);
    },
    enabled: !!token,
  });
}

// ── Mutations ────────────────────────────────────────────────────────

/** Create flow */
export function useCreateD3DFlow() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenantId);

  return useMutation({
    mutationFn: (projectId: string) => {
      const supabase = createClient();
      return createD3DFlow(supabase, {
        projectId,
        tenantId: tenantId!,
        createdBy: user!.id,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

/** Update stage status */
export function useUpdateStageStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      stageId: string;
      status: string;
      extra?: { approved_by?: string; approval_feedback?: string; notes?: string };
    }) => {
      const supabase = createClient();
      return updateD3DStageStatus(supabase, params.stageId, params.status, params.extra);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

/** Update stage image */
export function useUpdateStageImage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: { stageId: string; imageUrl: string | null }) => {
      const supabase = createClient();
      return updateD3DStageImage(supabase, params.stageId, params.imageUrl);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

/** Advance flow */
export function useAdvanceFlow() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: { flowId: string; nextStageKey: string }) => {
      const supabase = createClient();
      return advanceD3DFlow(supabase, params.flowId, params.nextStageKey);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

/** Toggle share */
export function useToggleD3DShare() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: { flowId: string; enabled: boolean }) => {
      const supabase = createClient();
      return toggleD3DShare(supabase, params.flowId, params.enabled);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
