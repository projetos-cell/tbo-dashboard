import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createSyncLogger } from "../sync-omie/_logger";

const log = createSyncLogger("data-quality");

// 2 minutes max for data quality checks
export const maxDuration = 120;

// ── Types ───────────────────────────────────────────────────────────────────

interface DQDetail {
  phase: string;
  action: string;
  count: number;
  ids?: string[];
}

interface TransactionRow {
  id: string;
  tenant_id: string;
  type: string;
  status: string;
  description: string;
  amount: number;
  paid_amount: number;
  date: string;
  due_date: string | null;
  paid_date: string | null;
  counterpart: string | null;
  counterpart_doc: string | null;
  category_id: string | null;
  omie_id: string | null;
  omie_raw: Record<string, unknown> | null;
  dq_flags: string[];
}

interface ClientRow {
  omie_id: string;
  name: string;
  cnpj: string | null;
}

interface VendorRow {
  omie_id: string;
  name: string;
  cnpj: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAdmin = any;

// ── GET /api/finance/data-quality (Vercel Cron — every 10min) ───────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runDataQuality("cron");
}

// ── POST (manual trigger) ───────────────────────────────────────────────────

export async function POST() {
  return runDataQuality("manual");
}

// ── Core pipeline ───────────────────────────────────────────────────────────

async function runDataQuality(triggerSource: "cron" | "manual") {
  const startTime = Date.now();
  const startedAt = new Date().toISOString();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const supabase = createServiceClient(supabaseUrl, serviceRoleKey);

  // Get all tenants with finance data
  const { data: tenants } = await supabase
    .from("finance_transactions")
    .select("tenant_id")
    .limit(1000);

  const uniqueTenants = [...new Set((tenants ?? []).map((t: { tenant_id: string }) => t.tenant_id))];

  if (!uniqueTenants.length) {
    return NextResponse.json({ ok: true, message: "No tenants with finance data" });
  }

  const allResults: Array<{ tenantId: string; confidence: number; fixes: number }> = [];

  for (const tenantId of uniqueTenants) {
    const result = await runTenantDQ(supabase, tenantId, triggerSource, startedAt);
    allResults.push(result);
  }

  const avgConfidence = allResults.reduce((s, r) => s + r.confidence, 0) / allResults.length;
  const totalFixes = allResults.reduce((s, r) => s + r.fixes, 0);

  log.info("Data quality pipeline complete", {
    tenants: allResults.length,
    avgConfidence: avgConfidence.toFixed(1),
    totalFixes,
    durationMs: Date.now() - startTime,
  });

  return NextResponse.json({
    ok: true,
    tenants: allResults.length,
    avgConfidence: Math.round(avgConfidence * 10) / 10,
    totalFixes,
    durationMs: Date.now() - startTime,
    results: allResults,
  });
}

// ── Per-tenant pipeline ─────────────────────────────────────────────────────

