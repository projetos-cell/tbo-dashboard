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

export interface ClientMargin {
  client: string;
  receita: number;
  custos: number;
  margem: number;
  margemPct: number;
}

export interface FounderAlert {
  type: "margem" | "runway" | "concentracao" | "atraso" | "despesas" | "contrato";
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
  proposals?: number; // #10 — open proposals (pending/sent) value
}

export interface MonthlyTrendPoint {
  month: string;   // "2026-01"
  label: string;   // "Jan"
  receita: number;
  despesa: number;
  margem: number;  // receita - despesa
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

  // Monthly trend — last 6 full months (+ current partial month)
  monthlyTrend: MonthlyTrendPoint[];

  // MRR breakdown
  mrrReceita: number;
  pontualReceita: number;

  // Prazo Médio (days)
  pmr: number | null; // Prazo Médio de Recebimento
  pmp: number | null; // Prazo Médio de Pagamento

  // Inadimplência
  inadimplenciaTotal: number;
  inadimplenciaPct: number;
  inadimplenciaCount: number;

  // Client margins (top 10)
  clientMargins: ClientMargin[];

  // Period context
  periodLabel: string; // "MTD" | "Ultimos 90 dias"

  // #7 — Receita por colaborador
  receitaPorColaborador: number;
  headcount: number;

  // #8 — Contratos expirando ≤60d
  expiringContracts: ExpiringContract[];

  // #10 — Propostas no forecast
  forecastProposalsTotal: number;

  // #15 — Split de custos
  folhaPagamento: number;
  custosOperacionais: number;
  folhaPct: number;
  operacionalPct: number;

  // #18 — Churn rate
  churnRate: number;
  churnHistory: ChurnPoint[];

  // Deltas vs previous equivalent period (% change, null = no prev data)
  receitaDelta: number | null;
  margemDelta: number | null;   // difference in percentage points
  burnRateDelta: number | null;
  caixaPrevistoDelta: number | null;
}

export interface ExpiringContract {
  id: string;
  title: string;
  client: string;
  endDate: string;
  daysRemaining: number;
  monthlyValue: number;
}

