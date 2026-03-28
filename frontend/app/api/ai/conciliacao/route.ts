// ── AI Conciliação API Route ─────────────────────────────────────────────────
// POST /api/ai/conciliacao
// Actions: analyze (F1), categorize (F2), anomalies (F3), summary (F5)
// RBAC: admin+ (validated via Supabase session)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  SYSTEM_PROMPT,
  buildMatchPrompt,
  buildCategorizePrompt,
  buildAnomalyPrompt,
  buildSummaryPrompt,
  parseAIResponse,
  computeInputHash,
  AIMatchResponseSchema,
  AICategorizeResponseSchema,
  AIAnomalyResponseSchema,
  AISummaryResponseSchema,
  type AIMatchResponse,
  type AICategorizeResponse,
  type AIAnomalyResponse,
  type AISummaryResponse,
} from "@/features/financeiro/services/ai-reconciliation";

// ── Request schemas ──────────────────────────────────────────────────────────

const AnalyzeRequestSchema = z.object({
  action: z.literal("analyze"),
  unmatchedBankTxs: z.array(z.object({
    id: z.string(),
    tenant_id: z.string(),
    bank_account_id: z.string(),
    transaction_date: z.string(),
    amount: z.number(),
    type: z.enum(["credit", "debit"]),
    description: z.string(),
    category: z.string().nullable().optional(),
    reference_id: z.string().nullable().optional(),
    ofx_id: z.string().nullable().optional(),
    reconciled: z.boolean(),
    reconciled_at: z.string().nullable().optional(),
    reconciled_by: z.string().nullable().optional(),
    finance_tx_id: z.string().nullable().optional(),
    created_at: z.string(),
  })),
  availableFinanceTxs: z.array(z.object({
    id: z.string(),
    tenant_id: z.string(),
    type: z.enum(["receita", "despesa", "transferencia"]),
    status: z.string(),
    description: z.string(),
    notes: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    amount: z.number(),
    paid_amount: z.number(),
    date: z.string(),
    due_date: z.string().nullable().optional(),
    paid_date: z.string().nullable().optional(),
    category_id: z.string().nullable().optional(),
    cost_center_id: z.string().nullable().optional(),
    project_id: z.string().nullable().optional(),
    counterpart: z.string().nullable().optional(),
    counterpart_doc: z.string().nullable().optional(),
    payment_method: z.string().nullable().optional(),
    bank_account: z.string().nullable().optional(),
    omie_id: z.string().nullable().optional(),
    omie_synced_at: z.string().nullable().optional(),
    business_unit: z.string().nullable().optional(),
    responsible_id: z.string().nullable().optional(),
    omie_raw: z.unknown().nullable().optional(),
    recurring_rule_id: z.string().nullable().optional(),
    contract_id: z.string().nullable().optional(),
    created_by: z.string().nullable().optional(),
    updated_by: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
  })),
});

const CategorizeRequestSchema = z.object({
  action: z.literal("categorize"),
  bankTxs: z.array(z.object({
    id: z.string(),
    tenant_id: z.string(),
    bank_account_id: z.string(),
    transaction_date: z.string(),
    amount: z.number(),
    type: z.enum(["credit", "debit"]),
    description: z.string(),
    category: z.string().nullable().optional(),
    reference_id: z.string().nullable().optional(),
    ofx_id: z.string().nullable().optional(),
    reconciled: z.boolean(),
    reconciled_at: z.string().nullable().optional(),
    reconciled_by: z.string().nullable().optional(),
    finance_tx_id: z.string().nullable().optional(),
    created_at: z.string(),
  })),
  availableCategories: z.array(z.string()),
  availableCostCenters: z.array(z.string()),
});

const AnomalyRequestSchema = z.object({
  action: z.literal("anomalies"),
  bankTxs: z.array(z.record(z.string(), z.unknown())),
  financeTxs: z.array(z.record(z.string(), z.unknown())),
  reconciledCount: z.number(),
  pendingCount: z.number(),
  totalCredit: z.number(),
  totalDebit: z.number(),
});

