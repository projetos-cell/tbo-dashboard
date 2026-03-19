import type { FinanceSupabase } from "./finance-types";
import {
  TABLE_TRANSACTIONS,
  TABLE_CATEGORIES,
  TABLE_COST_CENTERS,
  TABLE_SNAPSHOTS,
  type FounderKPIs,
  type ClientConcentration,
  type RevenueConcentrationData,
} from "./finance-types";
import { getTBOMonthRange } from "./finance-cycle";

// ── Founder KPI aggregations ─────────────────────────────────────────────────

export async function getFounderKPIs(
  supabase: FinanceSupabase
): Promise<FounderKPIs> {
  const now = new Date();
  const { from: monthStart } = getTBOMonthRange(now);
  const today = now.toISOString().split("T")[0];
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);
  const in30Str = in30.toISOString().split("T")[0];

  const [mtdRes, apRes, arRes, ccRes, latestSnap] = await Promise.all([
    supabase
      .from(TABLE_TRANSACTIONS)
      .select("type, amount, paid_amount, cost_center_id, category_id, business_unit, project_id")
      .in("status", ["pago", "provisionado", "liquidado"])
      .gte("date", monthStart)
      .lte("date", today),
    supabase
      .from(TABLE_TRANSACTIONS)
      .select("amount")
      .eq("type", "despesa")
      .in("status", ["previsto", "provisionado", "atrasado"])
      .lte("due_date", in30Str),
    supabase
      .from(TABLE_TRANSACTIONS)
      .select("amount")
      .eq("type", "receita")
      .in("status", ["previsto", "provisionado", "atrasado"])
      .lte("due_date", in30Str),
    supabase
      .from(TABLE_COST_CENTERS)
      .select("id, code, name"),
    supabase
      .from(TABLE_SNAPSHOTS)
      .select("saldo_acumulado")
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const mtd = (mtdRes.data ?? []) as Array<{
    type: string;
    amount: number;
    paid_amount: number;
    cost_center_id: string | null;
    category_id: string | null;
    business_unit: string | null;
    project_id: string | null;
  }>;

  const receitaMTD = mtd
    .filter((t) => t.type === "receita")
    .reduce((s, t) => s + (t.paid_amount || t.amount || 0), 0);
  const despesaMTD = mtd
    .filter((t) => t.type === "despesa")
    .reduce((s, t) => s + (t.paid_amount || t.amount || 0), 0);
  const margemMTD = receitaMTD - despesaMTD;
  const margemPct = receitaMTD > 0 ? (margemMTD / receitaMTD) * 100 : 0;

  const apNext30 = ((apRes.data ?? []) as Array<{ amount: number }>).reduce(
    (s, t) => s + (t.amount || 0),
    0
  );
  const arNext30 = ((arRes.data ?? []) as Array<{ amount: number }>).reduce(
    (s, t) => s + (t.amount || 0),
    0
  );

  // Cost center ranking (top despesas)
  const ccMap = new Map<string, number>();
  for (const t of mtd) {
    if (t.type === "despesa" && t.cost_center_id) {
      ccMap.set(
        t.cost_center_id,
        (ccMap.get(t.cost_center_id) || 0) + (t.paid_amount || t.amount || 0)
      );
    }
  }
  const ccLookup = new Map(
    ((ccRes.data ?? []) as Array<{ id: string; code: string; name: string }>).map(
      (c) => [c.id, c]
    )
  );
  const costCenterRanking = Array.from(ccMap.entries())
    .map(([id, total]) => ({
      code: ccLookup.get(id)?.code ?? "—",
      name: ccLookup.get(id)?.name ?? "Sem centro",
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Category ranking (top despesas by category)
  const catMap = new Map<string, number>();
  for (const t of mtd) {
    if (t.type === "despesa" && t.category_id) {
      catMap.set(
        t.category_id,
        (catMap.get(t.category_id) || 0) + (t.paid_amount || t.amount || 0)
      );
    }
  }

  const topCatIds = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let categoryRanking: FounderKPIs["categoryRanking"] = [];
  if (topCatIds.length > 0) {
    const { data: cats } = await supabase
      .from(TABLE_CATEGORIES)
      .select("id, name, type")
      .in("id", topCatIds);
    const catLookup = new Map(
      ((cats ?? []) as Array<{ id: string; name: string; type: string }>).map(
        (c) => [c.id, c]
      )
    );
    categoryRanking = topCatIds.map((id) => ({
      name: catLookup.get(id)?.name ?? "Sem categoria",
      type: catLookup.get(id)?.type ?? "despesa",
      total: catMap.get(id) ?? 0,
    }));
  }

  // BU revenue ranking
  const buMap = new Map<string, number>();
  for (const t of mtd) {
    if (t.type === "receita" && t.business_unit) {
      buMap.set(
        t.business_unit,
        (buMap.get(t.business_unit) || 0) + (t.paid_amount || t.amount || 0)
      );
    }
  }
  const buRevenue = Array.from(buMap.entries())
    .map(([business_unit, total]) => ({ business_unit, total }))
    .sort((a, b) => b.total - a.total);

  // Project ranking
  const projReceitaMap = new Map<string, number>();
  const projDespesaMap = new Map<string, number>();
  for (const t of mtd) {
    if (t.project_id) {
      const val = t.paid_amount || t.amount || 0;
      if (t.type === "receita") {
        projReceitaMap.set(t.project_id, (projReceitaMap.get(t.project_id) || 0) + val);
      } else if (t.type === "despesa") {
        projDespesaMap.set(t.project_id, (projDespesaMap.get(t.project_id) || 0) + val);
      }
    }
  }
  const allProjectIds = Array.from(
    new Set([...projReceitaMap.keys(), ...projDespesaMap.keys()])
  );

  let projectRanking: FounderKPIs["projectRanking"] = [];
  if (allProjectIds.length > 0) {
    const { data: projRows } = await supabase
      .from("projects")
      .select("id, name")
      .in("id", allProjectIds.slice(0, 10));
    const projLookup = new Map(
      ((projRows ?? []) as Array<{ id: string; name: string }>).map((p) => [p.id, p.name])
    );
    projectRanking = allProjectIds
      .map((pid) => {
        const receita = projReceitaMap.get(pid) ?? 0;
        const despesa = projDespesaMap.get(pid) ?? 0;
        return {
          project_id: pid,
          name: projLookup.get(pid) ?? "Sem projeto",
          receita,
          despesa,
          margem: receita - despesa,
        };
      })
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 10);
  }

  return {
    receitaMTD,
    despesaMTD,
    margemMTD,
    margemPct,
    apNext30,
    arNext30,
    saldoAcumulado: latestSnap.data?.saldo_acumulado ?? 0,
    costCenterRanking,
    categoryRanking,
    buRevenue,
    projectRanking,
  };
}

// ── Revenue Concentration by Client ──────────────────────────────────────────

export async function getRevenueConcentrationByClient(
  supabase: FinanceSupabase,
  dateFrom?: string,
  dateTo?: string
): Promise<RevenueConcentrationData> {
  // Fetch paid_date + date so we can apply the same fallback logic used by
  // the founder-dashboard service: effective date = paid_date ?? date.
  // This keeps the concentration chart in sync with the other tables on the
  // performance page (unit revenue, top projects, client margins).
  const query = supabase
    .from("finance_transactions")
    .select("counterpart, paid_amount, amount, paid_date, date")
    .eq("type", "receita")
    .in("status", ["pago", "parcial", "liquidado"])
    .not("counterpart", "is", null);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const clientMap = new Map<string, { revenue: number; count: number }>();
  for (const tx of data ?? []) {
    // Use paid_date with fallback to date — same logic as founder-dashboard
    const effectiveDate = (tx.paid_date as string | null) ?? (tx.date as string | null);
    if (dateFrom && (!effectiveDate || effectiveDate < dateFrom)) continue;
    if (dateTo && (!effectiveDate || effectiveDate > dateTo)) continue;

    const name: string = (tx.counterpart as string) || "Sem identificação";
    const val: number = (tx.paid_amount as number) ?? (tx.amount as number) ?? 0;
    const cur = clientMap.get(name) ?? { revenue: 0, count: 0 };
    clientMap.set(name, { revenue: cur.revenue + val, count: cur.count + 1 });
  }

  const totalRevenue = Array.from(clientMap.values()).reduce((s, c) => s + c.revenue, 0);
  const totalClients = clientMap.size;

  const sorted = Array.from(clientMap.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue);

  const clients: ClientConcentration[] = sorted.map(([client, { revenue, count }]) => {
    const pct = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
    let alertLevel: ClientConcentration["alertLevel"] = "normal";
    if (pct >= 50) alertLevel = "critico";
    else if (pct >= 30) alertLevel = "alta";
    return { client, revenue, pct, txCount: count, alertLevel };
  });

  const top5Pct = clients.slice(0, 5).reduce((s, c) => s + c.pct, 0);

  return { clients, totalRevenue, totalClients, top5Pct };
}