export interface ChurnPoint {
  month: string; // "2026-01"
  label: string; // "Jan"
  rate: number;  // percentage
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
  paid_date: string | null;    // may be null — Omie doesn't always populate this field
  date: string | null;         // transaction date — used as fallback when paid_date is null
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
  period?: PeriodBounds
): Promise<FounderDashboardSnapshot> {
  const now = new Date();
  const today = isoDate(now);

  // ── Parallel queries against finance_transactions ───────────────────────────
  // We fetch broad data sets and filter client-side to minimise round-trips.
  // finance_transactions is the authoritative table synced from Omie (600+ records).
  // Legacy tables (fin_receivables, fin_payables) are empty and no longer used.

  // Date helpers for queries
  const in60Str = isoDate(new Date(now.getTime() + 60 * 86_400_000));
  const in90StrQ = isoDate(new Date(now.getTime() + 90 * 86_400_000));

  const currentMonth = monthKey(now);

  const [
    paidTxRes,      // 1. All paid transactions (receita + despesa)
    pendingTxRes,   // 2. All pending transactions (receita + despesa)
    costCentersRes, // 3. Cost centers name lookup
    projectsRes,    // 4. Projects name lookup
    bankAccountsRes,// 5. Bank accounts (real balance synced from Omie)
    profilesRes,    // 6. Active headcount (#7)
    contractsRes,   // 7. Contracts expiring ≤60d (#8)
    dealsRes,       // 8. Open proposals ≤90d (#10)
    opIndicatorsRes,// 9. Manual operational indicators for current month
  ] = await Promise.all([
    // 1. Paid transactions — all-time, filtered client-side for period/trends
    supabase
      .from("finance_transactions" as never)
      .select("amount, paid_amount, paid_date, date, due_date, status, type, counterpart, project_id, cost_center_id, business_unit")
      .in("type", ["receita", "despesa"])
      .in("status", PAID_STATUSES),

    // 2. Pending transactions — open/overdue obligations
    supabase
      .from("finance_transactions" as never)
      .select("amount, due_date, status, type, counterpart")
      .in("type", ["receita", "despesa"])
      .in("status", PENDING_STATUSES),

    // 3. Cost centers for unit revenue name mapping
    supabase
      .from("finance_cost_centers" as never)
      .select("id, name"),

    // 4. Projects for name lookup
    supabase
      .from("projects" as never)
      .select("id, name"),

    // 5. Bank accounts — real cash balance synced from Omie
    supabase
      .from("finance_bank_accounts" as never)
      .select("balance")
      .eq("is_active", true),

    // 6. Active headcount for receita por colaborador (#7)
    supabase
      .from("profiles" as never)
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),

    // 7. Contracts expiring within 60 days (#8)
    supabase
      .from("contracts" as never)
      .select("id, title, person_name, end_date, monthly_value")
      .eq("status", "active")
      .gte("end_date", today)
      .lte("end_date", in60Str),

    // 8. Open proposals for forecast overlay (#10)
    supabase
      .from("crm_deals" as never)
      .select("id, name, company, value, probability, expected_close, stage")
      .not("stage", "in", "(fechado_ganho,fechado_perdido)")
      .gte("expected_close", today)
      .lte("expected_close", in90StrQ),

    // 9. Manual operational indicators for current month
    supabase
      .from("finance_operational_indicators" as never)
      .select("headcount, folha_pagamento, custos_fixos, meta_receita, meta_margem, churn_clientes_perdidos")
      .eq("month", currentMonth)
      .maybeSingle(),
  ]);

  // ── Unpack and split by type ─────────────────────────────────────────────────

  // Omie ERP doesn't always populate paid_date on sync — fall back to `date`
  // so every period filter downstream works correctly.
  const paidAll: FinTxRow[] = ((paidTxRes.data ?? []) as FinTxRow[]).map((r) => ({
    ...r,
    paid_date: r.paid_date ?? r.date,
  }));
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

  // ── Manual operational indicators (overrides) ──────────────────────────────
  const opManual = opIndicatorsRes.data as {
    headcount: number | null;
    folha_pagamento: number | null;
    custos_fixos: number | null;
    meta_receita: number | null;
    meta_margem: number | null;
    churn_clientes_perdidos: number | null;
  } | null;

  // ── #7 — Headcount (manual override if available) ─────────────────────────
  const headcount = opManual?.headcount ?? (profilesRes.count ?? 0);

  // ── #8 — Contratos expirando ≤60d ──────────────────────────────────────────
  const rawContracts = (contractsRes.data ?? []) as Array<{
    id: string;
    title: string;
    person_name: string | null;
    end_date: string;
    monthly_value: number | null;
  }>;
  const expiringContracts: ExpiringContract[] = rawContracts
    .map((c) => ({
      id: c.id,
      title: c.title || "Sem título",
      client: c.person_name || "Sem cliente",
      endDate: c.end_date,
      daysRemaining: Math.max(
        0,
        Math.floor((new Date(c.end_date).getTime() - now.getTime()) / 86_400_000)
      ),
      monthlyValue: c.monthly_value ?? 0,
    }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  // ── #10 — Propostas abertas (deals) ────────────────────────────────────────
  const rawDeals = (dealsRes.data ?? []) as Array<{
    id: string;
    name: string;
    company: string | null;
    value: number | null;
    probability: number | null;
    expected_close: string | null;
    stage: string | null;
  }>;

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

  // ── #10 — Overlay de propostas no forecast ─────────────────────────────────
  const proposalByMonth = new Map<string, number>();
  for (const d of rawDeals) {
    if (!d.expected_close || !d.value) continue;
    const mk = d.expected_close.slice(0, 7);
    const weighted = d.value * ((d.probability ?? 50) / 100);
    proposalByMonth.set(mk, (proposalByMonth.get(mk) || 0) + weighted);
  }
  for (const fm of forecastMonths) {
    fm.proposals = proposalByMonth.get(fm.month) || 0;
  }
  const forecastProposalsTotal = rawDeals.reduce(
    (s, d) => s + (d.value ?? 0) * ((d.probability ?? 50) / 100),
    0
  );

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

  // 6. Contratos expirando em ≤30 dias (#8)
  for (const c of expiringContracts) {
    if (c.daysRemaining <= 30) {
      alerts.push({
        type: "contrato",
        message: `Contrato "${c.title}" expira em ${c.daysRemaining} dias (${c.client})`,
        value: c.monthlyValue,
        threshold: 30,
      });
    }
  }

  // ── Monthly Trend — last 6 months (including current partial month) ──────────
  // Aggregates paidAll client-side — no extra DB query needed.

  const monthlyTrend: MonthlyTrendPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const mStart = `${d.getFullYear()}-${mm}-01`;
    // For current month use today as end; for past months use last day of that month
    const mEnd = i === 0
      ? today
      : isoDate(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    const mk = `${d.getFullYear()}-${mm}`;

    const rec = paidReceivables
      .filter((r) => r.paid_date && r.paid_date >= mStart && r.paid_date <= mEnd)
      .reduce((s, r) => s + paidVal(r), 0);
    const desp = paidPayables
      .filter((r) => r.paid_date && r.paid_date >= mStart && r.paid_date <= mEnd)
      .reduce((s, r) => s + paidVal(r), 0);

    monthlyTrend.push({
      month: mk,
      label: MONTH_LABELS[mm] || mm,
      receita: rec,
      despesa: desp,
      margem: rec - desp,
    });
  }

  // ── MRR vs Pontual ───────────────────────────────────────────────────────────
  // A client is "recurring" if they appear in 2+ distinct months of paid
  // receivables (all-time). Their period revenue is MRR; everything else is one-off.

  const clientMonthSet = new Map<string, Set<string>>();
  for (const r of paidReceivables) {
    if (!r.counterpart || !r.paid_date) continue;
    const mk = r.paid_date.slice(0, 7);
    if (!clientMonthSet.has(r.counterpart)) clientMonthSet.set(r.counterpart, new Set());
    clientMonthSet.get(r.counterpart)!.add(mk);
  }
  const recurringClients = new Set<string>();
  for (const [client, months] of clientMonthSet) {
    if (months.size >= 2) recurringClients.add(client);
  }

  let mrrReceita = 0;
  let pontualReceita = 0;
  for (const r of periodReceivables) {
    const val = paidVal(r);
    if (r.counterpart && recurringClients.has(r.counterpart)) {
      mrrReceita += val;
    } else {
      pontualReceita += val;
    }
  }

  // ── PMR / PMP — Prazo Médio de Recebimento / Pagamento ────────────────────
  // Average delta (days) between due_date and paid_date on transactions
  // paid in the last 6 months. Positive PMR = received after due date.

  const d180ago = new Date(now);
  d180ago.setDate(d180ago.getDate() - 180);
  const d180agoStr = isoDate(d180ago);

  const pmrDeltas: number[] = [];
  for (const r of paidReceivables) {
    if (!r.paid_date || !r.due_date || r.paid_date < d180agoStr) continue;
    const delta = Math.floor(
      (new Date(r.paid_date).getTime() - new Date(r.due_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    pmrDeltas.push(delta);
  }

  const pmpDeltas: number[] = [];
  for (const r of paidPayables) {
    if (!r.paid_date || !r.due_date || r.paid_date < d180agoStr) continue;
    const delta = Math.floor(
      (new Date(r.paid_date).getTime() - new Date(r.due_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    pmpDeltas.push(delta);
  }

  const pmr = avg(pmrDeltas);
  const pmp = avg(pmpDeltas);

  // ── Inadimplência ─────────────────────────────────────────────────────────
  // Overdue receivables (status "atrasado") as % of total pending AR.

  const overdueReceivables = pendingReceivables.filter(
    (r) => r.status === "atrasado" && r.due_date && r.due_date < today
  );
  const inadimplenciaTotal = overdueReceivables.reduce((s, r) => s + (r.amount ?? 0), 0);
  const totalPendingAR = pendingReceivables.reduce((s, r) => s + (r.amount ?? 0), 0);
  const inadimplenciaPct = totalPendingAR > 0
    ? (inadimplenciaTotal / totalPendingAR) * 100
    : 0;
  const inadimplenciaCount = overdueReceivables.length;

  // ── Client Margins (top 10) ───────────────────────────────────────────────
  // Cross-reference receivables (revenue per client) with payables (costs via
  // project→client lookup). Only payables with a project_id that has an
  // associated client are attributed.

  const projectToClient = new Map<string, string>();
  for (const r of periodReceivables) {
    if (r.project_id && r.counterpart) {
      projectToClient.set(r.project_id, r.counterpart);
    }
  }

  const clientCostMap = new Map<string, number>();
  for (const r of periodPayables) {
    if (!r.project_id) continue;
    const client = projectToClient.get(r.project_id);
    if (!client) continue;
    clientCostMap.set(client, (clientCostMap.get(client) || 0) + paidVal(r));
  }

  const clientMargins: ClientMargin[] = Array.from(clientRevMap.entries())
    .filter(([k]) => k !== "__none__")
    .map(([client, receita]) => {
      const custos = clientCostMap.get(client) || 0;
      const margem = receita - custos;
      return {
        client,
        receita,
        custos,
        margem,
        margemPct: receita > 0 ? (margem / receita) * 100 : 0,
      };
    })
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 10);

  // ── #7 — Receita por colaborador ────────────────────────────────────────────
  const receitaPorColaborador = headcount > 0 ? receitaRealizada / headcount : 0;

  // ── #15 — Split de custos: Folha vs Operacional ────────────────────────────
  const FOLHA_KEYWORDS = ["folha", "salário", "salario", "benefício", "beneficio", "encargo", "clt", "pj", "prolabore", "pró-labore", "inss", "fgts", "férias", "ferias", "13"];
  // Nomes de colaboradores/PJs — match no campo counterpart (fornecedor) do Omie
  const FOLHA_VENDORS = ["ruy", "arqfreelas", "nathalia", "rafaela", "lucca", "marco", "nelson", "celso", "mariane", "tiago", "eduarda", "carol lima"];
  let folhaPagamento = 0;
  let custosOperacionais = 0;
  for (const r of periodPayables) {
    const val = paidVal(r);
    const ccName = (r.cost_center_id ? ccLookup.get(r.cost_center_id) || "" : "").toLowerCase();
    const counterpart = (String((r as Record<string, unknown>).counterpart ?? "")).toLowerCase();
    const isFolha =
      FOLHA_KEYWORDS.some((kw) => ccName.includes(kw)) ||
      FOLHA_VENDORS.some((name) => counterpart.includes(name));
    if (isFolha) {
      folhaPagamento += val;
    } else {
      custosOperacionais += val;
    }
  }
  // Apply manual overrides for folha and custos fixos when available
  if (opManual?.folha_pagamento != null) folhaPagamento = opManual.folha_pagamento;
  if (opManual?.custos_fixos != null) custosOperacionais = opManual.custos_fixos;

  const totalCustos = folhaPagamento + custosOperacionais;
  const folhaPct = totalCustos > 0 ? (folhaPagamento / totalCustos) * 100 : 0;
  const operacionalPct = totalCustos > 0 ? (custosOperacionais / totalCustos) * 100 : 0;

  // ── #18 — Churn rate (últimos 6 meses) ─────────────────────────────────────
  // For each month in monthlyTrend, compute unique client sets from paid
  // receivables. Churn = clients in prev month NOT in current / prev total.
  const monthClientSets = new Map<string, Set<string>>();
  for (const r of paidReceivables) {
    if (!r.counterpart || !r.paid_date) continue;
    const mk = r.paid_date.slice(0, 7);
    if (!monthClientSets.has(mk)) monthClientSets.set(mk, new Set());
    monthClientSets.get(mk)!.add(r.counterpart);
  }

  const churnHistory: ChurnPoint[] = [];
  for (let i = 1; i < monthlyTrend.length; i++) {
    const prevMk = monthlyTrend[i - 1].month;
    const curMk = monthlyTrend[i].month;
    const prevClients = monthClientSets.get(prevMk) ?? new Set<string>();
    const curClients = monthClientSets.get(curMk) ?? new Set<string>();
    let lost = 0;
    for (const c of prevClients) {
      if (!curClients.has(c)) lost++;
    }
    const rate = prevClients.size > 0 ? (lost / prevClients.size) * 100 : 0;
    churnHistory.push({ month: curMk, label: monthlyTrend[i].label, rate });
  }
  // Churn: if manual churn_clientes_perdidos is set, compute rate from that
  const latestMonthClients = monthClientSets.get(currentMonth)?.size ?? 0;
  const churnRate = opManual?.churn_clientes_perdidos != null && latestMonthClients > 0
    ? (opManual.churn_clientes_perdidos / latestMonthClients) * 100
    : churnHistory.length > 0
      ? churnHistory[churnHistory.length - 1].rate
      : 0;

  // ── Deltas vs previous equivalent period ────────────────────────────────────
  // Compute the same metrics for the previous period of equal duration and
  // express the change as a percentage (or pp for margemPct).

  const periodDurationMs =
    new Date(periodTo).getTime() - new Date(periodFrom).getTime();
  const periodDays = Math.max(1, Math.round(periodDurationMs / 86_400_000));

  const prevToDate = new Date(new Date(periodFrom).getTime() - 86_400_000); // day before current periodFrom
  const prevFromDate = new Date(prevToDate.getTime() - periodDurationMs);
  const prevFrom = prevFromDate.toISOString().slice(0, 10);
  const prevTo = prevToDate.toISOString().slice(0, 10);

  const prevReceivables = paidReceivables.filter(
    (r) => r.paid_date && r.paid_date >= prevFrom && r.paid_date <= prevTo
  );
  const prevPayables = paidPayables.filter(
    (r) => r.paid_date && r.paid_date >= prevFrom && r.paid_date <= prevTo
  );

  const prevReceita = prevReceivables.reduce((s, r) => s + paidVal(r), 0);
  const prevDespesa = prevPayables.reduce((s, r) => s + paidVal(r), 0);
  const prevMargem = prevReceita - prevDespesa;
  const prevMargemPct = prevReceita > 0 ? (prevMargem / prevReceita) * 100 : 0;

  // Previous burn rate: 90d window ending at prevTo
  const prevBurn90Start = new Date(prevToDate.getTime() - 90 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const prevBurn90 = paidPayables
    .filter((r) => r.paid_date && r.paid_date >= prevBurn90Start && r.paid_date <= prevTo)
    .reduce((s, r) => s + paidVal(r), 0);
  const prevBurnRate = prevBurn90 / 3;

  // Previous caixa previsto (approximation using pending at that point)
  const prevIn30Str = new Date(prevToDate.getTime() + 30 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const prevApNext30 = pendingPayables
    .filter((r) => r.due_date && r.due_date > prevTo && r.due_date <= prevIn30Str)
    .reduce((s, r) => s + (r.amount ?? 0), 0);
  const prevArNext30 = pendingReceivables
    .filter((r) => r.due_date && r.due_date > prevTo && r.due_date <= prevIn30Str)
    .reduce((s, r) => s + (r.amount ?? 0), 0);
  const prevCaixaPrevisto = caixaAtual + prevArNext30 - prevApNext30;

  function pctDelta(current: number, prev: number): number | null {
    if (prev === 0) return current === 0 ? null : null; // can't divide by zero
    return ((current - prev) / Math.abs(prev)) * 100;
  }

  const receitaDelta = prevReceita > 0 ? pctDelta(receitaRealizada, prevReceita) : null;
  const margemDelta = prevReceita > 0 ? margemPct - prevMargemPct : null; // pp difference
  const burnRateDelta = prevBurnRate > 0 ? pctDelta(burnRate, prevBurnRate) : null;
  const caixaPrevistoDelta =
    prevCaixaPrevisto !== 0 ? pctDelta(caixaPrevisto30d, prevCaixaPrevisto) : null;

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
    monthlyTrend,
    periodLabel,
    mrrReceita,
    pontualReceita,
    pmr,
    pmp,
    inadimplenciaTotal,
    inadimplenciaPct,
    inadimplenciaCount,
    clientMargins,
    // #7
    receitaPorColaborador,
    headcount,
    // #8
    expiringContracts,
    // #10
    forecastProposalsTotal,
    // #15
    folhaPagamento,
    custosOperacionais,
    folhaPct,
    operacionalPct,
    // #18
    churnRate,
    churnHistory,
    // Deltas vs previous period
    receitaDelta,
    margemDelta,
    burnRateDelta,
    caixaPrevistoDelta,
  };
}
