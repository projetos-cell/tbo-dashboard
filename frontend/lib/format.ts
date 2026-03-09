/**
 * Shared formatting utilities for the financial module.
 */

export function formatBRL(value: number, masked = false): string {
  if (masked) return "R$ ****";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatBRLInt(value: number, masked = false): string {
  if (masked) return "R$ ****";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatBRLCompact(value: number, masked = false): string {
  if (masked) return "R$ ****";
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1)}k`;
  }
  return formatBRL(value);
}

export function formatPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function formatMonths(value: number): string {
  if (!isFinite(value) || value < 0) return "N/A";
  if (value >= 24) return `${(value / 12).toFixed(0)} anos`;
  return `${value.toFixed(1)} meses`;
}

/**
 * Generic date formatting using Intl.DateTimeFormat
 */
export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return '';

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      month: opts.month ?? 'long',
      day: opts.day ?? 'numeric',
      year: opts.year ?? 'numeric',
      ...opts
    }).format(new Date(date));
  } catch (_err) {
    return '';
  }
}