async function runTenantDQ(
  supabase: SupabaseAdmin,
  tenantId: string,
  triggerSource: string,
  startedAt: string
): Promise<{ tenantId: string; confidence: number; fixes: number }> {
  const details: DQDetail[] = [];
  const errors: string[] = [];

  let paidAmountFixed = 0;
  let statusFixed = 0;
  let counterpartResolved = 0;
  let rateioSplit = 0;
  let heuristicClassified = 0;
  let reconciled = 0;
  let anomaliesFlagged = 0;

  try {
    // Fetch all transactions with omie_raw for this tenant
    const { data: txRows } = await supabase
      .from("finance_transactions")
      .select("id, tenant_id, type, status, description, amount, paid_amount, date, due_date, paid_date, counterpart, counterpart_doc, category_id, omie_id, omie_raw, dq_flags")
      .eq("tenant_id", tenantId)
      .not("omie_id", "is", null);

    const transactions = (txRows ?? []) as unknown as TransactionRow[];

    // ── Phase 1: Re-derive paid_amount from omie_raw ──────────────────────
    const phase1 = await phasePaidAmountRederive(supabase, transactions);
    paidAmountFixed = phase1.fixed;
    if (phase1.fixed > 0) {
      details.push({ phase: "paid_amount", action: "re-derived from omie_raw", count: phase1.fixed });
    }
    errors.push(...phase1.errors);

    // ── Phase 2: Fix status inconsistencies ───────────────────────────────
    const phase2 = await phaseStatusConsistency(supabase, transactions);
    statusFixed = phase2.fixed;
    if (phase2.fixed > 0) {
      details.push({ phase: "status", action: "corrected inconsistencies", count: phase2.fixed });
    }
    errors.push(...phase2.errors);

    // ── Phase 3: Resolve missing counterparts ─────────────────────────────
    const phase3 = await phaseCounterpartResolve(supabase, tenantId, transactions);
    counterpartResolved = phase3.fixed;
    if (phase3.fixed > 0) {
      details.push({ phase: "counterpart", action: "resolved from client/vendor lookup", count: phase3.fixed });
    }
    errors.push(...phase3.errors);

    // ── Phase 4: Parse rateio (category distribution) ─────────────────────
    const phase4 = await phaseRateioCategories(supabase, tenantId, transactions);
    rateioSplit = phase4.fixed;
    if (phase4.fixed > 0) {
      details.push({ phase: "rateio", action: "primary category updated from distribution", count: phase4.fixed });
    }
    errors.push(...phase4.errors);

    // ── Phase 5: Heuristic category classification from description ─────
    const phase5h = await phaseHeuristicClassification(supabase, tenantId, transactions);
    heuristicClassified = phase5h.fixed;
    if (phase5h.fixed > 0) {
      details.push({ phase: "heuristic_category", action: "classified from description pattern", count: phase5h.fixed });
    }
    errors.push(...phase5h.errors);

    // ── Phase 6: Reconcile with bank statements ───────────────────────────
    const phase5 = await phaseReconciliation(supabase, tenantId, transactions);
    reconciled = phase5.fixed;
    if (phase5.fixed > 0) {
      details.push({ phase: "reconciliation", action: "matched with bank statement", count: phase5.fixed });
    }
    errors.push(...phase5.errors);

    // ── Phase 7: Flag anomalies ───────────────────────────────────────────
    const phase6 = await phaseAnomalyDetection(supabase, transactions);
    anomaliesFlagged = phase6.fixed;
    if (phase6.fixed > 0) {
      details.push({ phase: "anomalies", action: "flagged for review", count: phase6.fixed });
    }
    errors.push(...phase6.errors);

  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  // Calculate confidence score
  const totalFixes = paidAmountFixed + statusFixed + counterpartResolved + rateioSplit + heuristicClassified + reconciled;
  const confidence = calculateConfidence(supabase, tenantId, anomaliesFlagged);
  const confidenceScore = await confidence;

  // Log results
  await supabase.from("finance_data_quality_log").insert({
    tenant_id: tenantId,
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    trigger_source: triggerSource,
    paid_amount_fixed: paidAmountFixed,
    status_fixed: statusFixed,
    counterpart_resolved: counterpartResolved,
    rateio_split: rateioSplit,
    reconciled,
    anomalies_flagged: anomaliesFlagged,
    confidence_score: confidenceScore,
    details: JSON.stringify(details),
    errors: JSON.stringify(errors.slice(0, 20)),
  } as never);

  return { tenantId, confidence: confidenceScore, fixes: totalFixes };
}

// ── Phase 1: Re-derive paid_amount ──────────────────────────────────────────

async function phasePaidAmountRederive(
  supabase: SupabaseAdmin,
  transactions: TransactionRow[]
): Promise<{ fixed: number; errors: string[] }> {
  let fixed = 0;
  const errors: string[] = [];
  const updates: Array<{ id: string; paid_amount: number }> = [];

  for (const tx of transactions) {
    if (!tx.omie_raw) continue;

    const raw = tx.omie_raw;
    const valorDoc = Number(raw.valor_documento || 0);
    const juros = Number(raw.nValorJuros || 0);
    const multa = Number(raw.nValorMulta || 0);
    const desconto = Number(raw.nValorDesconto || 0);

    // Get the real paid value from OMIE raw
    const rawPago = Number(raw.valor_pago || raw.valor_recebido || 0);

    let correctPaidAmount: number;
    if (rawPago > 0) {
      correctPaidAmount = rawPago;
    } else if (tx.status === "pago" || tx.status === "parcial") {
      correctPaidAmount = valorDoc + juros + multa - desconto;
    } else {
      correctPaidAmount = 0;
    }

    // Round to 2 decimals for comparison
    const currentRounded = Math.round(tx.paid_amount * 100) / 100;
    const correctRounded = Math.round(correctPaidAmount * 100) / 100;

    if (currentRounded !== correctRounded && correctRounded > 0) {
      updates.push({ id: tx.id, paid_amount: correctRounded });
    }
  }

  // Batch update
  for (const upd of updates) {
    const { error } = await supabase
      .from("finance_transactions")
      .update({ paid_amount: upd.paid_amount, dq_last_checked_at: new Date().toISOString() } as never)
      .eq("id", upd.id);

    if (error) {
      errors.push(`paid_amount fix ${upd.id}: ${error.message}`);
    } else {
      fixed++;
    }
  }

  return { fixed, errors };
}

// ── Phase 2: Status consistency ─────────────────────────────────────────────

async function phaseStatusConsistency(
  supabase: SupabaseAdmin,
  transactions: TransactionRow[]
): Promise<{ fixed: number; errors: string[] }> {
  let fixed = 0;
  const errors: string[] = [];
  const updates: Array<{ id: string; status: string }> = [];

  for (const tx of transactions) {
    if (!tx.omie_raw) continue;

    const raw = tx.omie_raw;
    const valorDoc = Number(raw.valor_documento || 0);
    const rawPago = Number(raw.valor_pago || raw.valor_recebido || 0);
    const statusOmie = String(raw.status_titulo || "").toLowerCase();

    let correctStatus = tx.status;

    // Rule 1: Has paid_date but status is "previsto" → should be "pago" or "parcial"
    if (tx.paid_date && (tx.status === "previsto" || tx.status === "provisionado")) {
      if (rawPago > 0 && rawPago < valorDoc) {
        correctStatus = "parcial";
      } else {
        correctStatus = "pago";
      }
    }

    // Rule 2: OMIE says liquidado/pago but we have "previsto"
    if ((statusOmie === "liquidado" || statusOmie === "pago" || statusOmie === "recebido") && tx.status === "previsto") {
      if (rawPago > 0 && rawPago < valorDoc) {
        correctStatus = "parcial";
      } else {
        correctStatus = "pago";
      }
    }

    // Rule 3: Past due_date, not paid, not cancelled → "atrasado"
    if (tx.due_date && tx.status === "previsto") {
      const dueDate = new Date(tx.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today && statusOmie !== "cancelado") {
        correctStatus = "atrasado";
      }
    }

    // Rule 4: Cancelled in OMIE but not in our system
    if (statusOmie === "cancelado" && tx.status !== "cancelado") {
      correctStatus = "cancelado";
    }

    if (correctStatus !== tx.status) {
      updates.push({ id: tx.id, status: correctStatus });
    }
  }

  for (const upd of updates) {
    const { error } = await supabase
      .from("finance_transactions")
      .update({ status: upd.status, dq_last_checked_at: new Date().toISOString() } as never)
      .eq("id", upd.id);

    if (error) {
      errors.push(`status fix ${upd.id}: ${error.message}`);
    } else {
      fixed++;
    }
  }

  return { fixed, errors };
}

// ── Phase 3: Resolve missing counterparts ───────────────────────────────────

async function phaseCounterpartResolve(
  supabase: SupabaseAdmin,
  tenantId: string,
  transactions: TransactionRow[]
): Promise<{ fixed: number; errors: string[] }> {
  let fixed = 0;
  const errors: string[] = [];

  // Find transactions missing counterpart
  const missing = transactions.filter((tx) => !tx.counterpart && tx.omie_raw);
  if (!missing.length) return { fixed: 0, errors: [] };

  // Build lookup maps
  const { data: clients } = await supabase
    .from("finance_clients")
    .select("omie_id, name, cnpj")
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null);

  const { data: vendors } = await supabase
    .from("finance_vendors")
    .select("omie_id, name, cnpj")
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null);

  const clientMap = new Map<string, ClientRow>();
  for (const c of (clients ?? []) as unknown as ClientRow[]) {
    clientMap.set(String(c.omie_id), c);
  }

  const vendorMap = new Map<string, VendorRow>();
  for (const v of (vendors ?? []) as unknown as VendorRow[]) {
    vendorMap.set(String(v.omie_id), v);
  }

  for (const tx of missing) {
    const raw = tx.omie_raw!;
    const codCliForn = raw.codigo_cliente_fornecedor ? String(raw.codigo_cliente_fornecedor) : null;

    if (!codCliForn) continue;

    // Try client first, then vendor
    const client = clientMap.get(codCliForn);
    const vendor = vendorMap.get(codCliForn);
    const match = client || vendor;

    if (match) {
      const { error } = await supabase
        .from("finance_transactions")
        .update({
          counterpart: match.name,
          counterpart_doc: match.cnpj || null,
          dq_last_checked_at: new Date().toISOString(),
        } as never)
        .eq("id", tx.id);

      if (error) {
        errors.push(`counterpart ${tx.id}: ${error.message}`);
      } else {
        fixed++;
      }
    }
  }

  return { fixed, errors };
}

