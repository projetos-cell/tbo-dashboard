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

const PAID_STATUSES = ["pago", "parcial"];
const PENDING_RECEIVABLE = ["aberto", "emitido", "atrasado"];
const PENDING_PAYABLE = ["aberto", "aprovado", "atrasado"];

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

/** Paid value helper: prefer amount_paid, fall back to amount */
function paidVal(row: { amount_paid?: number | null; amount?: number | null }): number {
  return row.amount_paid ?? row.amount ?? 0;
}

// ── Row types for query results ───────────────────────────────────────────────

type ReceivableRow = {
  amount: number | null;
  amount_paid: number | null;
  paid_date: string | null;
  due_date: string | null;
  status: string | null;
  client_id: string | null;
  project_id: string | null;
};

type PayableRow = {
  amount: number | null;
  amount_paid: number | null;
  paid_date: string | null;
  due_date: string | null;
  status: string | null;
  vendor_id: string | null;
  project_id: string | null;
  cost_center_id: string | null;
};

type PendingReceivableRow = {
  amount: number | null;
  due_date: string | null;
  status: string | null;
  client_id: string | null;
};

type PendingPayableRow = {
  amount: number | null;
  due_date: string | null;
};

// ── Main query ────────────────────────────────────────────────────────────────

export async function getFounderDashboardSnapshot(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<FounderDashboardSnapshot> {
  const now = new Date();
  const today = isoDate(now);

  // ── Parallel queries against legacy tables ──────────────────────────────────
  // We fetch broad data sets and filter client-side to minimise round-trips.

  const [
    paidReceivablesRes,   // 1. All paid receivables (all time)
    paidPayablesRes,      // 2. All paid payables (all time)
    pendingReceivablesRes,// 3. Pending receivables
    pendingPayablesRes,   // 4. Pending payables
    costCentersRes,       // 5. Cost centers lookup
    clientsRes,           // 6. Clients lookup
    projectsRes,          // 7. Projects lookup
    bankAccountsRes,      // 8. Bank accounts (real balance from Omie)
  ] = await Promise.all([
    // 1. Paid receivables — all-time for caixa, filtered client-side for MTD/trends
    supabase
      .from("fin_receivables")
      .select("amount, amount_paid, paid_date, due_date, status, client_id, project_id")
      .eq("tenant_id", tenantId)
      .in("status", PAID_STATUSES),

    // 2. Paid payables — all-time for caixa, filtered client-side for MTD/burn/trends
    supabase
      .from("fin_payables")
      .select("amount, amount_paid, paid_date, due_date, status, vendor_id, project_id, cost_center_id")
      .eq("tenant_id", tenantId)
      .in("status", PAID_STATUSES),

    // 3. Pending receivables (open/overdue)
    supabase
      .from("fin_receivables")
      .select("amount, due_date, status, client_id")
      .eq("tenant_id", tenantId)
      .in("status", PENDING_RECEIVABLE),

    // 4. Pending payables (open/overdue)
    supabase
      .from("fin_payables")
      .select("amount, due_date")
      .eq("tenant_id", tenantId)
      .in("status", PENDING_PAYABLE),

    // 5. Cost centers for unit revenue mapping
    supabase
      .from("fin_cost_centers")
      .select("id, name")
      .eq("tenant_id", tenantId),

    // 6. Clients for name lookup
    supabase
      .from("fin_clients")
      .select("id, name")
      .eq("tenant_id", tenantId),

    // 7. Projects for name lookup
    supabase
      .from("projects")
      .select("id, name")
      .eq("tenant_id", tenantId),

    // 8. Bank accounts — real balance synced from Omie
    supabase
      .from("fin_bank_accounts" as never)
      .select("balance")
      .eq("tenant_id", tenantId)
      .eq("is_active", true),
  ]);

  // ── Unpack rows ─────────────────────────────────────────────────────────────

  const paidReceivables = (paidReceivablesRes.data ?? []) as ReceivableRow[];
  const paidPayables = (paidPayablesRes.data ?? []) as PayableRow[];
  const pendingReceivables = (pendingReceivablesRes.data ?? []) as PendingReceivableRow[];
  const pendingPayables = (pendingPayablesRes.data ?? []) as PendingPayableRow[];

  // Lookups
  const clientLookup = new Map<string, string>(
    ((clientsRes.data ?? []) as Array<{ id: string; name: string }>).map(
      (c) => [c.id, c.name]
    )
  );
  const projectLookup = new Map<string, string>(
    ((projectsRes.data ?? []) as Array<{ id: string; name: string }>).map(
      (p) => [p.id, p.name]
    )
  );
  const costCenters = (costCentersRes.data ?? []) as Array<{ id: string; name: string }>;
  const ccLookup = new Map<string, string>(costCenters.map((c) => [c.id, c.name]));

  // ── Date boundaries ─────────────────────────────────────────────────────────

  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  // 3 full months before current month start (for burn rate)
  const m3ago = new Date(now);
  m3ago.setMonth(m3ago.getMonth() - 3);
  const m3agoStr = `${m3ago.getFullYear()}-${String(m3ago.getMonth() + 1).padStart(2, "0")}-01`;

  // 30 / 90 days ahead
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);
  const in30Str = isoDate(in30);

  const in90 = new Date(now);
  in90.setDate(in90.getDate() + 90);
  const in90Str = isoDate(in90);

  // 90 days back (fallback period)
  const d90ago = new Date(now);
  d90ago.setDate(d90ago.getDate() - 90);
  const d90agoStr = isoDate(d90ago);

  // ── Caixa Atual — prefer real bank balance, fallback to net position ───────
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

  // ── MTD receita & despesa (filter by paid_date) ─────────────────────────────

  const mtdReceivables = paidReceivables.filter(
    (r) => r.paid_date && r.paid_date >= monthStart && r.paid_date <= today
  );
  const mtdPayables = paidPayables.filter(
    (r) => r.paid_date && r.paid_date >= monthStart && r.paid_date <= today
  );

  let receitaRealizada = mtdReceivables.reduce((s, r) => s + paidVal(r), 0);
  let despesaMTD = mtdPayables.reduce((s, r) => s + paidVal(r), 0);
  let periodLabel = "MTD";

  // ── 90-day fallback ─────────────────────────────────────────────────────────
  // If MTD is empty (no data yet this month), widen window to last 90 days.

  if (receitaRealizada === 0 && despesaMTD === 0) {
    const fb90Receivables = paidReceivables.filter(
      (r) => r.paid_date && r.paid_date >= d90agoStr && r.paid_date <= today
    );
    const fb90Payables = paidPayables.filter(
      (r) => r.paid_date && r.paid_date >= d90agoStr && r.paid_date <= today
    );

    receitaRealizada = fb90Receivables.reduce((s, r) => s + paidVal(r), 0);
    despesaMTD = fb90Payables.reduce((s, r) => s + paidVal(r), 0);

    // Only change label if fallback actually found data
    if (receitaRealizada > 0 || despesaMTD > 0) {
      periodLabel = "Ultimos 90 dias";
    }
  }

  const margemReal = receitaRealizada - despesaMTD;
  const margemPct = receitaRealizada > 0 ? (margemReal / receitaRealizada) * 100 : 0;

  // ── Burn Rate — avg monthly despesas paid in last 3 full months ─────────────

  const burn3m = paidPayables.filter(
    (r) => r.paid_date && r.paid_date >= m3agoStr && r.paid_date < monthStart
  );
  const burnByMonth = new Map<string, number>();
  for (const t of burn3m) {
    if (!t.paid_date) continue;
    const mk = t.paid_date.slice(0, 7);
    burnByMonth.set(mk, (burnByMonth.get(mk) || 0) + paidVal(t));
  }
  const burnRate = avg(Array.from(burnByMonth.values()));

  // Break-even = same as burn rate (avg total costs to cover)
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

  // ── Unit Revenue (by cost center — payables only) ───────────────────────────
  // fin_receivables does NOT have cost_center_id, so we can only attribute
  // despesas per unit. We show cost center names dynamically from fin_cost_centers.

  const unitCostMap = new Map<string, number>(); // ccName → custos
  for (const t of mtdPayables.length > 0 ? mtdPayables : paidPayables.filter(
    (r) => r.paid_date && r.paid_date >= d90agoStr && r.paid_date <= today
  )) {
    if (!t.cost_center_id) continue;
    const ccName = ccLookup.get(t.cost_center_id);
    if (!ccName) continue;
    unitCostMap.set(ccName, (unitCostMap.get(ccName) || 0) + paidVal(t));
  }

  const unitRevenue: UnitRevenue[] = Array.from(unitCostMap.entries())
    .map(([unit, custos]) => ({
      unit,
      receita: 0, // Cannot attribute receita per unit without cost_center on receivables
      margem: -custos, // Net = 0 receita - custos
    }))
    .sort((a, b) => b.margem - a.margem);

  // ── Top Projects by Margin ──────────────────────────────────────────────────
  // Receita per project from paid receivables, custos from paid payables.

  const projReceita = new Map<string, number>();
  const projCustos = new Map<string, number>();

  for (const r of paidReceivables) {
    if (!r.project_id) continue;
    projReceita.set(r.project_id, (projReceita.get(r.project_id) || 0) + paidVal(r));
  }
  for (const r of paidPayables) {
    if (!r.project_id) continue;
    projCustos.set(r.project_id, (projCustos.get(r.project_id) || 0) + paidVal(r));
  }

  // Merge project IDs
  const allProjectIds = new Set([...projReceita.keys(), ...projCustos.keys()]);
  const topProjectsByMargin: ProjectMargin[] = Array.from(allProjectIds)
    .map((pid) => {
      const receita = projReceita.get(pid) || 0;
      const custos = projCustos.get(pid) || 0;
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

  const clientRevMap = new Map<string, number>();
  for (const r of paidReceivables) {
    const cid = r.client_id || "__none__";
    clientRevMap.set(cid, (clientRevMap.get(cid) || 0) + paidVal(r));
  }

  const totalClientRevenue = Array.from(clientRevMap.values()).reduce((s, v) => s + v, 0);
  const sortedClients = Array.from(clientRevMap.entries())
    .sort((a, b) => b[1] - a[1]);

  const topClientsByRevenue: ClientRevenue[] = sortedClients
    .slice(0, 5)
    .map(([cid, receita]) => ({
      client: cid === "__none__" ? "Sem cliente" : (clientLookup.get(cid) || cid.slice(0, 8)),
      receita,
      pctTotal: totalClientRevenue > 0 ? (receita / totalClientRevenue) * 100 : 0,
    }));

  const concentracaoTop3 = totalClientRevenue > 0
    ? (sortedClients.slice(0, 3).reduce((s, [, v]) => s + v, 0) / totalClientRevenue) * 100
    : 0;

  // ── Forecast 90d — pending receivables due in next 90 days ──────────────────

  const ar90 = pendingReceivables.filter(
    (r) => r.due_date && r.due_date > today && r.due_date <= in90Str
  );
  const forecastByMonth = new Map<string, number>();
  for (const r of ar90) {
    if (!r.due_date) continue;
    const mk = r.due_date.slice(0, 7);
    forecastByMonth.set(mk, (forecastByMonth.get(mk) || 0) + (r.amount ?? 0));
  }

  // Build 3 months starting from next month
  const forecastMonths: ForecastMonth[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() + 1 + i);
    const mk = monthKey(d);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    forecastMonths.push({
      month: mk,
      label: MONTH_LABELS[mm] || mm,
      value: forecastByMonth.get(mk) || 0,
    });
  }

  const forecastTotal = forecastMonths.reduce((s, m) => s + m.value, 0);

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

  // 4. Pagamentos atrasados > 15 dias
  const fifteenDaysAgo = new Date(now);
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
  const fifteenDaysAgoStr = isoDate(fifteenDaysAgo);
  const overdueOld = pendingReceivables.filter(
    (r) => r.status === "atrasado" && r.due_date && r.due_date < fifteenDaysAgoStr
  );
  if (overdueOld.length > 0) {
    const totalOverdue = overdueOld.reduce((s, r) => s + (r.amount ?? 0), 0);
    alerts.push({
      type: "atraso",
      message: `${overdueOld.length} recebivel(is) atrasado(s) ha mais de 15 dias (total: R$ ${totalOverdue.toLocaleString("pt-BR")})`,
      value: overdueOld.length,
      threshold: 0,
    });
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
    concentracaoTop3,
    alerts,
    forecast90d: {
      total: forecastTotal,
      months: forecastMonths,
    },
    periodLabel,
  };
}
