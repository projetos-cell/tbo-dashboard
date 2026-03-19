/**
 * finance-accounting.ts
 * Integração contábil: DRE, plano de contas, lançamentos mensais.
 * Item 07 — Integração Contábil do módulo financeiro.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { TABLE_TRANSACTIONS, TABLE_CATEGORIES } from "./finance-types";
import { getTBOMonthRangeFromString } from "./finance-cycle";

// Use untyped client for new tables (finance_dre_snapshots, finance_chart_of_accounts)
// not yet in generated Database types.
type AccountingSupabase = SupabaseClient<Database>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any>;

// ── Types ─────────────────────────────────────────────────────────────────────

export type DreGroup =
  | "receita_bruta"
  | "deducoes"
  | "custo_producao"
  | "despesa_pessoal"
  | "despesa_marketing"
  | "despesa_admin"
  | "despesa_tecnologia"
  | "despesa_financeira"
  | "depreciacao"
  | "impostos_renda"
  | "outros";

export interface ChartOfAccount {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  dre_group: DreGroup;
  dre_order: number;
  tipo: "receita" | "despesa" | "neutro";
  is_active: boolean;
  omie_id: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DRESnapshot {
  id: string;
  tenant_id: string;
  month: string;
  receita_bruta: number;
  deducoes: number;
  receita_liquida: number;
  custo_producao: number;
  lucro_bruto: number;
  desp_pessoal: number;
  desp_marketing: number;
  desp_admin: number;
  desp_tecnologia: number;
  desp_outros: number;
  total_desp_op: number;
  ebitda: number;
  depreciacao: number;
  ebit: number;
  result_financeiro: number;
  lair: number;
  irpj_csll: number;
  lucro_liquido: number;
  meta_receita: number | null;
  meta_ebitda: number | null;
  source: string;
  notes: string | null;
  computed_at: string;
}

export interface DRELine {
  label: string;
  key: keyof DRESnapshot | string;
  value: number;
  indent: number;       // 0 = top-level, 1 = sub-item
  isSubtotal: boolean;
  isTotal: boolean;
  isPositive?: boolean; // undefined = neutral, true = green, false = red
  sign: 1 | -1;        // 1 = add, -1 = subtract in the waterfall
}

export interface DRESummary {
  month: string;
  receitaBruta: number;
  receitaLiquida: number;
  ebitda: number;
  ebitdaMargin: number;
  lucroLiquido: number;
  lucroMargin: number;
  metaReceita: number | null;
  metaEbitda: number | null;
  vsMetaReceita: number | null;  // %
  vsMetaEbitda: number | null;   // %
  snapshot: DRESnapshot;
}

export interface DRETrend {
  month: string;
  receitaBruta: number;
  ebitda: number;
  lucroLiquido: number;
  ebitdaMargin: number;
}

// ── OMIE categoria_codigo → DRE group mapping ───────────────────────────────
// OMIE uses a hierarchical numeric code: first digit = type (1=receita, 2=despesa).
// Second level = major group. We map the prefix to the DRE bucket.

// Mapping calibrated against TBO's internal budget spreadsheet (Orçamento Agência TBO.xlsx).
// Codes verified against real transaction data from OMIE.
const OMIE_CODE_DRE_MAP: Array<[string, DreGroup]> = [
  // 1.xx = Receitas (Serviços Prestados, BV, Indicações)
  ["1.", "receita_bruta"],
  // 2.01 = Despesas de Pessoas (salários equipe — ~R$61k/mês)
  ["2.01.", "despesa_pessoal"],
  // 2.02 = Deduções (ISS, PIS, COFINS)
  ["2.02.", "deducoes"],
  // 2.03 = Terceirização / Custo de Produção (freelancers 3D, branding, AV, interiores)
  ["2.03.", "custo_producao"],
  // 2.04 = Despesas Operacionais (contabilidade, BPO, associações, plataformas, INSS, mentoria)
  ["2.04.", "despesa_admin"],
  // 2.05 = Impostos e taxas operacionais
  ["2.05.", "deducoes"],
  // 2.06 = Depreciação e amortização
  ["2.06.", "depreciacao"],
  // 2.07 = Despesas de Vendas (comissão, CRM RD Station, comercial)
  ["2.07.", "despesa_marketing"],
  // 2.08 = Marketing e Comercial (campanhas, agência terceirizada, comissões)
  ["2.08.", "despesa_marketing"],
  // 2.09 = Resultado financeiro (juros, tarifas bancárias)
  ["2.09.", "despesa_financeira"],
  // 2.10 = Resultado financeiro (empréstimos, consórcio)
  ["2.10.", "despesa_financeira"],
  // 2.11+ = Impostos sobre renda (IRPJ, CSLL)
  ["2.11.", "impostos_renda"],
];

function inferDreGroupFromOmieCode(code: string): DreGroup | null {
  for (const [prefix, group] of OMIE_CODE_DRE_MAP) {
    if (code.startsWith(prefix)) return group;
  }
  return null;
}

// Fallback: category name → DRE group (for transactions without omie_categoria_codigo)
// Keywords matched against normalized category name (lowercase, underscored).
// Calibrated against real TBO category names from OMIE:
//   (-) Custos - Mão de Obra, (-) Pessoal - Pró-Labore, (-) Impostos - Simples Nacional,
//   (-) Financeira - Tarifas Bancárias, (-) Administrativas - ..., (+) Receitas - ...
const CATEGORY_DRE_MAP: Record<string, DreGroup> = {
  // receitas (todas as (+) Receitas - ...)
  "receitas": "receita_bruta", "receita": "receita_bruta",
  "conta_a_receber": "receita_bruta",
  // deduções
  "impostos": "deducoes", "simples_nacional": "deducoes",
  "iss": "deducoes", "pis_cofins": "deducoes",
  // custo de produção (mão de obra = freelancers + fixa alocada em projetos)
  "mao_de_obra": "custo_producao", "freelancer": "custo_producao",
  "custos_-_mao": "custo_producao",
  // pessoal (pró-labore, INSS, benefícios)
  "pro-labore": "despesa_pessoal", "pro_labore": "despesa_pessoal",
  "inss": "despesa_pessoal", "irrf": "despesa_pessoal",
  "pessoal": "despesa_pessoal", "folha": "despesa_pessoal",
  "beneficios": "despesa_pessoal", "encargos": "despesa_pessoal",
  // marketing / comercial
  "comercial": "despesa_marketing", "marketing": "despesa_marketing",
  "midia": "despesa_marketing",
  // admin
  "administrativas": "despesa_admin", "administrativo": "despesa_admin",
  "sindicatos": "despesa_admin", "associacoes": "despesa_admin",
  "contabilidade": "despesa_admin", "bpo": "despesa_admin",
  "consultorias": "despesa_admin", "mentoria": "despesa_admin",
  "software": "despesa_admin", "assinaturas": "despesa_admin",
  "juridico": "despesa_admin", "aluguel": "despesa_admin",
  "servicos_terceiros": "despesa_admin",
  "conta_a_pagar": "despesa_admin", "outros_custos": "despesa_admin",
  "outros": "despesa_admin",
  // financeiro
  "tarifas_bancarias": "despesa_financeira", "tarifas": "despesa_financeira",
  "juros": "despesa_financeira", "emprestimo": "despesa_financeira",
  "financiamento": "despesa_financeira", "parcelamentos": "despesa_financeira",
  "consorcios": "despesa_financeira", "investimento": "despesa_financeira",
  "financeira": "despesa_financeira",
};

function inferDreGroupFromName(categoryName: string): DreGroup {
  const lower = categoryName.toLowerCase().replace(/\s+/g, "_");
  for (const [key, group] of Object.entries(CATEGORY_DRE_MAP)) {
    if (lower.includes(key)) return group;
  }
  return "outros";
}

// ── Build DRE from transactions ───────────────────────────────────────────────

interface RawTransaction {
  type: string;
  amount: number;
  paid_amount: number;
  status: string;
  category_id: string | null;
  omie_categoria_codigo: string | null;
}

interface RawCategory {
  id: string;
  name: string;
  type: string;
}

function buildDREFromTransactions(
  transactions: RawTransaction[],
  categories: RawCategory[],
  payrollTotal: number,
  month: string
): Omit<DRESnapshot, "id" | "tenant_id" | "computed_at" | "meta_receita" | "meta_ebitda" | "source" | "notes" | "updated_at" | "created_at"> {
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const buckets: Record<DreGroup, number> = {
    receita_bruta: 0,
    deducoes: 0,
    custo_producao: 0,
    despesa_pessoal: payrollTotal,
    despesa_marketing: 0,
    despesa_admin: 0,
    despesa_tecnologia: 0,
    despesa_financeira: 0,
    depreciacao: 0,
    impostos_renda: 0,
    outros: 0,
  };

  for (const tx of transactions) {
    if (!["pago", "liquidado", "provisionado"].includes(tx.status)) continue;
    const val = tx.paid_amount || tx.amount || 0;
    if (val <= 0) continue;

    // Priority: 1) OMIE category code  2) category name  3) tx type fallback
    const omieGroup = tx.omie_categoria_codigo
      ? inferDreGroupFromOmieCode(tx.omie_categoria_codigo)
      : null;
    const cat = tx.category_id ? catMap.get(tx.category_id) : null;
    const group = omieGroup
      ?? (cat ? inferDreGroupFromName(cat.name) : null)
      ?? (tx.type === "receita" ? "receita_bruta" : "outros");

    buckets[group] += val;
  }

  const receita_bruta = buckets.receita_bruta;
  const deducoes = buckets.deducoes;
  const receita_liquida = receita_bruta - deducoes;
  const custo_producao = buckets.custo_producao;
  const lucro_bruto = receita_liquida - custo_producao;
  const desp_pessoal = buckets.despesa_pessoal;
  const desp_marketing = buckets.despesa_marketing;
  const desp_admin = buckets.despesa_admin;
  const desp_tecnologia = buckets.despesa_tecnologia;
  const desp_outros = buckets.outros;
  const total_desp_op = desp_pessoal + desp_marketing + desp_admin + desp_tecnologia + desp_outros;
  const ebitda = lucro_bruto - total_desp_op;
  const depreciacao = buckets.depreciacao;
  const ebit = ebitda - depreciacao;
  const result_financeiro = -buckets.despesa_financeira;
  const lair = ebit + result_financeiro;
  const irpj_csll = buckets.impostos_renda;
  const lucro_liquido = lair - irpj_csll;

  return {
    month,
    receita_bruta,
    deducoes,
    receita_liquida,
    custo_producao,
    lucro_bruto,
    desp_pessoal,
    desp_marketing,
    desp_admin,
    desp_tecnologia,
    desp_outros,
    total_desp_op,
    ebitda,
    depreciacao,
    ebit,
    result_financeiro,
    lair,
    irpj_csll,
    lucro_liquido,
  };
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function getDRESnapshot(
  supabase: AccountingSupabase,
  month: string
): Promise<DRESnapshot | null> {
  const db = supabase as AnySupabase;
  const { data } = await db
    .from("finance_dre_snapshots")
    .select("*")
    .eq("month", month)
    .maybeSingle();
  return (data as DRESnapshot | null) ?? null;
}

export async function getDRETrend(
  supabase: AccountingSupabase,
  months: number = 12
): Promise<DRETrend[]> {
  const db = supabase as AnySupabase;
  const { data } = await db
    .from("finance_dre_snapshots")
    .select("month, receita_bruta, ebitda, lucro_liquido")
    .order("month", { ascending: false })
    .limit(months);

  if (!data) return [];

  return (data as Array<{
    month: string;
    receita_bruta: number;
    ebitda: number;
    lucro_liquido: number;
  }>)
    .reverse()
    .map((row) => ({
      month: row.month,
      receitaBruta: row.receita_bruta,
      ebitda: row.ebitda,
      lucroLiquido: row.lucro_liquido,
      ebitdaMargin: row.receita_bruta > 0
        ? (row.ebitda / row.receita_bruta) * 100
        : 0,
    }));
}

export async function computeAndUpsertDRE(
  supabase: AccountingSupabase,
  month: string
): Promise<DRESnapshot> {
  const db = supabase as AnySupabase;

  // Resolve tenant_id from the authenticated user's profile (required by RLS + UNIQUE constraint).
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await db
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();
  if (!profile?.tenant_id) throw new Error("Tenant not found");
  const tenantId: string = profile.tenant_id;

  // TBO financial cycle: month runs from day 15 to day 14 of next month
  const { from, to } = getTBOMonthRangeFromString(month);

  const [txRes, catRes, payrollRes] = await Promise.all([
    db
      .from(TABLE_TRANSACTIONS)
      .select("type, amount, paid_amount, status, category_id, omie_categoria_codigo")
      .gte("date", from)
      .lte("date", to),
    db.from(TABLE_CATEGORIES).select("id, name, type"),
    db
      .from("finance_team_payroll")
      .select("salary, is_active")
      .eq("month", month)
      .eq("is_active", true),
  ]);

  const payrollTotal = ((payrollRes.data ?? []) as Array<{
    salary: number;
    is_active: boolean;
  }>).reduce((s, p) => s + (p.salary || 0), 0);

  const dreData = buildDREFromTransactions(
    (txRes.data ?? []) as RawTransaction[],
    (catRes.data ?? []) as RawCategory[],
    payrollTotal,
    month
  );

  const { data: existing } = await db
    .from("finance_dre_snapshots")
    .select("id, meta_receita, meta_ebitda")
    .eq("month", month)
    .maybeSingle();

  // Exclude GENERATED ALWAYS AS STORED columns — Postgres rejects explicit values for them.
  const {
    receita_liquida: _rl,
    lucro_bruto: _lb,
    total_desp_op: _tdo,
    ebitda: _eb,
    ebit: _ebit,
    lair: _lair,
    lucro_liquido: _ll,
    ...inputFields
  } = dreData;

  const upsertPayload = {
    ...inputFields,
    tenant_id: tenantId,
    meta_receita: (existing as { meta_receita?: number | null } | null)?.meta_receita ?? null,
    meta_ebitda: (existing as { meta_ebitda?: number | null } | null)?.meta_ebitda ?? null,
    source: "computed",
    computed_at: new Date().toISOString(),
    ...(existing ? { id: (existing as { id: string }).id } : {}),
  };

  const { data, error } = await db
    .from("finance_dre_snapshots")
    .upsert(upsertPayload, { onConflict: "tenant_id,month" })
    .select("*")
    .single();

  if (error) throw new Error(`DRE upsert failed: ${error.message}`);
  return data as DRESnapshot;
}

export async function updateDREMeta(
  supabase: AccountingSupabase,
  month: string,
  meta: { meta_receita?: number; meta_ebitda?: number }
): Promise<void> {
  const db = supabase as AnySupabase;
  const { error } = await db
    .from("finance_dre_snapshots")
    .update(meta)
    .eq("month", month);
  if (error) throw new Error(`DRE meta update failed: ${error.message}`);
}

export async function getChartOfAccounts(
  supabase: AccountingSupabase
): Promise<ChartOfAccount[]> {
  const db = supabase as AnySupabase;
  const { data } = await db
    .from("finance_chart_of_accounts")
    .select("*")
    .eq("is_active", true)
    .order("dre_order", { ascending: true });
  return (data ?? []) as ChartOfAccount[];
}

// ── DRE lines builder ─────────────────────────────────────────────────────────

export function buildDRELines(snap: DRESnapshot): DRELine[] {
  const v = (n: number) => n;
  return [
    { label: "Receita Bruta de Serviços", key: "receita_bruta", value: v(snap.receita_bruta), indent: 0, isSubtotal: false, isTotal: false, isPositive: true, sign: 1 },
    { label: "(-) Deduções e Impostos s/ Receita", key: "deducoes", value: v(snap.deducoes), indent: 1, isSubtotal: false, isTotal: false, isPositive: false, sign: -1 },
    { label: "(=) Receita Líquida", key: "receita_liquida", value: v(snap.receita_liquida), indent: 0, isSubtotal: true, isTotal: false, isPositive: snap.receita_liquida >= 0, sign: 1 },
    { label: "(-) Custos de Produção", key: "custo_producao", value: v(snap.custo_producao), indent: 1, isSubtotal: false, isTotal: false, isPositive: false, sign: -1 },
    { label: "(=) Lucro Bruto", key: "lucro_bruto", value: v(snap.lucro_bruto), indent: 0, isSubtotal: true, isTotal: false, isPositive: snap.lucro_bruto >= 0, sign: 1 },
    { label: "(-) Despesas com Pessoal", key: "desp_pessoal", value: v(snap.desp_pessoal), indent: 1, isSubtotal: false, isTotal: false, isPositive: false, sign: -1 },
    { label: "(-) Despesas de Marketing", key: "desp_marketing", value: v(snap.desp_marketing), indent: 1, isSubtotal: false, isTotal: false, isPositive: false, sign: -1 },
    { label: "(-) Despesas Administrativas", key: "desp_admin", value: v(snap.desp_admin), indent: 1, isSubtotal: false, isTotal: false, isPositive: false, sign: -1 },
    { label: "(-) Despesas com Tecnologia", key: "desp_tecnologia", value: v(snap.desp_tecnologia), indent: 1, isSubtotal: false, isTotal: false, isPositive: false, sign: -1 },
    { label: "(-) Outras Despesas Operacionais", key: "desp_outros", value: v(snap.desp_outros), indent: 1, isSubtotal: false, isTotal: false, isPositive: false, sign: -1 },
    { label: "(=) EBITDA", key: "ebitda", value: v(snap.ebitda), indent: 0, isSubtotal: true, isTotal: false, isPositive: snap.ebitda >= 0, sign: 1 },
    { label: "(-) Depreciação e Amortização", key: "depreciacao", value: v(snap.depreciacao), indent: 1, isSubtotal: false, isTotal: false, isPositive: false, sign: -1 },
    { label: "(=) EBIT (Resultado Operacional)", key: "ebit", value: v(snap.ebit), indent: 0, isSubtotal: true, isTotal: false, isPositive: snap.ebit >= 0, sign: 1 },
    { label: "(+/-) Resultado Financeiro", key: "result_financeiro", value: v(snap.result_financeiro), indent: 1, isSubtotal: false, isTotal: false, isPositive: snap.result_financeiro >= 0, sign: 1 },
    { label: "(=) LAIR (Lucro Antes do IR)", key: "lair", value: v(snap.lair), indent: 0, isSubtotal: true, isTotal: false, isPositive: snap.lair >= 0, sign: 1 },
    { label: "(-) IRPJ + CSLL", key: "irpj_csll", value: v(snap.irpj_csll), indent: 1, isSubtotal: false, isTotal: false, isPositive: false, sign: -1 },
    { label: "(=) Lucro Líquido", key: "lucro_liquido", value: v(snap.lucro_liquido), indent: 0, isSubtotal: false, isTotal: true, isPositive: snap.lucro_liquido >= 0, sign: 1 },
  ];
}

// ── DRE Comparison ────────────────────────────────────────────────────────────

export interface DREComparisonLine {
  label: string;
  key: string;
  current: number;
  previous: number;
  /** Absolute difference: current - previous */
  delta: number;
  /** Percentage change (null if previous = 0) */
  deltaPct: number | null;
  /**
   * Whether the delta direction is favorable.
   * true = good, false = bad, null = neutral (computed subtotals)
   */
  isPositiveDelta: boolean | null;
  /** Highlight when |deltaPct| > 10% */
  isSignificant: boolean;
}

