import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
export type {
  GateApprovalStatus,
  D3DGateApproval,
  RevisionStatus,
  D3DStageRevision,
  D3DStageTimeMetric,
  D3DTimeMetrics,
} from "./d3d-enhancement-types";
import type {
  GateApprovalStatus,
  D3DGateApproval,
  RevisionStatus,
  D3DStageRevision,
  D3DTimeMetrics,
} from "./d3d-enhancement-types";

// Tables not yet in generated types — use untyped helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tbl = (supabase: SupabaseClient<Database>, name: string) =>
  (supabase as unknown as SupabaseClient).from(name);

// ─── Gate Approvals ───────────────────────────────────────────────────────────

export async function getD3DGateApprovals(
  supabase: SupabaseClient<Database>,
  stageId: string,
): Promise<D3DGateApproval[]> {
  const { data, error } = await tbl(supabase, "d3d_gate_approvals")
    .select("*")
    .eq("stage_id", stageId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as D3DGateApproval[];
}

export async function createGateApproval(
  supabase: SupabaseClient<Database>,
  params: {
    tenant_id: string;
    flow_id: string;
    stage_id: string;
    approver_id?: string | null;
    approver_name?: string | null;
    approver_email?: string | null;
    deadline?: string | null;
  },
): Promise<D3DGateApproval> {
  const { data, error } = await tbl(supabase, "d3d_gate_approvals")
    .insert({
      tenant_id: params.tenant_id,
      flow_id: params.flow_id,
      stage_id: params.stage_id,
      approver_id: params.approver_id ?? null,
      approver_name: params.approver_name ?? null,
      approver_email: params.approver_email ?? null,
      deadline: params.deadline ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data as D3DGateApproval;
}

export async function updateGateApproval(
  supabase: SupabaseClient<Database>,
  id: string,
  params: {
    status: GateApprovalStatus;
    feedback?: string | null;
  },
): Promise<void> {
  const { error } = await tbl(supabase, "d3d_gate_approvals")
    .update({
      status: params.status,
      feedback: params.feedback ?? null,
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

/** Returns true only when every approver has status = 'approved' */
export async function isGateFullyApproved(
  supabase: SupabaseClient<Database>,
  stageId: string,
): Promise<boolean> {
  const { data, error } = await tbl(supabase, "d3d_gate_approvals")
    .select("status")
    .eq("stage_id", stageId);

  if (error) throw error;
  const approvals = (data ?? []) as Pick<D3DGateApproval, "status">[];
  if (approvals.length === 0) return false;
  return approvals.every((a) => a.status === "approved");
}

// ─── Stage Revisions ──────────────────────────────────────────────────────────

export async function getD3DStageRevisions(
  supabase: SupabaseClient<Database>,
  stageId: string,
): Promise<D3DStageRevision[]> {
  const { data, error } = await tbl(supabase, "d3d_stage_revisions")
    .select("*")
    .eq("stage_id", stageId)
    .order("revision_number", { ascending: true });

  if (error) throw error;
  return (data ?? []) as D3DStageRevision[];
}

export async function createStageRevision(
  supabase: SupabaseClient<Database>,
  params: {
    tenant_id: string;
    flow_id: string;
    stage_id: string;
    image_url?: string | null;
    notes?: string | null;
    submitted_by: string;
  },
): Promise<D3DStageRevision> {
  // Auto-increment revision_number for this stage
  const { data: existing } = await tbl(supabase, "d3d_stage_revisions")
    .select("revision_number")
    .eq("stage_id", params.stage_id)
    .order("revision_number", { ascending: false })
    .limit(1);

  const lastNum =
    ((existing as { revision_number: number }[] | null)?.[0]?.revision_number ?? 0);
  const nextNum = lastNum + 1;

  const { data, error } = await tbl(supabase, "d3d_stage_revisions")
    .insert({
      tenant_id: params.tenant_id,
      flow_id: params.flow_id,
      stage_id: params.stage_id,
      revision_number: nextNum,
      image_url: params.image_url ?? null,
      notes: params.notes ?? null,
      submitted_by: params.submitted_by,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data as D3DStageRevision;
}

export async function updateRevisionStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  params: {
    status: RevisionStatus;
    feedback?: string | null;
  },
): Promise<void> {
  const { error } = await tbl(supabase, "d3d_stage_revisions")
    .update({
      status: params.status,
      feedback: params.feedback ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

// ─── Time Metrics ─────────────────────────────────────────────────────────────

export async function getD3DTimeMetrics(
  supabase: SupabaseClient<Database>,
  flowId: string,
): Promise<D3DTimeMetrics> {
  const { data, error } = await (supabase as unknown as SupabaseClient)
    .from("project_d3d_stages")
    .select(
      "id,stage_key,estimated_days,actual_days,started_at,completed_at,time_spent_hours",
    )
    .eq("flow_id", flowId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const rawStages = (data ?? []) as {
    id: string;
    stage_key: string;
    estimated_days: number | null;
    actual_days: number | null;
    started_at: string | null;
    completed_at: string | null;
    time_spent_hours?: number | null;
  }[];

  const stages: D3DStageTimeMetric[] = rawStages.map((s) => {
    let timeSpent = s.time_spent_hours ?? 0;

    // If no explicit time_spent_hours but we have start/end, compute from actual_days
    if (!timeSpent && s.actual_days) {
      timeSpent = s.actual_days * 8; // 8h workday
    } else if (!timeSpent && s.started_at && s.completed_at) {
      const ms =
        new Date(s.completed_at).getTime() - new Date(s.started_at).getTime();
      timeSpent = Math.round(ms / (1000 * 60 * 60));
    }

    return {
      stage_id: s.id,
      stage_key: s.stage_key,
      estimated_days: s.estimated_days,
      actual_days: s.actual_days,
      started_at: s.started_at,
      completed_at: s.completed_at,
      time_spent_hours: timeSpent,
    };
  });

  const workingStages = stages.filter((s) => s.time_spent_hours > 0);
  const total_hours = workingStages.reduce((acc, s) => acc + s.time_spent_hours, 0);
  const average_hours =
    workingStages.length > 0 ? total_hours / workingStages.length : 0;

  // Bottleneck: any stage with time > 2x average
  const bottleneck = workingStages.find(
    (s) => average_hours > 0 && s.time_spent_hours > average_hours * 2,
  );

  return {
    stages,
    total_hours,
    average_hours,
    bottleneck_stage_id: bottleneck?.stage_id ?? null,
    bottleneck_stage_key: bottleneck?.stage_key ?? null,
  };
}

export async function updateStageTimeSpent(
  supabase: SupabaseClient<Database>,
  stageId: string,
  hours: number,
): Promise<void> {
  const { error } = await (supabase as unknown as SupabaseClient)
    .from("project_d3d_stages")
    .update({
      time_spent_hours: hours,
      actual_days: Math.ceil(hours / 8),
      updated_at: new Date().toISOString(),
    })
    .eq("id", stageId);

  if (error) throw error;
}
