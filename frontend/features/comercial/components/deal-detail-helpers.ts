import {
  IconPhone,
  IconMail,
  IconCalendar,
  IconCheckbox,
  IconTrophy,
  IconX as IconXMark,
  IconGitBranch,
  IconMessage,
  IconNote,
  IconFlame,
  IconSnowflake,
  IconSun,
} from "@tabler/icons-react";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────

export interface DealActivity {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  author_name: string | null;
  occurred_at: string;
  metadata: Record<string, unknown>;
}

export interface ValueEvent {
  stage: string;
  value: number;
  date: string;
}

// ── Formatters ───────────────────────────────────────────

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copiado!");
}

// ── Activity Maps ────────────────────────────────────────

export const ACTIVITY_ICONS: Record<string, typeof IconMessage> = {
  note: IconNote,
  call: IconPhone,
  email: IconMail,
  meeting: IconCalendar,
  task: IconCheckbox,
  won: IconTrophy,
  lost: IconXMark,
  creation: IconGitBranch,
  stage_change: IconGitBranch,
  comment: IconMessage,
  activity: IconMessage,
};

export const ACTIVITY_LABELS: Record<string, string> = {
  note: "Nota",
  call: "Ligação",
  email: "E-mail",
  meeting: "Reunião",
  task: "Tarefa",
  won: "Ganho",
  lost: "Perdido",
  creation: "Criação",
  stage_change: "Mudança de etapa",
  comment: "Comentário",
  activity: "Atividade",
};

export const ACTIVITY_COLORS: Record<string, string> = {
  note: "bg-amber-100 text-amber-700",
  call: "bg-blue-100 text-blue-700",
  email: "bg-violet-100 text-violet-700",
  meeting: "bg-emerald-100 text-emerald-700",
  task: "bg-cyan-100 text-cyan-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
  creation: "bg-gray-100 text-gray-600",
  stage_change: "bg-indigo-100 text-indigo-700",
  comment: "bg-slate-100 text-slate-700",
  activity: "bg-slate-100 text-slate-700",
};

// ── Probability ──────────────────────────────────────────

export function getProbabilityColor(p: number) {
  if (p >= 80) return "bg-green-500";
  if (p >= 50) return "bg-amber-500";
  if (p >= 20) return "bg-orange-500";
  return "bg-red-400";
}

// ── Time in Stage ────────────────────────────────────────

export function getDaysInStage(updatedAt: string | null): number {
  if (!updatedAt) return 0;
  const diff = Date.now() - new Date(updatedAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getStageTimeColor(days: number) {
  if (days <= 7) return "text-green-600 bg-green-50";
  if (days <= 14) return "text-amber-600 bg-amber-50";
  if (days <= 30) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
}

// ── Temperature Score ────────────────────────────────────

export function getTemperature(deal: {
  probability?: number | null;
  value?: number | null;
  updated_at?: string | null;
}): { label: string; icon: typeof IconFlame; color: string; bg: string } {
  const prob = deal.probability ?? 0;
  const val = Number(deal.value) || 0;
  const days = getDaysInStage(deal.updated_at ?? null);

  let score = 0;
  if (prob >= 70) score += 3;
  else if (prob >= 40) score += 2;
  else if (prob >= 20) score += 1;

  if (val >= 80000) score += 2;
  else if (val >= 30000) score += 1;

  if (days <= 7) score += 2;
  else if (days <= 14) score += 1;
  else if (days > 30) score -= 1;

  if (score >= 5) return { label: "Quente", icon: IconFlame, color: "text-red-600", bg: "bg-red-50 border-red-200" };
  if (score >= 3) return { label: "Morno", icon: IconSun, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
  return { label: "Frio", icon: IconSnowflake, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
}

// ── Value History Extraction ─────────────────────────────

export function extractValueHistory(activities: unknown): ValueEvent[] {
  if (!Array.isArray(activities)) return [];
  const events: ValueEvent[] = [];
  for (const a of activities) {
    const act = a as Record<string, unknown>;
    if (act.type === "stage_change" && act.to && act.date) {
      const val = typeof act.closed_value === "number" ? act.closed_value : null;
      if (val != null) {
        events.push({ stage: String(act.to), value: val, date: String(act.date) });
      }
    }
  }
  return events;
}

// ── Loss Reason Labels ───────────────────────────────────

export const LOSS_REASONS: Record<string, { label: string; color: string }> = {
  preco: { label: "Preço", color: "text-red-600" },
  timing: { label: "Timing", color: "text-amber-600" },
  concorrencia: { label: "Concorrência", color: "text-orange-600" },
  escopo: { label: "Escopo", color: "text-violet-600" },
  sem_resposta: { label: "Sem resposta", color: "text-gray-600" },
  outro: { label: "Outro", color: "text-gray-500" },
};