const SummaryRequestSchema = z.object({
  action: z.literal("summary"),
  periodLabel: z.string(),
  totalReceitas: z.number(),
  totalDespesas: z.number(),
  saldo: z.number(),
  reconciledPct: z.number(),
  pendingCount: z.number(),
  overdueCount: z.number(),
  overdueAmount: z.number(),
  topCategories: z.array(z.object({ name: z.string(), total: z.number() })),
  topCounterparts: z.array(z.object({ name: z.string(), total: z.number() })),
  recentTxs: z.array(z.object({
    description: z.string(),
    amount: z.number(),
    type: z.string(),
    date: z.string(),
  })),
});

const RequestSchema = z.discriminatedUnion("action", [
  AnalyzeRequestSchema,
  CategorizeRequestSchema,
  AnomalyRequestSchema,
  SummaryRequestSchema,
]);

// ── Helpers ──────────────────────────────────────────────────────────────────

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Supabase env vars not configured");
  return createClient(url, serviceKey);
}

async function getUserFromRequest(req: NextRequest): Promise<{ userId: string; tenantId: string; role: string } | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const supabase = supabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  // Get tenant + role from user metadata or tenant_members table
  const { data: membership } = await supabase
    .from("tenant_members")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) return null;

  return {
    userId: user.id,
    tenantId: membership.tenant_id as string,
    role: membership.role as string,
  };
}

const ALLOWED_ROLES = ["admin"];

async function checkCachedSuggestion(
  tenantId: string,
  type: string,
  inputHash: string
): Promise<unknown | null> {
  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("finance_ai_suggestions")
    .select("suggestion_json, created_at")
    .eq("tenant_id", tenantId)
    .eq("type", type)
    .eq("input_hash", inputHash)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;

  // Check if cache is still fresh (< 24h)
  const age = Date.now() - new Date(data.created_at as string).getTime();
  if (age > 24 * 60 * 60 * 1000) return null;

  return data.suggestion_json;
}

async function saveSuggestion(
  tenantId: string,
  type: string,
  inputHash: string,
  contextJson: Record<string, unknown>,
  suggestionJson: Record<string, unknown>,
  confidence: number,
  reasoning: string,
  model: string,
  tokensUsed: number,
  latencyMs: number
): Promise<void> {
  const supabase = supabaseAdmin();
  await supabase.from("finance_ai_suggestions").upsert(
    {
      tenant_id: tenantId,
      type,
      input_hash: inputHash,
      context_json: contextJson,
      suggestion_json: suggestionJson,
      confidence,
      reasoning,
      status: "pending",
      model_used: model,
      tokens_used: tokensUsed,
      latency_ms: latencyMs,
    } as never,
    { onConflict: "tenant_id,type,input_hash" }
  );
}

// ── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // ── Auth check ──────────────────────────────────────────────────────
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // ── API key check ───────────────────────────────────────────────────
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    // ── Parse request ───────────────────────────────────────────────────
    const rawBody: unknown = await request.json();
    const parseResult = RequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Payload inválido", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const body = parseResult.data;
    const model = "claude-haiku-4-5-20251001";

    // ── Route to action ─────────────────────────────────────────────────

    if (body.action === "analyze") {
      return await handleAnalyze(body, user, apiKey, model, startTime);
    }

    if (body.action === "categorize") {
      return await handleCategorize(body, user, apiKey, model, startTime);
    }

    if (body.action === "anomalies") {
      return await handleAnomalies(body, user, apiKey, model, startTime);
    }

    if (body.action === "summary") {
      return await handleSummary(body, user, apiKey, "claude-sonnet-4-6-20250514", startTime);
    }

    return NextResponse.json({ error: "Ação desconhecida" }, { status: 400 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro interno do servidor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// ── Action: analyze (F1) ─────────────────────────────────────────────────────

async function handleAnalyze(
  body: z.infer<typeof AnalyzeRequestSchema>,
  user: { userId: string; tenantId: string },
  apiKey: string,
  model: string,
  startTime: number
): Promise<NextResponse> {
  const { unmatchedBankTxs, availableFinanceTxs } = body;

  if (unmatchedBankTxs.length === 0) {
    return NextResponse.json({
      matches: [],
      insights: "Nenhuma transação sem match para analisar.",
      cached: false,
    });
  }

  // ── Check cache ─────────────────────────────────────────────────────
  const inputHash = computeInputHash(unmatchedBankTxs.map((t) => t.id));
  const cached = await checkCachedSuggestion(user.tenantId, "match", inputHash);
  if (cached) {
    return NextResponse.json({ ...(cached as Record<string, unknown>), cached: true });
  }

  // ── Call Claude ─────────────────────────────────────────────────────
  const prompt = buildMatchPrompt(
    unmatchedBankTxs as unknown as import("@/lib/supabase/types/bank-reconciliation").BankTransaction[],
    availableFinanceTxs as unknown as import("@/features/financeiro/services/finance-types").FinanceTransaction[]
  );
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";
  const tokensUsed = (message.usage?.input_tokens ?? 0) + (message.usage?.output_tokens ?? 0);
  const latencyMs = Date.now() - startTime;

  // ── Parse response ────────────────────────────────────────────────
  const parsed = parseAIResponse<AIMatchResponse>(raw, AIMatchResponseSchema);

  if (!parsed.ok) {
    return NextResponse.json(
      { error: "AI retornou resposta inválida", detail: parsed.error },
      { status: 502 }
    );
  }

  const result = parsed.data;
  const avgConfidence =
    result.matches.length > 0
      ? result.matches.reduce((sum, m) => sum + m.confidence, 0) / result.matches.length
      : 0;

  // ── Persist suggestion ────────────────────────────────────────────
  await saveSuggestion(
    user.tenantId,
    "match",
    inputHash,
    { bankTxIds: unmatchedBankTxs.map((t) => t.id) },
    result as unknown as Record<string, unknown>,
    avgConfidence,
    result.insights ?? "",
    model,
    tokensUsed,
    latencyMs
  ).catch(() => {
    // Non-blocking — don't fail the request if audit save fails
  });

  return NextResponse.json({
    ...result,
    cached: false,
    meta: { model, tokensUsed, latencyMs },
  });
}

// ── Action: categorize (F2) ──────────────────────────────────────────────────

async function handleCategorize(
  body: z.infer<typeof CategorizeRequestSchema>,
  user: { userId: string; tenantId: string },
  apiKey: string,
  model: string,
  startTime: number
): Promise<NextResponse> {
  const { bankTxs, availableCategories, availableCostCenters } = body;

  if (bankTxs.length === 0) {
    return NextResponse.json({
      categorizations: [],
      cached: false,
    });
  }

  // ── Check cache ─────────────────────────────────────────────────────
  const inputHash = computeInputHash(bankTxs.map((t) => t.id));
  const cached = await checkCachedSuggestion(user.tenantId, "categorize", inputHash);
  if (cached) {
    return NextResponse.json({ ...(cached as Record<string, unknown>), cached: true });
  }

  // ── Call Claude ─────────────────────────────────────────────────────
  const prompt = buildCategorizePrompt(
    bankTxs as unknown as import("@/lib/supabase/types/bank-reconciliation").BankTransaction[],
    availableCategories,
    availableCostCenters
  );
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";
  const tokensUsed = (message.usage?.input_tokens ?? 0) + (message.usage?.output_tokens ?? 0);
  const latencyMs = Date.now() - startTime;

  // ── Parse response ────────────────────────────────────────────────
  const parsed = parseAIResponse<AICategorizeResponse>(raw, AICategorizeResponseSchema);

  if (!parsed.ok) {
    return NextResponse.json(
      { error: "AI retornou resposta inválida", detail: parsed.error },
      { status: 502 }
    );
  }

  const result = parsed.data;
  const avgConfidence =
    result.categorizations.length > 0
      ? result.categorizations.reduce((sum, c) => sum + c.confidence, 0) / result.categorizations.length
      : 0;

  // ── Persist suggestion ────────────────────────────────────────────
  await saveSuggestion(
    user.tenantId,
    "categorize",
    inputHash,
    { bankTxIds: bankTxs.map((t) => t.id) },
    result as unknown as Record<string, unknown>,
    avgConfidence,
    "",
    model,
    tokensUsed,
    latencyMs
  ).catch(() => {
    // Non-blocking
  });

  return NextResponse.json({
    ...result,
    cached: false,
    meta: { model, tokensUsed, latencyMs },
  });
}

// ── Action: anomalies (F3) ──────────────────────────────────────────────────

async function handleAnomalies(
  body: z.infer<typeof AnomalyRequestSchema>,
  user: { userId: string; tenantId: string },
  apiKey: string,
  model: string,
  startTime: number
): Promise<NextResponse> {
  const { bankTxs, financeTxs, reconciledCount, pendingCount, totalCredit, totalDebit } = body;

  const inputHash = computeInputHash([
    ...bankTxs.map((t) => (t as Record<string, string>).id ?? ""),
    `rc${reconciledCount}`,
  ]);
  const cached = await checkCachedSuggestion(user.tenantId, "anomaly", inputHash);
  if (cached) {
    return NextResponse.json({ ...(cached as Record<string, unknown>), cached: true });
  }

  type BankTx = import("@/lib/supabase/types/bank-reconciliation").BankTransaction;
  type FinTx = import("@/features/financeiro/services/finance-types").FinanceTransaction;

  const prompt = buildAnomalyPrompt({
    bankTxs: bankTxs as unknown as BankTx[],
    financeTxs: financeTxs as unknown as FinTx[],
    reconciledCount,
    pendingCount,
    totalCredit,
    totalDebit,
  });

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";
  const tokensUsed = (message.usage?.input_tokens ?? 0) + (message.usage?.output_tokens ?? 0);
  const latencyMs = Date.now() - startTime;

  const parsed = parseAIResponse<AIAnomalyResponse>(raw, AIAnomalyResponseSchema);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "AI retornou resposta inválida", detail: parsed.error },
      { status: 502 }
    );
  }

  const result = parsed.data;

  await saveSuggestion(
    user.tenantId,
    "anomaly",
    inputHash,
    { bankTxCount: bankTxs.length, financeTxCount: financeTxs.length },
    result as unknown as Record<string, unknown>,
    result.healthScore,
    result.summary,
    model,
    tokensUsed,
    latencyMs
  ).catch(() => {});

  return NextResponse.json({
    ...result,
    cached: false,
    meta: { model, tokensUsed, latencyMs },
  });
}

