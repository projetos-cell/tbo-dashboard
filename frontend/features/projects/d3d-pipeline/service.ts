import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { D3DFlow, D3DStageState, D3DPipelineData } from "./types";
import { D3D_STAGE_CONFIGS } from "./constants";

type Supabase = SupabaseClient<Database>;

// Tables not yet in generated types — use untyped helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const d3d = (supabase: Supabase) => ({
  flows: () => (supabase as unknown as SupabaseClient).from("project_d3d_flows"),
  stages: () => (supabase as unknown as SupabaseClient).from("project_d3d_stages"),
});

// ── Queries ──────────────────────────────────────────────────────────

/** Get all D3D flows for the tenant (with project info) */
export async function getD3DFlows(supabase: Supabase): Promise<D3DPipelineData[]> {
  const { data: flows, error } = await d3d(supabase)
    .flows()
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!flows || flows.length === 0) return [];

  const flowIds = (flows as D3DFlow[]).map((f) => f.id);
  const projectIds = (flows as D3DFlow[]).map((f) => f.project_id);

  const [stagesRes, projectsRes] = await Promise.all([
    d3d(supabase).stages().select("*").in("flow_id", flowIds).order("sort_order"),
    supabase.from("projects").select("id, name, client, bus").in("id", projectIds),
  ]);

  if (stagesRes.error) throw stagesRes.error;

  const stagesByFlow = new Map<string, D3DStageState[]>();
  for (const s of (stagesRes.data ?? []) as D3DStageState[]) {
    const arr = stagesByFlow.get(s.flow_id) ?? [];
    arr.push(s);
    stagesByFlow.set(s.flow_id, arr);
  }

  const projectMap = new Map(
    (projectsRes.data ?? []).map((p) => [
      p.id,
      { id: p.id, name: p.name, client_name: p.client, bu: (p.bus as string[] | null)?.[0] ?? null },
    ])
  );

  return (flows as D3DFlow[]).map((flow) => ({
    flow,
    stages: stagesByFlow.get(flow.id) ?? [],
    project: projectMap.get(flow.project_id) ?? undefined,
  }));
}

/** Get a single D3D flow by project ID */
export async function getD3DFlowByProject(
  supabase: Supabase,
  projectId: string
): Promise<D3DPipelineData | null> {
  const { data: flow, error } = await d3d(supabase)
    .flows()
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  if (!flow) return null;

  const typedFlow = flow as D3DFlow;

  const [stagesRes, projectRes] = await Promise.all([
    d3d(supabase).stages().select("*").eq("flow_id", typedFlow.id).order("sort_order"),
    supabase.from("projects").select("id, name, client, bus").eq("id", projectId).single(),
  ]);

  const p = projectRes.data;

  return {
    flow: typedFlow,
    stages: (stagesRes.data ?? []) as D3DStageState[],
    project: p
      ? { id: p.id, name: p.name, client_name: p.client, bu: (p.bus as string[] | null)?.[0] ?? null }
      : undefined,
  };
}

/** Get flow by share token (portal cliente — no auth required) */
export async function getD3DFlowByToken(
  supabase: Supabase,
  token: string
): Promise<D3DPipelineData | null> {
  const { data: flow, error } = await d3d(supabase)
    .flows()
    .select("*")
    .eq("share_token", token)
    .eq("share_enabled", true)
    .maybeSingle();

  if (error) throw error;
  if (!flow) return null;

  const typedFlow = flow as D3DFlow;

  const [stagesRes, projectRes] = await Promise.all([
    d3d(supabase).stages().select("*").eq("flow_id", typedFlow.id).order("sort_order"),
    supabase.from("projects").select("id, name, client, bus").eq("id", typedFlow.project_id).single(),
  ]);

  const p = projectRes.data;

  return {
    flow: typedFlow,
    stages: (stagesRes.data ?? []) as D3DStageState[],
    project: p
      ? { id: p.id, name: p.name, client_name: p.client, bu: (p.bus as string[] | null)?.[0] ?? null }
      : undefined,
  };
}

// ── Mutations ────────────────────────────────────────────────────────

/** Create a new D3D flow for a project, initializing all stages */
export async function createD3DFlow(
  supabase: Supabase,
  params: { projectId: string; tenantId: string; createdBy: string }
): Promise<D3DFlow> {
  const { data: flow, error } = await d3d(supabase)
    .flows()
    .insert({
      project_id: params.projectId,
      tenant_id: params.tenantId,
      created_by: params.createdBy,
      current_stage: "00_briefing",
      share_token: crypto.randomUUID().replace(/-/g, "").slice(0, 16),
    })
    .select("*")
    .single();

  if (error) throw error;

  const typedFlow = flow as D3DFlow;

  // Create all stages
  const stages = D3D_STAGE_CONFIGS.map((config, idx) => ({
    flow_id: typedFlow.id,
    stage_key: config.key,
    stage_type: config.type,
    status: idx === 0 ? "in_progress" : "pending",
    sort_order: idx,
    estimated_days: config.estimatedDaysNum,
    tenant_id: params.tenantId,
  }));

  const { error: stagesError } = await d3d(supabase).stages().insert(stages);

  if (stagesError) throw stagesError;

  return typedFlow;
}

/** Update a stage's status */
export async function updateD3DStageStatus(
  supabase: Supabase,
  stageId: string,
  status: string,
  extra?: { approved_by?: string; approval_feedback?: string; notes?: string }
): Promise<void> {
  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    status,
    updated_at: now,
    ...extra,
  };

  if (status === "in_progress") {
    updates.started_at = now;
  }
  if (status === "completed" || status === "approved") {
    updates.completed_at = now;
  }

  const { error } = await d3d(supabase).stages().update(updates).eq("id", stageId);

  if (error) throw error;
}

/** Update stage image URL */
export async function updateD3DStageImage(
  supabase: Supabase,
  stageId: string,
  imageUrl: string | null
): Promise<void> {
  const { error } = await d3d(supabase)
    .stages()
    .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
    .eq("id", stageId);

  if (error) throw error;
}

/** Advance flow to next stage */
export async function advanceD3DFlow(
  supabase: Supabase,
  flowId: string,
  nextStageKey: string
): Promise<void> {
  const { error } = await d3d(supabase)
    .flows()
    .update({ current_stage: nextStageKey, updated_at: new Date().toISOString() })
    .eq("id", flowId);

  if (error) throw error;
}

/** Toggle share for portal cliente */
export async function toggleD3DShare(
  supabase: Supabase,
  flowId: string,
  enabled: boolean
): Promise<string | null> {
  const updates: Record<string, unknown> = {
    share_enabled: enabled,
    updated_at: new Date().toISOString(),
  };

  if (enabled) {
    const { data: existing } = await d3d(supabase)
      .flows()
      .select("share_token")
      .eq("id", flowId)
      .single();

    if (!(existing as D3DFlow | null)?.share_token) {
      updates.share_token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    }
  }

  const { data, error } = await d3d(supabase)
    .flows()
    .update(updates)
    .eq("id", flowId)
    .select("share_token")
    .single();

  if (error) throw error;
  return (data as D3DFlow | null)?.share_token ?? null;
}
