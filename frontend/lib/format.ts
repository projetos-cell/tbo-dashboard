/**
 * Shared formatting utilities for the financial module.
 */

export function formatBRL(value: number, masked = false): string {
  if (masked) return "R$ ****";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
