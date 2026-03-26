// Creative Review — Constants & UI Config

import type {
  ReviewWorkflowStage,
  ReviewProjectStatus,
  ReviewVersionStatus,
  ReviewApprovalStatus,
  ReviewSceneType,
} from "./types";

// ── Workflow Stages ───────────────────────────────────────────

export const WORKFLOW_STAGE_CONFIG: Record<
  ReviewWorkflowStage,
  { label: string; color: string; bg: string; icon: string; description: string }
> = {
  clay_approval: {
    label: "Clay Approval",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    icon: "cube",
    description: "Aprovação de composição e ângulos em clay render",
  },
  internal_preview: {
    label: "Preview Interno",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    icon: "eye",
    description: "QA interno antes de enviar ao cliente",
  },
  client_review: {
    label: "Review Cliente",
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    icon: "user-check",
    description: "Cliente revisa e comenta as imagens",
  },
  revisions: {
    label: "Revisões",
    color: "#eab308",
    bg: "rgba(234,179,8,0.12)",
    icon: "refresh-cw",
    description: "Ajustes sendo aplicados com base no feedback",
  },
  final_approval: {
    label: "Aprovação Final",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    icon: "shield-check",
    description: "Todas as imagens aprovadas pelo cliente",
  },
  delivered: {
    label: "Entregue",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
    icon: "check-circle",
    description: "Projeto finalizado e entregue",
  },
};

// ── Project Status ────────────────────────────────────────────

export const PROJECT_STATUS_CONFIG: Record<
  ReviewProjectStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  draft: {
    label: "Rascunho",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.12)",
    icon: "file-edit",
  },
  active: {
    label: "Ativo",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    icon: "play-circle",
  },
  paused: {
    label: "Pausado",
    color: "#eab308",
    bg: "rgba(234,179,8,0.12)",
    icon: "pause-circle",
  },
  completed: {
    label: "Concluído",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    icon: "check-circle",
  },
  archived: {
    label: "Arquivado",
    color: "#9ca3af",
    bg: "rgba(156,163,175,0.12)",
    icon: "archive",
  },
};

// ── Version Status ────────────────────────────────────────────

export const VERSION_STATUS_CONFIG: Record<
  ReviewVersionStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  pending: {
    label: "Pendente",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.12)",
    icon: "clock",
  },
  in_review: {
    label: "Em Review",
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    icon: "eye",
  },
  approved: {
    label: "Aprovado",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    icon: "check-circle",
  },
  changes_requested: {
    label: "Alterações Solicitadas",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    icon: "alert-triangle",
  },
  superseded: {
    label: "Substituído",
    color: "#9ca3af",
    bg: "rgba(156,163,175,0.12)",
    icon: "arrow-up-circle",
  },
};

// ── Approval Status ───────────────────────────────────────────

export const APPROVAL_STATUS_CONFIG: Record<
  ReviewApprovalStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  pending: {
    label: "Pendente",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.12)",
    icon: "clock",
  },
  approved: {
    label: "Aprovado",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    icon: "check",
  },
  rejected: {
    label: "Rejeitado",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    icon: "x",
  },
  changes_requested: {
    label: "Alterações",
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    icon: "message-circle",
  },
};

// ── Scene Types ───────────────────────────────────────────────

export const SCENE_TYPE_CONFIG: Record<
  ReviewSceneType,
  { label: string; icon: string }
> = {
  still: { label: "Imagem Estática", icon: "image" },
  animation: { label: "Animação", icon: "film" },
  panorama: { label: "Panorama 360°", icon: "rotate-3d" },
  video: { label: "Vídeo", icon: "video" },
};

// ── Upload Config ─────────────────────────────────────────────

export const REVIEW_BUCKET = "review-assets";
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/tiff",
  "image/avif",
];
export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
