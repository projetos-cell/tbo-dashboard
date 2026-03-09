import type { CSSProperties } from "react";

// ── Status configuration ─────────────────────────────────────────────────────

export const ONE_ON_ONE_STATUS = {
  scheduled: { label: "Agendada", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  completed: { label: "Concluída", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  cancelled: { label: "Cancelada", color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
  no_show: { label: "No-show", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
} as const;

export type OneOnOneStatusKey = keyof typeof ONE_ON_ONE_STATUS;

export const STATUS_KEYS = Object.keys(ONE_ON_ONE_STATUS) as OneOnOneStatusKey[];

// ── Recurrence options ───────────────────────────────────────────────────────

export const RECURRENCE_OPTIONS = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "monthly", label: "Mensal" },
  { value: "", label: "Sem recorrência" },
] as const;

export function recurrenceLabel(value: string | null): string {
  if (!value) return "Única vez";
  const opt = RECURRENCE_OPTIONS.find((o) => o.value === value);
  return opt?.label ?? value;
}

// ── Date helpers ─────────────────────────────────────────────────────────────

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

export function daysFromNow(dateStr: string): number {
  return Math.floor((new Date(dateStr).getTime() - Date.now()) / MS_PER_DAY);
}

export function relativeLabel(dateStr: string): string {
  const diffMs = new Date(dateStr).getTime() - Date.now();
  const absDiff = Math.abs(diffMs);
  const past = diffMs < 0;

  if (absDiff < MS_PER_HOUR) {
    const mins = Math.max(0, Math.floor(absDiff / MS_PER_MINUTE));
    return past ? `${mins}m atrás` : `em ${mins}m`;
  }
  if (absDiff < MS_PER_DAY) {
    const hours = Math.floor(absDiff / MS_PER_HOUR);
    const mins = Math.floor((absDiff % MS_PER_HOUR) / MS_PER_MINUTE);
    return past ? `${hours}h atrás` : `em ${hours}h ${mins}m`;
  }
  const days = Math.floor(absDiff / MS_PER_DAY);
  const hours = Math.floor((absDiff % MS_PER_DAY) / MS_PER_HOUR);
  return past ? `${days}d atrás` : `em ${days}d ${hours}h`;
}

export function isOverdue(status: string | null, scheduledAt: string): boolean {
  return (status === "scheduled" || !status) && new Date(scheduledAt).getTime() < Date.now();
}

export function isUpcoming(status: string | null, scheduledAt: string): boolean {
  return (status === "scheduled" || !status) && new Date(scheduledAt).getTime() >= Date.now();
}

// ── Badge helpers ────────────────────────────────────────────────────────────

export function getStatusBadgeProps(status: string | null): { label: string; style: CSSProperties } {
  const key = (status ?? "scheduled") as OneOnOneStatusKey;
  const cfg = ONE_ON_ONE_STATUS[key] ?? ONE_ON_ONE_STATUS.scheduled;
  return {
    label: cfg.label,
    style: { backgroundColor: cfg.bg, color: cfg.color, border: "none" },
  };
}

// ── Date formatting ──────────────────────────────────────────────────────────

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
