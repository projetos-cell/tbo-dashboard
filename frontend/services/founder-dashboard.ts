import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UnitRevenue {
  unit: string;
  receita: number;
  margem: number;
}

export interface ProjectMargin {
  project: string;
  receita: number;
  custos: number;
  margemPct: number;
}

export interface ClientRevenue {
  client: string;
  receita: number;
  pctTotal: number;
}

export interface FounderAlert {
  type: "margem" | "runway" | "concentracao" | "atraso" | "despesas";
  message: string;
  value: number;
  threshold: number;
  // Enriched overdue alerts
  client?: string;
  clientId?: string;
  valor?: number;
  diasAtraso?: number;
}

export interface ForecastMonth {
  month: string; // "2026-01", "2026-02", etc.
  label: string; // "Jan", "Fev", etc.
  value: number;
}

export interface FounderDashboardSnapshot {
  // Row 1 — Saude
  receitaRealizada: number;
  margemReal: number;
  margemPct: number;
  runway: number;

  // Row 2 — Caixa
  caixaAtual: number;
  burnRate: number;
  breakEven: number;
  caixaPrevisto30d: number;

  // Auxiliary for calculations
  arNext30: number;
  apNext30: number;

  // Row 3 — Receita
  unitRevenue: UnitRevenue[];
  topProjectsByMargin: ProjectMargin[];

  // Row 4 — Clientes / Risco
  topClientsByRevenue: ClientRevenue[];
  allClientsByRevenue: ClientRevenue[];
  concentracaoTop3: number;
  alerts: FounderAlert[];

  // Row 5 — Forecast
  forecast90d: {
    total: number;
    months: ForecastMonth[];
  };