// ── Phase 4: Rateio (category distribution) ─────────────────────────────────

async function phaseRateioCategories(
  supabase: SupabaseAdmin,
  tenantId: string,
  transactions: TransactionRow[]
): Promise<{ fixed: number; errors: string[] }> {
  let fixed = 0;
  const errors: string[] = [];

  // Build category lookup
  const { data: categories } = await supabase
    .from("finance_categories")
    .select("id, omie_id")
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null);

  const catMap = new Map<string, string>();
  for (const c of (categories ?? []) as unknown as Array<{ id: string; omie_id: string }>) {
    catMap.set(String(c.omie_id), c.id);
  }

  // Find transactions without category but with categorias array in omie_raw
  const needsCategory = transactions.filter((tx) => !tx.category_id && tx.omie_raw);

  for (const tx of needsCategory) {
    const raw = tx.omie_raw!;

    // OMIE stores category distribution in "categorias" array
    const categorias = raw.categorias as Array<{
      codigo_categoria?: string;
      percentual?: number;
      valor?: number;
    }> | undefined;

    if (!categorias?.length) continue;

    // Pick the category with highest percentage/value (primary)
    let bestCat = categorias[0];
    for (const cat of categorias) {
      const pct = Number(cat.percentual || 0);
      const bestPct = Number(bestCat.percentual || 0);
      if (pct > bestPct) bestCat = cat;
    }

    const catCode = bestCat.codigo_categoria ? String(bestCat.codigo_categoria) : null;
    if (!catCode) continue;

    const categoryId = catMap.get(catCode);
    if (!categoryId) continue;

    const { error } = await supabase
      .from("finance_transactions")
      .update({
        category_id: categoryId,
        omie_categoria_codigo: catCode,
        dq_last_checked_at: new Date().toISOString(),
      } as never)
      .eq("id", tx.id);

    if (error) {
      errors.push(`rateio ${tx.id}: ${error.message}`);
    } else {
      fixed++;
    }
  }

  return { fixed, errors };
}

