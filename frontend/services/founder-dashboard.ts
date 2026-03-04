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
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TABLE_TX = "finance_transactions" as never;
const TABLE_CC = "finance_cost_centers" as never;
const TABLE_SNAP = "finance_snapshots_daily" as never;

/** Maps business unit names to cost center codes (uppercase for matching). */
const UNIT_NAMES = ["Branding", "Digital 3D", "Marketing", "Audiovisual"] as const;

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

// ── Main query ────────────────────────────────────────────────────────────────

export async function getFounderDashboardSnapshot(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<FounderDashboardSnapshot> {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const today = isoDate(now);

  // 3 months ago for burn rate
  const m3ago = new Date(now);
  m3ago.setMonth(m3ago.getMonth() - 3);
  const m3agoStr = isoDate(m3ago);

  // 30 days ahead
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);
  const in30Str = isoDate(in30);

  // 90 days ahead
  const in90 = new Date(now);
  in90.setDate(in90.getDate() + 90);
  const in90Str = isoDate(in90);

  // ── Parallel queries ────────────────────────────────────────────────────────

  const [
    mtdRes,        // MTD paid transactions (receita + despesa)
    burn3mRes,     // Last 3 months paid despesas (for burn rate + break-even)
    apRes,         // AP next 30d pending
    arRes,         // AR next 30d pending
    ar90Res,       // AR next 90d pending (for forecast)
    overdueRes,    // Overdue AR > 15 days
    ccRes,         // Cost centers for name lookup
    latestSnap,    // Latest snapshot for caixa atual
    prev2mRes,     // Previous 2 months revenue + expenses (for trend alert)
  ] = await Promise.all([
    // 1. MTD paid/partial transactions
    (supabase as any)
      .from(TABLE_TX)
      .select("type, amount, paid_amount, cost_center_id, project_id, counterpart")
      .eq("tenant_id", tenantId)
      .in("status", ["pago", "parcial"])
      .gte("date", monthStart)
      .lte("date", today),

    // 2. Last 3 months paid despesas (burn rate)
    (supabase as any)
      .from(TABLE_TX)
      .select("type, amount, paid_amount, date")
      .eq("tenant_id", tenantId)
      .eq("type", "despesa")
      .in("status", ["pago", "parcial"])
      .gte("date", m3agoStr)
      .lt("date", monthStart),

    // 3. AP next 30d
    (supabase as any)
      .from(TABLE_TX)
      .select("amount")
      .eq("tenant_id", tenantId)
      .eq("type", "despesa")
      .in("status", ["pendente", "atrasado"])
      .lte("due_date", in30Str),

    // 4. AR next 30d
    (supabase as any)
      .from(TABLE_TX)
      .select("amount")
      .eq("tenant_id", tenantId)
      .eq("type", "receita")
      .in("status", ["pendente", "atrasado"])
      .lte("due_date", in30Str),

    // 5. AR next 90d (for forecast breakdown)
    (supabase as any)
      .from(TABLE_TX)
      .select("amount, due_date")
      .eq("tenant_id", tenantId)
      .eq("type", "receita")
      .in("status", ["pendente", "atrasado"])
      .gt("due_date", today)
      .lte("due_date", in90Str),

    // 6. Overdue AR (> 15 days past due)
    (supabase as any)
      .from(TABLE_TX)
      .select("amount, due_date, counterpart")
      .eq("tenant_id", tenantId)
      .eq("type", "receita")
      .eq("status", "atrasado"),

    // 7. Cost centers
    (supabase as any)
      .from(TABLE_CC)
      .select("id, code, name")
      .eq("tenant_id", tenantId),

    // 8. Latest snapshot
    (supabase as any)
      .from(TABLE_SNAP)
      .select("saldo_acumulado")
      .eq("tenant_id", tenantId)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle(),

    // 9. Previous 2 months paid transactions (for expense trend alert)
    (() => {
      const m2ago = new Date(now);
      m2ago.setMonth(m2ago.getMonth() - 2);
      const m2agoStart = `${m2ago.getFullYear()}-${String(m2ago.getMonth() + 1).padStart(2, "0")}-01`;
      return (supabase as any)
        .from(TABLE_TX)
        .select("type, amount, paid_amount, date")
        .eq("tenant_id", tenantId)
        .in("status", ["pago", "parcial"])
        .gte("date", m2agoStart)
        .lt("date", monthStart);
    })(),
  ]);

  // ── Parse MTD ───────────────────────────────────────────────────────────────

  type TxRow = {
    type: string;
    amount: number;
    paid_amount: number;
    cost_center_id?: string | null;
    project_id?: string | null;
    counterpart?: string | null;
    date?: string;
    due_date?: string;
  };

  const mtd = (mtdRes.data ?? []) as TxRow[];
  const mtdReceitas = mtd.filter((t) => t.type === "receita");
  const mtdDespesas = mtd.filter((t) => t.type === "despesa");

  const receitaRealizada = mtdReceitas.reduce(
    (s, t) => s + (t.paid_amount || t.amount || 0), 0
  );
  const custosDirectos = mtdDespesas.reduce(
    (s, t) => s + (t.paid_amount || t.amount || 0), 0
  );
  const margemReal = receitaRealizada - custosDirectos;
  const margemPct = receitaRealizada > 0 ? (margemReal / receitaRealizada) * 100 : 0;

  // ── Burn rate (avg monthly despesas last 3 months) ──────────────────────────

  const burn3m = (burn3mRes.data ?? []) as TxRow[];
  const burnByMonth = new Map<string, number>();
  for (const t of burn3m) {
    if (!t.date) continue;
    const mk = t.date.slice(0, 7); // "YYYY-MM"
    burnByMonth.set(mk, (burnByMonth.get(mk) || 0) + (t.paid_amount || t.amount || 0));
  }
  const burnRate = avg(Array.from(burnByMonth.values()));

  // Break-even = same as burn rate (avg total costs to cover)
  const breakEven = burnRate;

  // ── Caixa & AP/AR ──────────────────────────────────────────────────────────

  const caixaAtual = (latestSnap.data as any)?.saldo_acumulado ?? 0;

  const apNext30 = ((apRes.data ?? []) as Array<{ amount: number }>).reduce(
    (s, t) => s + (t.amount || 0), 0
  );
  const arNext30 = ((arRes.data ?? []) as Array<{ amount: number }>).reduce(
    (s, t) => s + (t.amount || 0), 0
  );

  const caixaPrevisto30d = caixaAtual + arNext30 - apNext30;
  const runway = burnRate > 0 ? caixaAtual / burnRate : 0;

  // ── Unit Revenue (by cost center → unit mapping) ───────────────────────────

  const ccLookup = new Map(
    ((ccRes.data ?? []) as Array<{ id: string; code: string; name: string }>).map(
      (c) => [c.id, c]
    )
  );

  // Group receitas and despesas by cost center → map to unit name
  const unitData = new Map<string, { receita: number; custos: number }>();
  for (const name of UNIT_NAMES) {
    unitData.set(name, { receita: 0, custos: 0 });
  }

  for (const t of mtd) {
    if (!t.cost_center_id) continue;
    const cc = ccLookup.get(t.cost_center_id);
    if (!cc) continue;

    // Match cost center name to a business unit
    const unitName = UNIT_NAMES.find(
      (u) => cc.name.toLowerCase().includes(u.toLowerCase()) ||
             cc.code.toLowerCase().includes(u.toLowerCase())
    );
    if (!unitName) continue;

    const entry = unitData.get(unitName)!;
    const val = t.paid_amount || t.amount || 0;
    if (t.type === "receita") entry.receita += val;
    if (t.type === "despesa") entry.custos += val;
  }

  const unitRevenue: UnitRevenue[] = UNIT_NAMES.map((name) => {
    const d = unitData.get(name)!;
    return {
      unit: name,
      receita: d.receita,
      margem: d.receita - d.custos,
    };
  });

  // ── Top Projects by Margin ─────────────────────────────────────────────────

  const projData = new Map<string, { receita: number; custos: number }>();
  for (const t of mtd) {
    if (!t.project_id) continue;
    if (!projData.has(t.project_id)) {
      projData.set(t.project_id, { receita: 0, custos: 0 });
    }
    const entry = projData.get(t.project_id)!;
    const val = t.paid_amount || t.amount || 0;
    if (t.type === "receita") entry.receita += val;
    if (t.type === "despesa") entry.custos += val;
  }

  const topProjectsByMargin: ProjectMargin[] = Array.from(projData.entries())
    .map(([project, d]) => ({
      project,
      receita: d.receita,
      custos: d.custos,
      margemPct: d.receita > 0 ? ((d.receita - d.custos) / d.receita) * 100 : 0,
    }))
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 5);

  // ── Top Clients by Revenue ─────────────────────────────────────────────────

  const clientData = new Map<string, number>();
  for (const t of mtdReceitas) {
    const name = t.counterpart || "Sem cliente";
    clientData.set(name, (clientData.get(name) || 0) + (t.paid_amount || t.amount || 0));
  }

  const totalClientRevenue = Array.from(clientData.values()).reduce((s, v) => s + v, 0);
  const sortedClients = Array.from(clientData.entries())
    .sort((a, b) => b[1] - a[1]);

  const topClientsByRevenue: ClientRevenue[] = sortedClients
    .slice(0, 5)
    .map(([client, receita]) => ({
      client,
      receita,
      pctTotal: totalClientRevenue > 0 ? (receita / totalClientRevenue) * 100 : 0,
    }));

  const concentracaoTop3 = totalClientRevenue > 0
    ? (sortedClients.slice(0, 3).reduce((s, [, v]) => s + v, 0) / totalClientRevenue) * 100
    : 0;

  // ── Forecast 90d ───────────────────────────────────────────────────────────

  const ar90 = (ar90Res.data ?? []) as Array<{ amount: number; due_date: string }>;
  const forecastByMonth = new Map<string, number>();

  for (const t of ar90) {
    if (!t.due_date) continue;
    const mk = t.due_date.slice(0, 7);
    forecastByMonth.set(mk, (forecastByMonth.get(mk) || 0) + (t.amount || 0));
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

  // ── Alerts (Founder Radar) ─────────────────────────────────────────────────

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
  const overdue = (overdueRes.data ?? []) as Array<{ amount: number; due_date: string; counterpart: string | null }>;
  const fifteenDaysAgo = new Date(now);
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
  const overdueOld = overdue.filter((t) => t.due_date && new Date(t.due_date) < fifteenDaysAgo);
  if (overdueOld.length > 0) {
    const totalOverdue = overdueOld.reduce((s, t) => s + (t.amount || 0), 0);
    alerts.push({
      type: "atraso",
      message: `${overdueOld.length} recebivel(is) atrasado(s) ha mais de 15 dias (total: R$ ${totalOverdue.toLocaleString("pt-BR")})`,
      value: overdueOld.length,
      threshold: 0,
    });
  }

  // 5. Despesas crescendo acima da receita (2 meses seguidos)
  const prev2m = (prev2mRes.data ?? []) as TxRow[];
  const trendByMonth = new Map<string, { receita: number; despesa: number }>();
  for (const t of prev2m) {
    if (!t.date) continue;
    const mk = t.date.slice(0, 7);
    if (!trendByMonth.has(mk)) trendByMonth.set(mk, { receita: 0, despesa: 0 });
    const entry = trendByMonth.get(mk)!;
    const val = t.paid_amount || t.amount || 0;
    if (t.type === "receita") entry.receita += val;
    if (t.type === "despesa") entry.despesa += val;
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
  };
}