  // Period context
  periodLabel: string; // "MTD" | "Ultimos 90 dias"
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Statuses that represent a completed payment in finance_transactions
const PAID_STATUSES = ["pago", "parcial", "liquidado"];

// Statuses that represent open/pending/overdue obligations in finance_transactions
// Note: "previsto" and "provisionado" replace the legacy "aberto"/"emitido"/"aprovado"
const PENDING_STATUSES = ["previsto", "provisionado", "atrasado"];

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function isoDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/** Paid value helper: prefer paid_amount (finance_transactions field), fall back to amount */
function paidVal(row: { paid_amount?: number | null; amount?: number | null }): number {
  return row.paid_amount ?? row.amount ?? 0;
}

// ── Row types for query results ───────────────────────────────────────────────

/** A paid transaction row from finance_transactions */
type FinTxRow = {
  amount: number | null;
  paid_amount: number | null;  // field name in finance_transactions (was amount_paid in legacy tables)
  paid_date: string | null;
  due_date: string | null;
  status: string | null;
  type: string | null;         // "receita" | "despesa"
  counterpart: string | null;  // client name for receitas, vendor name for despesas
  project_id: string | null;
  cost_center_id: string | null;
  business_unit: string | null;
};

/** A pending transaction row (lighter — no paid_amount needed) */
type PendingTxRow = {
  amount: number | null;
  due_date: string | null;
  status: string | null;
  type: string | null;
  counterpart: string | null;
};

// ── Main query ────────────────────────────────────────────────────────────────

/**
 * Period bounds resolved by the caller (from PeriodFilter component).
 * Affects: receita, margem, unit revenue, top clients, top projects.
 * Does NOT affect: burn rate (always 90d rolling), forecast (forward-looking),
 * caixa atual (snapshot), runway (caixa/burn).
 */
export interface PeriodBounds {
  from: string; // ISO date
  to: string;   // ISO date
  label: string;
}

export async function getFounderDashboardSnapshot(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  period?: PeriodBounds
): Promise<FounderDashboardSnapshot> {
  const now = new Date();
  const today = isoDate(now);

  // ── Parallel queries against finance_transactions ───────────────────────────
  // We fetch broad data sets and filter client-side to minimise round-trips.
  // finance_transactions is the authoritative table synced from Omie (600+ records).
  // Legacy tables (fin_receivables, fin_payables) are empty and no longer used.

  const [
    paidTxRes,      // 1. All paid transactions (receita + despesa)
    pendingTxRes,   // 2. All pending transactions (receita + despesa)
    costCentersRes, // 3. Cost centers name lookup
    projectsRes,    // 4. Projects name lookup
    bankAccountsRes,// 5. Bank accounts (real balance synced from Omie)
  ] = await Promise.all([
    // 1. Paid transactions — all-time, filtered client-side for period/trends
    supabase
      .from("finance_transactions")
      .select("amount, paid_amount, paid_date, due_date, status, type, counterpart, project_id, cost_center_id, business_unit")
      .eq("tenant_id", tenantId)
      .in("type", ["receita", "despesa"])
      .in("status", PAID_STATUSES),

    // 2. Pending transactions — open/overdue obligations
    supabase
      .from("finance_transactions")
      .select("amount, due_date, status, type, counterpart")
      .eq("tenant_id", tenantId)
      .in("type", ["receita", "despesa"])
      .in("status", PENDING_STATUSES),

    // 3. Cost centers for unit revenue name mapping
    supabase
      .from("fin_cost_centers")
      .select("id, name")
      .eq("tenant_id", tenantId),

    // 4. Projects for name lookup
    supabase
      .from("projects")
      .select("id, name")
      .eq("tenant_id", tenantId),

    // 5. Bank accounts — real cash balance synced from Omie
    supabase
      .from("fin_bank_accounts" as never)
      .select("balance")
      .eq("tenant_id", tenantId)
      .eq("is_active", true),
  ]);

  // ── Unpack and split by type ─────────────────────────────────────────────────

  const paidAll = (paidTxRes.data ?? []) as FinTxRow[];
  const pendingAll = (pendingTxRes.data ?? []) as PendingTxRow[];

  const paidReceivables = paidAll.filter((r) => r.type === "receita");
  const paidPayables    = paidAll.filter((r) => r.type === "despesa");
  const pendingReceivables = pendingAll.filter((r) => r.type === "receita");
  const pendingPayables    = pendingAll.filter((r) => r.type === "despesa");

  // Lookups
  const projectLookup = new Map<string, string>(
    ((projectsRes.data ?? []) as Array<{ id: string; name: string }>).map(
      (p) => [p.id, p.name]
    )
  );
  const costCenters = (costCentersRes.data ?? []) as Array<{ id: string; name: string }>;
  const ccLookup = new Map<string, string>(costCenters.map((c) => [c.id, c.name]));

  // ── Date boundaries ─────────────────────────────────────────────────────────

  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  // 30 / 90 days ahead (for forecast and AR/AP projections)
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);
  const in30Str = isoDate(in30);

  const in90 = new Date(now);
  in90.setDate(in90.getDate() + 90);
  const in90Str = isoDate(in90);

  // 90 days back (for burn rate and 90-day fallback)
  const d90ago = new Date(now);
  d90ago.setDate(d90ago.getDate() - 90);
  const d90agoStr = isoDate(d90ago);

  // ── Caixa Atual — prefer real bank balance, fallback to net position ─────────
  // If fin_bank_accounts has data (synced from Omie), use SUM(balance) as the
  // authoritative cash position. Otherwise fall back to the computed net
  // (all-time paid AR − paid AP), which is a rough approximation.

  const bankRows = (bankAccountsRes.data ?? []) as Array<{ balance: number | null }>;
  const realBankBalance = bankRows.reduce((s, r) => s + (r.balance ?? 0), 0);
  const hasBankData = bankRows.length > 0 && realBankBalance !== 0;

  const totalPaidAR = paidReceivables.reduce((s, r) => s + paidVal(r), 0);
  const totalPaidAP = paidPayables.reduce((s, r) => s + paidVal(r), 0);
  const computedNetPosition = totalPaidAR - totalPaidAP;

  const caixaAtual = hasBankData ? realBankBalance : computedNetPosition;

  // ── Period-filtered receita & despesa ──────────────────────────────────────
  // When a period is provided by the caller (via PeriodFilter), use it.
  // Otherwise default to MTD with 90-day fallback when empty.