// ── Phase 5: Heuristic category classification ─────────────────────────────

// Description patterns mapped to category names (from OMIE's own naming convention)
const DESCRIPTION_CATEGORY_PATTERNS: Array<{ pattern: RegExp; categoryName: string }> = [
  // Pessoal / Pró-Labore
  { pattern: /Pessoal\s*-\s*Pr[oóOÓAa][\s-]*Labore/i, categoryName: "Salarios e Encargos" },
  { pattern: /Pessoal\s*-\s*INSS|Pessoal\s*-\s*IRRF/i, categoryName: "Impostos" },

  // Custos - Mão de Obra
  { pattern: /Custos\s*-\s*M[aãAÃ]o\s*de\s*Obra\s*-\s*Freelancer/i, categoryName: "Freelancers" },
  { pattern: /Custos\s*-\s*M[aãAÃ]o\s*de\s*Obra\s*-\s*Fixa/i, categoryName: "Salarios e Encargos" },
  { pattern: /Custos\s*-\s*Comercial/i, categoryName: "Salarios e Encargos" },

  // Impostos
  { pattern: /Impostos\s*-\s*Simples\s*Nacional/i, categoryName: "Impostos" },
  { pattern: /Parcelamentos?\s*de\s*Tributos/i, categoryName: "Impostos" },

  // Financeiro
  { pattern: /Financeira\s*-\s*Tarifas\s*Banc[aáAÁ]rias/i, categoryName: "Infraestrutura" },
  { pattern: /Financiamento\s*-\s*Pagamento\s*de\s*Empr[eéEÉAa]stimo/i, categoryName: "Outros" },
  { pattern: /Investimento\s*-\s*Cons[oóOÓAa]rcios/i, categoryName: "Outros" },

  // Administrativo
  { pattern: /Administrativas?\s*-\s*Sindicatos/i, categoryName: "Infraestrutura" },

  // Serviços Terceiros
  { pattern: /Servi[cçCÇAa]os\s*Terceiros\s*-\s*BPO/i, categoryName: "Software e Ferramentas" },
  { pattern: /Servi[cçCÇAa]os\s*Terceiros\s*-\s*Contabilidade/i, categoryName: "Infraestrutura" },
  { pattern: /Servi[cçCÇAa]os\s*Terceiros\s*-\s*Consultorias/i, categoryName: "Outros" },

  // Outros Custos
  { pattern: /Outros\s*Custos/i, categoryName: "Outros" },

  // Receitas (description-based)
  { pattern: /Clientes\s*-\s*Servi[cçCÇAa]os\s*Prestados/i, categoryName: "Servicos Prestados" },
  { pattern: /Receitas\s*-\s*Brading/i, categoryName: "Servicos Prestados" },
  { pattern: /Receitas\s*-\s*Renderiza[cçCÇAa][aãAÃ]o/i, categoryName: "Servicos Prestados" },
  { pattern: /Receitas\s*-\s*Modelagem\s*3D/i, categoryName: "Servicos Prestados" },
  { pattern: /Receitas\s*-\s*Filme/i, categoryName: "Servicos Prestados" },
  { pattern: /Receitas\s*-\s*Imagem\s*3D/i, categoryName: "Servicos Prestados" },
  { pattern: /Receitas\s*-\s*Landing\s*Page/i, categoryName: "Servicos Prestados" },
  { pattern: /Receitas\s*-\s*Identidade\s*Visual/i, categoryName: "Servicos Prestados" },
  { pattern: /Receitas\s*-\s*Tr[aáAÁ]fego/i, categoryName: "Servicos Prestados" },
  { pattern: /Receitas\s*-\s*Redes\s*Sociais/i, categoryName: "Servicos Prestados" },
  { pattern: /Receitas\s*-\s*Gest[aãAÃ]o/i, categoryName: "Servicos Prestados" },
  { pattern: /Receitas\s*-/i, categoryName: "Servicos Prestados" }, // Catch-all for any "(+) Receitas - ..."

  // Generic "Conta a pagar" — try to infer from counterpart
  { pattern: /^Conta\s+a\s+pagar$/i, categoryName: "__infer_from_counterpart__" },
];

