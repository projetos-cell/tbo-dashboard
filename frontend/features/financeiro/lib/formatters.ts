export function fmt(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function fmtPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function fmtMonths(value: number): string {
  return `${value.toFixed(1)} meses`;
}