  const periodFrom = period?.from ?? monthStart;
  const periodTo = period?.to ?? today;
  let periodLabel = period?.label ?? "MTD";

  let periodReceivables = paidReceivables.filter(
    (r) => r.paid_date && r.paid_date >= periodFrom && r.paid_date <= periodTo
  );
  let periodPayables = paidPayables.filter(
    (r) => r.paid_date && r.paid_date >= periodFrom && r.paid_date <= periodTo
  );

  let receitaRealizada = periodReceivables.reduce((s, r) => s + paidVal(r), 0);
  let despesaPeriod    = periodPayables.reduce((s, r) => s + paidVal(r), 0);

  // 90-day fallback only when no explicit period was chosen and MTD is empty
  if (!period && receitaRealizada === 0 && despesaPeriod === 0) {
    periodReceivables = paidReceivables.filter(
      (r) => r.paid_date && r.paid_date >= d90agoStr && r.paid_date <= today
    );
    periodPayables = paidPayables.filter(
      (r) => r.paid_date && r.paid_date >= d90agoStr && r.paid_date <= today
    );
    receitaRealizada = periodReceivables.reduce((s, r) => s + paidVal(r), 0);
    despesaPeriod    = periodPayables.reduce((s, r) => s + paidVal(r), 0);
    if (receitaRealizada > 0 || despesaPeriod > 0) {
      periodLabel = "Ultimos 90 dias";
    }
  }

  const margemReal = receitaRealizada - despesaPeriod;
  const margemPct  = receitaRealizada > 0 ? (margemReal / receitaRealizada) * 100 : 0;

  // ── Burn Rate — total despesas paid in rolling 90 days / 3 ──────────────────
  // Burn Rate = sum of paid expenses in last 90 days ÷ 3 (monthly average).

  const burn90d = paidPayables.filter(
    (r) => r.paid_date && r.paid_date >= d90agoStr && r.paid_date <= today
  );
  const burnTotal90d = burn90d.reduce((s, r) => s + paidVal(r), 0);
  const burnRate = burnTotal90d / 3;

  // Break-even = same as burn rate (avg total costs to cover per month)
  const breakEven = burnRate;

  // ── AP / AR next 30 days ────────────────────────────────────────────────────

  const apNext30 = pendingPayables
    .filter((r) => r.due_date && r.due_date <= in30Str)
    .reduce((s, r) => s + (r.amount ?? 0), 0);

  const arNext30 = pendingReceivables
    .filter((r) => r.due_date && r.due_date <= in30Str)
    .reduce((s, r) => s + (r.amount ?? 0), 0);

  const caixaPrevisto30d = caixaAtual + arNext30 - apNext30;
  const runway = burnRate > 0 ? caixaAtual / burnRate : 0;

  // ── Unit Revenue (by cost center — receitas + despesas) ─────────────────────
  // finance_transactions has cost_center_id on both types, so we can now
  // attribute both receita and custos per business unit.

  const unitReceivableMap = new Map<string, number>(); // ccName → receita
  const unitCostMap       = new Map<string, number>(); // ccName → custos

  for (const t of periodReceivables) {
    if (!t.cost_center_id) continue;
    const ccName = ccLookup.get(t.cost_center_id) || t.cost_center_id.slice(0, 8);
    unitReceivableMap.set(ccName, (unitReceivableMap.get(ccName) || 0) + paidVal(t));
  }
  for (const t of periodPayables) {
    if (!t.cost_center_id) continue;
    const ccName = ccLookup.get(t.cost_center_id) || t.cost_center_id.slice(0, 8);
    unitCostMap.set(ccName, (unitCostMap.get(ccName) || 0) + paidVal(t));
  }

  const allUnits = new Set([...unitReceivableMap.keys(), ...unitCostMap.keys()]);
  const unitRevenue: UnitRevenue[] = Array.from(allUnits)
    .map((unit) => {
      const receita = unitReceivableMap.get(unit) || 0;
      const custos  = unitCostMap.get(unit) || 0;
      return { unit, receita, margem: receita - custos };
    })
    .sort((a, b) => b.receita - a.receita);

  // ── Top Projects by Margin ──────────────────────────────────────────────────
  // Receita per project from paid receivables, custos from paid payables.

