// D3D enhancement types — kept separate to stay under 300-line limit per file

export type GateApprovalStatus = "pending" | "approved" | "rejected";

export interface D3DGateApproval {
  id: string;
  tenant_id: string;
  flow_id: string;
  stage_id: string;
  approver_id: string | null;
  approver_name: string | null;
  approver_email: string | null;
  status: GateApprovalStatus;
  feedback: string | null;
  deadline: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

export type RevisionStatus = "pending" | "approved" | "changes_requested";

export interface D3DStageRevision {
  id: string;
  tenant_id: string;
  flow_id: string;
  stage_id: string;
  revision_number: number;
  image_url: string | null;
  notes: string | null;
  status: RevisionStatus;
  feedback: string | null;
  submitted_by: string;
  created_at: string;
  updated_at: string;
}

export interface D3DStageTimeMetric {
  stage_id: string;
  stage_key: string;
  estimated_days: number | null;
  actual_days: number | null;
  started_at: string | null;
  completed_at: string | null;
  time_spent_hours: number;
}

export interface D3DTimeMetrics {
  stages: D3DStageTimeMetric[];
  total_hours: number;
  average_hours: number;
  bottleneck_stage_id: string | null;
  bottleneck_stage_key: string | null;
}
