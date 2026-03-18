import type { OmieSyncLog } from "../services/omie-sync";

// ── Types ────────────────────────────────────────────────────────────────────

export type SyncState = "syncing" | "success" | "partial" | "error" | "stale" | "never";

// ── Pure helpers ─────────────────────────────────────────────────────────────

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `há ${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `há ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  return `há ${Math.floor(hrs / 24)}d`;
}

export function resolveSyncState(
  latest: OmieSyncLog | null,
  isStale: boolean,
  isPending: boolean
): SyncState {
  if (isPending) return "syncing";
  if (!latest) return "never";
  if (isStale) return "stale";
  if (latest.status === "running") return "syncing";
  if (latest.status === "success") return "success";
  if (latest.status === "partial") return "partial";
  if (latest.status === "error") return "error";
  return "never";
}

export function getTotalRecords(log: OmieSyncLog): number {
  return (
    (log.vendors_synced ?? 0) +
    (log.clients_synced ?? 0) +
    (log.payables_synced ?? 0) +
    (log.receivables_synced ?? 0) +
    (log.categories_synced ?? 0) +
    (log.bank_accounts_synced ?? 0)
  );
}

// ── Style config ─────────────────────────────────────────────────────────────

export const STATE_CONFIG: Record<
  SyncState,
  {
    container: string;
    dot: string;
    label: string;
    actionLabel: string;
  }
> = {
  success: {
    container: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
    dot: "bg-emerald-500",
    label: "Sincronizado",
    actionLabel: "Sync",
  },
  syncing: {
    container: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    dot: "bg-blue-500 animate-pulse",
    label: "Sincronizando...",
    actionLabel: "",
  },
  partial: {
    container: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
    dot: "bg-amber-500",
    label: "Sync parcial",
    actionLabel: "Sync",
  },
  error: {
    container: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    dot: "bg-red-500",
    label: "Erro na sync",
    actionLabel: "Tentar novamente",
  },
  stale: {
    container: "bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-700",
    dot: "bg-gray-400",
    label: "Sync travada",
    actionLabel: "Forçar nova sync",
  },
  never: {
    container: "bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-700",
    dot: "bg-gray-400",
    label: "Nunca sincronizado",
    actionLabel: "Sincronizar agora",
  },
};

// ── Freshness detection ─────────────────────────────────────────────────────

export type FreshnessLevel = "fresh" | "aging" | "stale" | "unknown";

const FRESHNESS_THRESHOLD_AGING_MS = 4 * 60 * 60 * 1000; // 4h
const FRESHNESS_THRESHOLD_STALE_MS = 6 * 60 * 60 * 1000; // 6h

export function getSyncFreshness(latest: OmieSyncLog | null): {
  level: FreshnessLevel;
  label: string;
  ageMs: number;
} {
  if (!latest || !latest.finished_at) {
    return { level: "unknown", label: "Sem dados de sync", ageMs: 0 };
  }

  const ageMs = Date.now() - new Date(latest.finished_at).getTime();

  if (ageMs < FRESHNESS_THRESHOLD_AGING_MS) {
    return { level: "fresh", label: `Atualizado ${formatRelativeTime(latest.finished_at)}`, ageMs };
  }
  if (ageMs < FRESHNESS_THRESHOLD_STALE_MS) {
    return { level: "aging", label: `Dados de ${formatRelativeTime(latest.finished_at)}`, ageMs };
  }
  return { level: "stale", label: `Desatualizado — ${formatRelativeTime(latest.finished_at)}`, ageMs };
}

export const FRESHNESS_STYLES: Record<FreshnessLevel, { dot: string; text: string }> = {
  fresh: { dot: "bg-emerald-500", text: "text-emerald-700" },
  aging: { dot: "bg-amber-500", text: "text-amber-700" },
  stale: { dot: "bg-red-500 animate-pulse", text: "text-red-700" },
  unknown: { dot: "bg-gray-400", text: "text-gray-500" },
};

// ── Tooltip builder ─────────────────────────────────────────────────────────

export function buildTooltipLines(
  latest: OmieSyncLog | null,
  state: SyncState
): string[] {
  if (!latest) return [];

  const lines: string[] = [];
  const timeRef = latest.finished_at ?? latest.started_at;
  lines.push(`Último sync: ${new Date(timeRef).toLocaleString("pt-BR")}`);

  if (latest.trigger_source) {
    const sources: Record<string, string> = {
      manual: "Manual",
      cron: "Automático",
      webhook: "Webhook",
    };
    lines.push(`Origem: ${sources[latest.trigger_source] ?? latest.trigger_source}`);
  }

  if (latest.duration_ms) {
    lines.push(`Duração: ${(latest.duration_ms / 1000).toFixed(1)}s`);
  }

  if (state === "success" || state === "partial") {
    const total = getTotalRecords(latest);
    lines.push(
      `Registros: ${total} (${latest.vendors_synced ?? 0} forn · ${latest.clients_synced ?? 0} cli · ${latest.payables_synced ?? 0} AP · ${latest.receivables_synced ?? 0} AR)`
    );
  }

  if (latest.errors && latest.errors.length > 0) {
    lines.push(`⚠ ${latest.errors.length} erro(s):`);
    latest.errors.slice(0, 3).forEach((e) => {
      const label = e.entity ? `[${e.entity}] ` : "";
      const msg = e.message.length > 60 ? `${e.message.slice(0, 60)}…` : e.message;
      lines.push(`  ${label}${msg}`);
    });
    if (latest.errors.length > 3) {
      lines.push(`  …e mais ${latest.errors.length - 3} erro(s)`);
    }
  }

  return lines;
}