  const projReceita = new Map<string, number>();
  const projCustos  = new Map<string, number>();

  for (const r of periodReceivables) {
    if (!r.project_id) continue;
    projReceita.set(r.project_id, (projReceita.get(r.project_id) || 0) + paidVal(r));
  }
  for (const r of periodPayables) {
    if (!r.project_id) continue;
    projCustos.set(r.project_id, (projCustos.get(r.project_id) || 0) + paidVal(r));
  }

  const allProjectIds = new Set([...projReceita.keys(), ...projCustos.keys()]);
  const topProjectsByMargin: ProjectMargin[] = Array.from(allProjectIds)
    .map((pid) => {
      const receita = projReceita.get(pid) || 0;
      const custos  = projCustos.get(pid) || 0;
      return {
        project: projectLookup.get(pid) || pid.slice(0, 8),
        receita,
        custos,
        margemPct: receita > 0 ? ((receita - custos) / receita) * 100 : 0,
      };
    })
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 5);

  // ── Top Clients by Revenue ──────────────────────────────────────────────────
  // counterpart is the client name string directly (no separate clients table needed)

  const clientRevMap = new Map<string, number>();
  for (const r of periodReceivables) {
    const key = r.counterpart || "__none__";
    clientRevMap.set(key, (clientRevMap.get(key) || 0) + paidVal(r));
  }

  const totalClientRevenue = Array.from(clientRevMap.values()).reduce((s, v) => s + v, 0);
  const sortedClients = Array.from(clientRevMap.entries()).sort((a, b) => b[1] - a[1]);

  const topClientsByRevenue: ClientRevenue[] = sortedClients
    .slice(0, 5)
    .map(([client, receita]) => ({
      client: client === "__none__" ? "Sem cliente" : client,
      receita,
      pctTotal: totalClientRevenue > 0 ? (receita / totalClientRevenue) * 100 : 0,
    }));

  const concentracaoTop3 = totalClientRevenue > 0
    ? (sortedClients.slice(0, 3).reduce((s, [, v]) => s + v, 0) / totalClientRevenue) * 100
    : 0;

  // All clients (no slice) — used by RevenueConcentration widget
  const allClientsByRevenue: ClientRevenue[] = sortedClients.map(([client, receita]) => ({
    client: client === "__none__" ? "Sem cliente" : client,
    receita,
    pctTotal: totalClientRevenue > 0 ? (receita / totalClientRevenue) * 100 : 0,
  }));

  // ── Forecast 90d — pending receivables due in next 90 days ──────────────────
  // Receivables due from today onwards (including today) up to 90 days ahead.

  const ar90 = pendingReceivables.filter(
    (r) => r.due_date && r.due_date >= today && r.due_date <= in90Str
  );
  const forecastByMonth = new Map<string, number>();
  for (const r of ar90) {
    if (!r.due_date) continue;
    const mk = r.due_date.slice(0, 7);
    forecastByMonth.set(mk, (forecastByMonth.get(mk) || 0) + (r.amount ?? 0));
  }

  // Build 3 months starting from the current month
  const forecastMonths: ForecastMonth[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() + i);
    const mk = monthKey(d);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    forecastMonths.push({
      month: mk,
      label: MONTH_LABELS[mm] || mm,
      value: forecastByMonth.get(mk) || 0,
    });
  }

  const forecastTotal = ar90.reduce((s, r) => s + (r.amount ?? 0), 0);

  // ── Alerts (Founder Radar) ──────────────────────────────────────────────────

  const alerts: FounderAlert[] = [];

  // 1. Margem abaixo de 30% em algum projeto
  for (const p of topProjectsByMargin) {
    if (p.receita > 0 && p.margemPct < 30) {
      alerts.push({
        type: "margem",
        message: `Projeto "${p.project}" com margem de ${p.margemPct.toFixed(1)}%`,
        value: p.margemPct,
        threshold: 30,
      });
    }
  }

  // 2. Runway abaixo de 3 meses
  if (runway > 0 && runway < 3) {
    alerts.push({
      type: "runway",
      message: `Runway de apenas ${runway.toFixed(1)} meses`,
      value: runway,
      threshold: 3,
    });
  }

  // 3. Cliente > 40% da receita
  for (const c of topClientsByRevenue) {
    if (c.pctTotal > 40) {
      alerts.push({
        type: "concentracao",
        message: `Cliente "${c.client}" representa ${c.pctTotal.toFixed(1)}% da receita`,
        value: c.pctTotal,
        threshold: 40,
      });
    }
  }

  // 4. Recebiveis atrasados — per-client alerts, sorted by value desc
  const overdueAll = pendingReceivables.filter(
    (r) => r.status === "atrasado" && r.due_date && r.due_date < today
  );

  if (overdueAll.length > 0) {
    // Group by counterpart (client name)
    const overdueByClient = new Map<string, { total: number; maxDays: number; items: number }>();
    for (const r of overdueAll) {
      const key = r.counterpart || "__none__";
      const days = Math.floor(
        (now.getTime() - new Date(r.due_date!).getTime()) / (1000 * 60 * 60 * 24)
      );
      const prev = overdueByClient.get(key) || { total: 0, maxDays: 0, items: 0 };
      prev.total += r.amount ?? 0;
      prev.maxDays = Math.max(prev.maxDays, days);
      prev.items += 1;
      overdueByClient.set(key, prev);
    }

    const sortedOverdue = Array.from(overdueByClient.entries())
      .sort((a, b) => b[1].total - a[1].total);

    for (const [key, info] of sortedOverdue) {
      const clientName = key === "__none__" ? "Sem cliente" : key;
      alerts.push({
        type: "atraso",
        message: `Recebivel atrasado — R$ ${info.total.toLocaleString("pt-BR")} | ${clientName} | Atraso: ${info.maxDays} dias`,
        value: info.total,
        threshold: 0,
        client: clientName,
        clientId: key === "__none__" ? undefined : key,
        valor: info.total,
        diasAtraso: info.maxDays,
      });
    }
  }

  // 5. Despesas crescendo acima da receita (2 meses anteriores)
  const m2ago = new Date(now);
  m2ago.setMonth(m2ago.getMonth() - 2);
  const m2agoStr = `${m2ago.getFullYear()}-${String(m2ago.getMonth() + 1).padStart(2, "0")}-01`;

  const trendByMonth = new Map<string, { receita: number; despesa: number }>();
  for (const r of paidReceivables) {
    if (!r.paid_date || r.paid_date < m2agoStr || r.paid_date >= monthStart) continue;
    const mk = r.paid_date.slice(0, 7);
    if (!trendByMonth.has(mk)) trendByMonth.set(mk, { receita: 0, despesa: 0 });
    trendByMonth.get(mk)!.receita += paidVal(r);
  }
  for (const r of paidPayables) {
    if (!r.paid_date || r.paid_date < m2agoStr || r.paid_date >= monthStart) continue;
    const mk = r.paid_date.slice(0, 7);
    if (!trendByMonth.has(mk)) trendByMonth.set(mk, { receita: 0, despesa: 0 });
    trendByMonth.get(mk)!.despesa += paidVal(r);
  }

  const trendMonths = Array.from(trendByMonth.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  if (trendMonths.length >= 2) {
    const allGrowing = trendMonths.every(([, d]) => d.despesa > d.receita);
    if (allGrowing) {
      alerts.push({
        type: "despesas",
        message: "Despesas superando receita nos ultimos 2 meses",
        value: trendMonths.length,
        threshold: 2,
      });
    }
  }

  // Suppress the avg import warning (used by callers, kept for API stability)
  void avg;

  return {
    receitaRealizada,
    margemReal,
    margemPct,
    runway,
    caixaAtual,
    burnRate,
    breakEven,
    caixaPrevisto30d,
    arNext30,
    apNext30,
    unitRevenue,
    topProjectsByMargin,
    topClientsByRevenue,
    allClientsByRevenue,
    concentracaoTop3,
    alerts,
    forecast90d: {
      total: forecastTotal,
      months: forecastMonths,
    },
    periodLabel,
  };
}
