// Creative Review — Types

export type ReviewWorkflowStage =
  | "clay_approval"
  | "internal_preview"
  | "client_review"
  | "revisions"
  | "final_approval"
  | "delivered";

export type ReviewProjectStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export type ReviewSceneType = "still" | "animation" | "panorama" | "video";

export type ReviewVersionStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "changes_requested"
  | "superseded";

export type ReviewApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested";

export type SharePermission = "view_only" | "view_comment" | "view_approve";

// ── Interfaces ────────────────────────────────────────────────

export interface ReviewProject {
  id: string;
  tenant_id: string;
  name: string;
  code: string | null;
  client_name: string | null;
  project_id: string | null;
  description: string | null;
  thumbnail_url: string | null;
  workflow_stage: ReviewWorkflowStage;
  status: ReviewProjectStatus;
  created_by: string;
  share_token: string | null;
  share_enabled: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  scenes_count?: number;
  approved_count?: number;
  pending_count?: number;
}

export interface ReviewScene {
  id: string;
  project_id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  scene_type: ReviewSceneType;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined
  latest_version?: ReviewVersion | null;
  versions_count?: number;
  annotations_count?: number;
}

export interface ReviewVersion {
  id: string;
  scene_id: string;
  tenant_id: string;
  version_label: string;
  version_number: number;
  file_url: string;
  file_path: string | null;
  thumbnail_url: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  uploaded_by: string;
  uploaded_by_name: string;
  status: ReviewVersionStatus;
  created_at: string;
  updated_at: string;
  // Joined
  annotations_count?: number;
  approvals?: ReviewApproval[];
}

export interface ReviewAnnotation {
  id: string;
  version_id: string;
  tenant_id: string;
  parent_id: string | null;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  x_pct: number | null;
  y_pct: number | null;
  content: string;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  replies?: ReviewAnnotation[];
}

export interface ReviewApproval {
  id: string;
  version_id: string;
  tenant_id: string;
  user_id: string;
  user_name: string;
  status: ReviewApprovalStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewShareLink {
  id: string;
  project_id: string;
  tenant_id: string;
  token: string;
  reviewer_name: string | null;
  reviewer_email: string | null;
  permissions: SharePermission;
  expires_at: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

// ── Version label helpers ─────────────────────────────────────

export function getVersionLabel(versionNumber: number): string {
  if (versionNumber === 0) return "Clay";
  return `R${String(versionNumber - 1).padStart(2, "0")}`;
}

export function getNextVersionNumber(currentMax: number): number {
  return currentMax + 1;
}

// ── Workflow helpers ──────────────────────────────────────────

export const WORKFLOW_STAGES_ORDER: ReviewWorkflowStage[] = [
  "clay_approval",
  "internal_preview",
  "client_review",
  "revisions",
  "final_approval",
  "delivered",
];

export function getStageIndex(stage: ReviewWorkflowStage): number {
  return WORKFLOW_STAGES_ORDER.indexOf(stage);
}

export function getNextStage(
  stage: ReviewWorkflowStage
): ReviewWorkflowStage | null {
  const idx = getStageIndex(stage);
  if (idx === -1 || idx >= WORKFLOW_STAGES_ORDER.length - 1) return null;
  return WORKFLOW_STAGES_ORDER[idx + 1];
}