export interface DREComparison {
  currentMonth: string;
  previousMonth: string;
  lines: DREComparisonLine[];
  current: DRESnapshot | null;
  previous: DRESnapshot | null;
}

/** Numeric DRE keys in waterfall order */
const DRE_NUMERIC_KEYS: Array<keyof DRESnapshot> = [
  "receita_bruta", "deducoes", "receita_liquida", "custo_producao",
  "lucro_bruto", "desp_pessoal", "desp_marketing", "desp_admin",
  "desp_tecnologia", "desp_outros", "total_desp_op", "ebitda",
  "depreciacao", "ebit", "result_financeiro", "lair", "irpj_csll", "lucro_liquido",
];

const DRE_LABEL_MAP: Record<string, string> = {
  receita_bruta: "Receita Bruta",
  deducoes: "(-) Deduções",
  receita_liquida: "(=) Receita Líquida",
  custo_producao: "(-) Custo de Produção",
  lucro_bruto: "(=) Lucro Bruto",
  desp_pessoal: "(-) Despesas com Pessoal",
  desp_marketing: "(-) Despesas de Marketing",
  desp_admin: "(-) Despesas Administrativas",
  desp_tecnologia: "(-) Despesas com Tecnologia",
  desp_outros: "(-) Outras Despesas",
  total_desp_op: "(=) Total Despesas Op.",
  ebitda: "(=) EBITDA",
  depreciacao: "(-) Depreciação",
  ebit: "(=) EBIT",
  result_financeiro: "Resultado Financeiro",
  lair: "(=) LAIR",
  irpj_csll: "(-) IRPJ + CSLL",
  lucro_liquido: "(=) Lucro Líquido",
};

