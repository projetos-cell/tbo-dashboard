import type { CSSProperties } from "react";

// ── Status configuration ─────────────────────────────────────────────────────

export const PDI_STATUS = {
  "Em andamento": { label: "Em andamento", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  Concluido: { label: "Concluído", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  Atrasado: { label: "Atrasado", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  Cancelado: { label: "Cancelado", color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
} as const;

export type PdiStatusKey = keyof typeof PDI_STATUS;

export const PDI_STATUS_KEYS = Object.keys(PDI_STATUS) as PdiStatusKey[];

// ── Goal status configuration ───────────────────────────────────────────────

export const GOAL_STATUS = {
  pending: { label: "Pendente", color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
  in_progress: { label: "Em progresso", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  completed: { label: "Concluída", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  cancelled: { label: "Cancelada", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
} as const;

export type GoalStatusKey = keyof typeof GOAL_STATUS;

export const GOAL_STATUS_KEYS = Object.keys(GOAL_STATUS) as GoalStatusKey[];

// ── Badge helpers ────────────────────────────────────────────────────────────

export function getPdiStatusBadgeProps(status: string): { label: string; style: CSSProperties } {
  const cfg = PDI_STATUS[status as PdiStatusKey] ?? PDI_STATUS["Em andamento"];
  return {
    label: cfg.label,
    style: { backgroundColor: cfg.bg, color: cfg.color, border: "none" },
  };
}

export function getGoalStatusBadgeProps(status: string): { label: string; style: CSSProperties } {
  const cfg = GOAL_STATUS[status as GoalStatusKey] ?? GOAL_STATUS.pending;
  return {
    label: cfg.label,
    style: { backgroundColor: cfg.bg, color: cfg.color, border: "none" },
  };
}

// ── Date formatting ──────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
}