// ── Action: summary (F5) ────────────────────────────────────────────────────

async function handleSummary(
  body: z.infer<typeof SummaryRequestSchema>,
  user: { userId: string; tenantId: string },
  apiKey: string,
  model: string,
  startTime: number
): Promise<NextResponse> {
  const inputHash = computeInputHash([
    body.periodLabel,
    `r${body.totalReceitas.toFixed(0)}`,
    `d${body.totalDespesas.toFixed(0)}`,
  ]);
  const cached = await checkCachedSuggestion(user.tenantId, "summary", inputHash);
  if (cached) {
    return NextResponse.json({ ...(cached as Record<string, unknown>), cached: true });
  }

  const prompt = buildSummaryPrompt(body);
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";
  const tokensUsed = (message.usage?.input_tokens ?? 0) + (message.usage?.output_tokens ?? 0);
  const latencyMs = Date.now() - startTime;

  const parsed = parseAIResponse<AISummaryResponse>(raw, AISummaryResponseSchema);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "AI retornou resposta inválida", detail: parsed.error },
      { status: 502 }
    );
  }

  const result = parsed.data;

  await saveSuggestion(
    user.tenantId,
    "summary",
    inputHash,
    { periodLabel: body.periodLabel },
    result as unknown as Record<string, unknown>,
    result.metricas.conciliacaoPct,
    result.diagnostico.slice(0, 200),
    model,
    tokensUsed,
    latencyMs
  ).catch(() => {});

  return NextResponse.json({
    ...result,
    cached: false,
    meta: { model, tokensUsed, latencyMs },
  });
}
