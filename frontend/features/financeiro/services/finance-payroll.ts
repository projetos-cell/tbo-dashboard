import type { FinanceSupabase } from "./finance-types";
import {
  TABLE_TRANSACTIONS,
  TABLE_COST_CENTERS,
  type PayrollVendor,
  type PayrollBreakdownData,
} from "./finance-types";

// ── Payroll detection constants ──────────────────────────────────────────────

export const FOLHA_KEYWORDS = [
  "folha", "salário", "salario", "benefício", "beneficio", "encargo",
  "clt", "pj", "prolabore", "pró-labore", "inss", "fgts", "férias", "ferias", "13",
];

export const FOLHA_VENDORS = [
  "ruy", "arqfreelas", "nathalia", "rafaela", "lucca", "marco",
  "nelson", "celso", "mariane", "tiago", "eduarda", "carol lima",
];

// ── Payroll Breakdown (Auto-detect from transactions) ────────────────────────

export async function getPayrollBreakdown(
  supabase: FinanceSupabase,
  dateFrom: string,
  dateTo: string
): Promise<PayrollBreakdownData> {
  const { data, error } = await supabase
    .from(TABLE_TRANSACTIONS)
    .select("id, counterpart, description, amount, paid_amount, cost_center_id, status")
    .eq("type", "despesa")
    .in("status", ["pago", "parcial", "liquidado", "previsto", "provisionado", "atrasado"])
    .gte("date", dateFrom)
    .lte("date", dateTo);

  if (error) throw new Error(error.message);

  // Fetch cost center names for keyword matching
  const ccIds = [...new Set((data ?? []).filter((r) => r.cost_center_id).map((r) => r.cost_center_id!))];
  const ccLookup = new Map<string, string>();
  if (ccIds.length > 0) {
    const { data: ccs } = await supabase
      .from(TABLE_COST_CENTERS)
      .select("id, name")
      .in("id", ccIds.slice(0, 100));
    for (const cc of (ccs ?? []) as Array<{ id: string; name: string }>) {
      ccLookup.set(cc.id, cc.name);
    }
  }

  const vendorMap = new Map<string, { total: number; count: number }>();
  let totalFolha = 0;
  let totalOperacional = 0;

  for (const row of data ?? []) {
    const val = Math.abs((row.paid_amount as number) || (row.amount as number) || 0);
    const ccName = (row.cost_center_id ? ccLookup.get(row.cost_center_id) ?? "" : "").toLowerCase();
    const rawCounterpart = String((row as Record<string, unknown>).counterpart ?? "");
    const counterpart = rawCounterpart.toLowerCase();
    const resolvedName = rawCounterpart || String((row as Record<string, unknown>).description ?? "");

    const isFolha =
      FOLHA_KEYWORDS.some((kw) => ccName.includes(kw)) ||
      FOLHA_VENDORS.some((name) => counterpart.includes(name));

    if (isFolha) {
      totalFolha += val;
      const vendorName = resolvedName
        ? resolvedName.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        : "Sem identificação";
      const cur = vendorMap.get(vendorName) ?? { total: 0, count: 0 };
      vendorMap.set(vendorName, { total: cur.total + val, count: cur.count + 1 });
    } else {
      totalOperacional += val;
    }
  }

  const vendors: PayrollVendor[] = Array.from(vendorMap.entries())
    .map(([vendor, { total, count }]) => ({ vendor, total, count }))
    .sort((a, b) => b.total - a.total);

  return {
    vendors,
    totalFolha,
    totalOperacional,
    headcount: vendors.length,
  };
}