// Lines where a positive delta is favorable (revenue/profit)
const REVENUE_KEYS = new Set([
  "receita_bruta", "receita_liquida", "lucro_bruto", "ebitda",
  "ebit", "result_financeiro", "lair", "lucro_liquido",
]);
// Lines where a negative delta is favorable (expenses — lower is better)
const EXPENSE_KEYS = new Set([
  "deducoes", "custo_producao", "desp_pessoal", "desp_marketing",
  "desp_admin", "desp_tecnologia", "desp_outros", "total_desp_op",
  "depreciacao", "irpj_csll",
]);

/**
 * Compare two DRE snapshots, computing delta and % variation per line.
 * Variations > 10% in absolute value are flagged as `isSignificant`.
 */
export async function getDREComparison(
  supabase: AccountingSupabase,
  currentMonth: string,
  previousMonth: string
): Promise<DREComparison> {
  const [current, previous] = await Promise.all([
    getDRESnapshot(supabase, currentMonth),
    getDRESnapshot(supabase, previousMonth),
  ]);

  const lines: DREComparisonLine[] = DRE_NUMERIC_KEYS.map((key) => {
    const cur = typeof current?.[key] === "number" ? (current[key] as number) : 0;
    const prev = typeof previous?.[key] === "number" ? (previous[key] as number) : 0;
    const delta = cur - prev;
    const deltaPct = prev !== 0 ? (delta / Math.abs(prev)) * 100 : null;

    let isPositiveDelta: boolean | null = null;
    if (delta !== 0) {
      if (REVENUE_KEYS.has(key)) isPositiveDelta = delta > 0;
      else if (EXPENSE_KEYS.has(key)) isPositiveDelta = delta < 0;
    }

    return {
      label: DRE_LABEL_MAP[key] ?? key,
      key,
      current: cur,
      previous: prev,
      delta,
      deltaPct,
      isPositiveDelta,
      isSignificant: deltaPct !== null && Math.abs(deltaPct) > 10,
    };
  });

  return { currentMonth, previousMonth, lines, current, previous };
}

export function buildDRESummary(snap: DRESnapshot): DRESummary {
  const ebitdaMargin = snap.receita_bruta > 0 ? (snap.ebitda / snap.receita_bruta) * 100 : 0;
  const lucroMargin = snap.receita_bruta > 0 ? (snap.lucro_liquido / snap.receita_bruta) * 100 : 0;
  const vsMetaReceita = snap.meta_receita && snap.meta_receita > 0
    ? ((snap.receita_bruta - snap.meta_receita) / snap.meta_receita) * 100
    : null;
  const vsMetaEbitda = snap.meta_ebitda && snap.meta_ebitda !== 0
    ? ((snap.ebitda - snap.meta_ebitda) / Math.abs(snap.meta_ebitda)) * 100
    : null;

  return {
    month: snap.month,
    receitaBruta: snap.receita_bruta,
    receitaLiquida: snap.receita_liquida,
    ebitda: snap.ebitda,
    ebitdaMargin,
    lucroLiquido: snap.lucro_liquido,
    lucroMargin,
    metaReceita: snap.meta_receita,
    metaEbitda: snap.meta_ebitda,
    vsMetaReceita,
    vsMetaEbitda,
    snapshot: snap,
  };
}
