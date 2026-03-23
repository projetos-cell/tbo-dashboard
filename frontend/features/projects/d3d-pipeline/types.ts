// ── D3D Pipeline Types ─────────────────────────────────────────────

export type D3DStageStatus = "pending" | "in_progress" | "completed" | "approved" | "changes_requested";
export type D3DStageType = "phase" | "gate";

/** Stage definition (static config) */
export interface D3DStageConfig {
  key: string;
  type: D3DStageType;
  label: string;
  subtitle: string;
  description: string;
  estimatedDays: string;
  estimatedDaysNum: number;
  color: string;
  tag: "input" | "producao" | "output" | "aprovacao";
  owner: string;
  deliverables: D3DDeliverable[];
  specs?: D3DSpec[];
}

export interface D3DDeliverable {
  icon: string;
  iconType: "ref" | "model" | "render" | "check";
  label: string;
  specs?: D3DSpec[];
}

export interface D3DSpec {
  label: string;
  type: "format" | "res" | "channel";
}

/** Stage state (from DB) */
export interface D3DStageState {
  id: string;
  flow_id: string;
  stage_key: string;
  stage_type: D3DStageType;
  status: D3DStageStatus;
  sort_order: number;
  image_url: string | null;
  started_at: string | null;
  completed_at: string | null;
  approved_by: string | null;
  approval_feedback: string | null;
  estimated_days: number | null;
  actual_days: number | null;
  notes: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

/** Flow (from DB) */
export interface D3DFlow {
  id: string;
  project_id: string;
  tenant_id: string;
  current_stage: string;
  total_estimated_days: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  share_token: string | null;
  share_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/** Combined flow + stages for UI */
export interface D3DPipelineData {
  flow: D3DFlow;
  stages: D3DStageState[];
  project?: {
    id: string;
    name: string;
    client_name?: string | null;
    bu?: string | null;
  };
}