// Counterpart → category inference for generic "Conta a pagar"
const COUNTERPART_CATEGORY_MAP: Array<{ pattern: RegExp; categoryName: string }> = [
  { pattern: /SIMPLES\s*NACIONAL|RECEITA\s*FEDERAL/i, categoryName: "Impostos" },
  { pattern: /INSS|FGTS|IRRF/i, categoryName: "Impostos" },
  { pattern: /BANCO\s*(DO\s*BRASIL|BRADESCO|ITAU|SANTANDER|INTER|CAIXA)/i, categoryName: "Outros" },
];

async function phaseHeuristicClassification(
  supabase: SupabaseAdmin,
  tenantId: string,
  transactions: TransactionRow[]
): Promise<{ fixed: number; errors: string[] }> {
  let fixed = 0;
  const errors: string[] = [];

  // Build category name → id lookup
  const { data: categories } = await supabase
    .from("finance_categories")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .eq("is_active", true);

  const catNameMap = new Map<string, string>();
  for (const c of (categories ?? []) as unknown as Array<{ id: string; name: string }>) {
    catNameMap.set(c.name.toLowerCase(), c.id);
  }

  // Only process transactions without category
  const uncategorized = transactions.filter((tx) => !tx.category_id);

  for (const tx of uncategorized) {
    const desc = tx.description || "";
    let matchedCatName: string | null = null;

    // Try description patterns first
    for (const { pattern, categoryName } of DESCRIPTION_CATEGORY_PATTERNS) {
      if (pattern.test(desc)) {
        if (categoryName === "__infer_from_counterpart__") {
          // Try counterpart-based inference
          const cp = tx.counterpart || "";
          for (const { pattern: cpPattern, categoryName: cpCat } of COUNTERPART_CATEGORY_MAP) {
            if (cpPattern.test(cp)) {
              matchedCatName = cpCat;
              break;
            }
          }
        } else {
          matchedCatName = categoryName;
        }
        break;
      }
    }

    if (!matchedCatName) continue;

    const categoryId = catNameMap.get(matchedCatName.toLowerCase());
    if (!categoryId) continue;

    const newFlags = [...(tx.dq_flags || [])];
    if (!newFlags.includes("heuristic_category")) {
      newFlags.push("heuristic_category");
    }

    const { error } = await supabase
      .from("finance_transactions")
      .update({
        category_id: categoryId,
        dq_flags: newFlags,
        dq_last_checked_at: new Date().toISOString(),
      } as never)
      .eq("id", tx.id);

    if (error) {
      errors.push(`heuristic ${tx.id}: ${error.message}`);
    } else {
      fixed++;
    }
  }

  return { fixed, errors };
}

