export function fmtNum(n: number) {
  return n.toLocaleString("pt-BR");
}

export function fmtPct(n: number) {
  return (
    n.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "%"
  );
}

export const BAR_COLORS = [
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
  "#dbeafe",
];

export const PIE_COLORS = ["#2563eb", "#e5e7eb"];

export function variationColor(v: number): string {
  if (v < 0) return "bg-red-100 text-red-800 border-red-200";
  if (v < 10) return "bg-blue-50 text-blue-800 border-blue-200";
  if (v < 20) return "bg-blue-100 text-blue-900 border-blue-300";
  if (v < 30) return "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (v < 50) return "bg-amber-100 text-amber-800 border-amber-300";
  return "bg-orange-200 text-orange-900 border-orange-400";
}
