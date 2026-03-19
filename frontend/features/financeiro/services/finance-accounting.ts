/**
 * finance-accounting.ts
 * Integração contábil: DRE, plano de contas, lançamentos mensais.
 * Item 07 — Integração Contábil do módulo financeiro.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { TABLE_TRANSACTIONS, TABLE_CATEGORIES } from "./finance-types";

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

// ── Category → DRE group mapping ─────────────────────────────────────────────

const CATEGORY_DRE_MAP: Record<string, DreGroup> = {
  // receitas
  "receita_servico": "receita_bruta",
  "receita_producao": "receita_bruta",
  "receita_fee": "receita_bruta",
  "receita_midia": "receita_bruta",
  // deduções
  "impostos": "deducoes",
  "iss": "deducoes",
  "pis_cofins": "deducoes",
  // custo
  "custo_producao": "custo_producao",
  "fornecedor": "custo_producao",
  "freelancer": "custo_producao",
  // pessoal
  "folha": "despesa_pessoal",
  "beneficios": "despesa_pessoal",
  "encargos": "despesa_pessoal",
  // admin
  "aluguel": "despesa_admin",
  "administrativo": "despesa_admin",
  "contabilidade": "despesa_admin",
  "juridico": "despesa_admin",
  // tecnologia
  "software": "despesa_tecnologia",
  "tecnologia": "despesa_tecnologia",
  "hosting": "despesa_tecnologia",
  // financeiro
  "juros": "despesa_financeira",
  "tarifas_bancarias": "despesa_financeira",
  "emprestimo": "despesa_financeira",
};

function inferDreGroup(categoryName: string): DreGroup {
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

    const cat = tx.category_id ? catMap.get(tx.category_id) : null;
    const group = cat ? inferDreGroup(cat.name) : (tx.type === "receita" ? "receita_bruta" : "outros");

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
  const [from, to] = (() => {
    const [y, m] = month.split("-").map(Number);
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const end = new Date(y, m, 0).toISOString().split("T")[0];
    return [start, end];
  })();

  const [txRes, catRes, payrollRes] = await Promise.all([
    db
      .from(TABLE_TRANSACTIONS)
      .select("type, amount, paid_amount, status, category_id")
      .gte("date", from)
      .lte("date", to),
    db.from(TABLE_CATEGORIES).select("id, name, type"),
    db
      .from("finance_team_payroll")
      .select("gross_salary, benefits_total, employer_taxes")
      .eq("month", month),
  ]);

  const payrollTotal = ((payrollRes.data ?? []) as Array<{
    gross_salary: number;
    benefits_total: number;
    employer_taxes: number;
  }>).reduce((s, p) => s + (p.gross_salary || 0) + (p.benefits_total || 0) + (p.employer_taxes || 0), 0);

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

  const upsertPayload = {
    ...dreData,
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