// ── Phase 6: Reconciliation with bank statements ────────────────────────────

async function phaseReconciliation(
  supabase: SupabaseAdmin,
  tenantId: string,
  transactions: TransactionRow[]
): Promise<{ fixed: number; errors: string[] }> {
  let fixed = 0;
  const errors: string[] = [];

  // Get recent bank statement entries
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: statements } = await supabase
    .from("finance_bank_statements")
    .select("id, date, amount, description, type, document_number")
    .eq("tenant_id", tenantId)
    .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("date", { ascending: false });

  if (!statements?.length) return { fixed: 0, errors: [] };

  const stmtRows = statements as unknown as Array<{
    id: string;
    date: string;
    amount: number;
    description: string | null;
    type: string;
    document_number: string | null;
  }>;

  // Find unpaid transactions (previsto, provisionado, parcial) with matching amounts in bank statements
  const RECONCILABLE_STATUSES = ["previsto", "provisionado", "parcial"];
  const pendingTx = transactions.filter(
    (tx) => RECONCILABLE_STATUSES.includes(tx.status) && tx.date && new Date(tx.date) >= thirtyDaysAgo
  );

  for (const tx of pendingTx) {
    const txAmount = Math.abs(tx.amount);
    const txDate = tx.date;

    // Look for a statement entry matching amount (±1% tolerance) and date (±3 days)
    const match = stmtRows.find((stmt) => {
      const stmtAmount = Math.abs(stmt.amount);
      const amountMatch = Math.abs(stmtAmount - txAmount) / txAmount < 0.01;

      const stmtDate = new Date(stmt.date);
      const txDateObj = new Date(txDate);
      const daysDiff = Math.abs(stmtDate.getTime() - txDateObj.getTime()) / (1000 * 60 * 60 * 24);
      const dateMatch = daysDiff <= 3;

      // Type check: credit = receita, debit = despesa
      const typeMatch =
        (stmt.type === "credit" && tx.type === "receita") ||
        (stmt.type === "debit" && tx.type === "despesa");

      return amountMatch && dateMatch && typeMatch;
    });

    if (match) {
      const newFlags = [...(tx.dq_flags || [])];
      if (!newFlags.includes("reconciled")) {
        newFlags.push("reconciled");
      }

      const { error } = await supabase
        .from("finance_transactions")
        .update({
          status: "pago",
          paid_amount: txAmount,
          paid_date: match.date,
          reconciled_source: "auto",
          dq_flags: newFlags,
          dq_last_checked_at: new Date().toISOString(),
        } as never)
        .eq("id", tx.id);

      if (error) {
        errors.push(`reconcile ${tx.id}: ${error.message}`);
      } else {
        fixed++;
      }
    }
  }

  return { fixed, errors };
}

// ── Phase 6: Anomaly detection ──────────────────────────────────────────────

async function phaseAnomalyDetection(
  supabase: SupabaseAdmin,
  transactions: TransactionRow[]
): Promise<{ fixed: number; errors: string[] }> {
  let fixed = 0;
  const errors: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const tx of transactions) {
    const flags: string[] = [...(tx.dq_flags || []).filter((f) => f !== "reconciled")]; // preserve reconciled
    let changed = false;

    // Anomaly 1: Negative amount
    if (tx.amount < 0) {
      if (!flags.includes("negative_amount")) {
        flags.push("negative_amount");
        changed = true;
      }
    }

    // Anomaly 2: paid_amount > amount * 1.5 (suspicious overpayment)
    if (tx.paid_amount > tx.amount * 1.5 && tx.amount > 0) {
      if (!flags.includes("overpayment")) {
        flags.push("overpayment");
        changed = true;
      }
    }

    // Anomaly 3: Future paid_date (more than 1 day ahead)
    if (tx.paid_date) {
      const paidDate = new Date(tx.paid_date);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (paidDate > tomorrow) {
        if (!flags.includes("future_paid_date")) {
          flags.push("future_paid_date");
          changed = true;
        }
      }
    }

    // Anomaly 4: Very old unpaid (>180 days overdue, still "previsto")
    if (tx.status === "previsto" && tx.due_date) {
      const dueDate = new Date(tx.due_date);
      const daysDiff = (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 180) {
        if (!flags.includes("stale_unpaid")) {
          flags.push("stale_unpaid");
          changed = true;
        }
      }
    }

    // Anomaly 5: Zero amount on non-cancelled
    if (tx.amount === 0 && tx.status !== "cancelado") {
      if (!flags.includes("zero_amount")) {
        flags.push("zero_amount");
        changed = true;
      }
    }

    // Anomaly 6: Missing description
    if (!tx.omie_raw) {
      if (!flags.includes("missing_omie_raw")) {
        flags.push("missing_omie_raw");
        changed = true;
      }
    }

    // Clear old flags that no longer apply
    const cleanedFlags = flags.filter((f) => {
      if (f === "negative_amount" && tx.amount >= 0) return false;
      if (f === "overpayment" && tx.paid_amount <= tx.amount * 1.5) return false;
      if (f === "zero_amount" && (tx.amount !== 0 || tx.status === "cancelado")) return false;
      return true;
    });

    const flagsChanged = JSON.stringify(cleanedFlags.sort()) !== JSON.stringify((tx.dq_flags || []).sort());

    if (changed || flagsChanged) {
      const { error } = await supabase
        .from("finance_transactions")
        .update({
          dq_flags: cleanedFlags,
          dq_last_checked_at: new Date().toISOString(),
        } as never)
        .eq("id", tx.id);

      if (error) {
        errors.push(`anomaly ${tx.id}: ${error.message}`);
      } else {
        fixed++;
      }
    }
  }

  return { fixed, errors };
}

// ── Confidence score calculator ─────────────────────────────────────────────

async function calculateConfidence(
  supabase: SupabaseAdmin,
  tenantId: string,
  anomaliesCount: number
): Promise<number> {
  // Get total transaction count and quality metrics
  const { count: totalCount } = await supabase
    .from("finance_transactions")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null);

  const total = totalCount ?? 0;
  if (total === 0) return 100;

  // Count transactions with issues
  const { count: missingCounterpart } = await supabase
    .from("finance_transactions")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null)
    .is("counterpart", null);

  const { count: missingCategory } = await supabase
    .from("finance_transactions")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null)
    .is("category_id", null);

  const { count: zeroPaid } = await supabase
    .from("finance_transactions")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null)
    .in("status", ["pago", "parcial"])
    .eq("paid_amount", 0);

  const issues =
    (missingCounterpart ?? 0) * 0.5 + // Missing counterpart = 0.5 weight
    (missingCategory ?? 0) * 0.3 +     // Missing category = 0.3 weight
    (zeroPaid ?? 0) * 1.0 +            // Paid with zero amount = 1.0 weight
    anomaliesCount * 0.8;              // Anomalies = 0.8 weight

  const issueRate = issues / total;
  const confidence = Math.max(0, Math.min(100, (1 - issueRate) * 100));

  return Math.round(confidence * 10) / 10;
}
