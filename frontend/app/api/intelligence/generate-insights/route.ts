// ── Intelligence: Generate AI Insights ───────────────────────────────────────
// POST /api/intelligence/generate-insights
// Fetches real data from Supabase, calls Claude, persists insights in agent_insights
// RBAC: lider+ (validated via Bearer token)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

interface GeneratedInsight {
  title: string;
  description: string;
  insight_type: "opportunity" | "risk" | "pattern" | "recommendation" | "anomaly";
  category: "financeiro" | "comercial" | "pessoas" | "projetos" | "okrs";
  confidence: number; // 0-1
}

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Supabase env vars not configured");
  return createClient(url, serviceKey);
}

async function getUser(req: NextRequest): Promise<{ userId: string; tenantId: string; role: string } | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const supabase = supabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

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

const ALLOWED_ROLES = ["founder", "diretoria", "lider", "admin"];

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY não configurado" }, { status: 500 });
    }

    const supabase = supabaseAdmin();
    const today = new Date().toISOString().split("T")[0];

    // ── Coletar dados reais em paralelo ──────────────────────────────────────
    const [tasksRes, dealsRes, okrRes, teamRes, demandsRes] = await Promise.all([
      supabase
        .from("os_tasks")
        .select("id, title, status, is_completed, due_date, priority")
        .neq("status", "cancelada")
        .limit(200),
      supabase
        .from("crm_deals")
        .select("id, name, value, stage, updated_at")
        .not("stage", "in", '("ganho","perdido","cancelado")')
        .limit(100),
      supabase
        .from("okr_key_results")
        .select("id, title, current_value, target_value, start_value")
        .limit(50),
      supabase
        .from("colaboradores")
        .select("id, name, cargo, status")
        .eq("status", "ativo")
        .limit(100),
      supabase
        .from("demands")
        .select("id, title, due_date, feito, status, priority")
        .eq("feito", false)
        .limit(100),
    ]);

    // ── Computar métricas ────────────────────────────────────────────────────
    const tasks = (tasksRes.data ?? []) as Array<{
      id: string; title: string; status: string | null;
      is_completed: boolean | null; due_date: string | null; priority: string | null;
    }>;
    const openTasks = tasks.filter((t) => !t.is_completed);
    const overdueTasks = openTasks.filter((t) => t.due_date && t.due_date < today);
    const highPriorityOverdue = overdueTasks.filter((t) => t.priority === "alta" || t.priority === "urgente");

    const deals = (dealsRes.data ?? []) as Array<{
      id: string; name: string | null; value: number | null;
      stage: string | null; updated_at: string | null;
    }>;
    const cutoff14d = new Date();
    cutoff14d.setDate(cutoff14d.getDate() - 14);
    const stalledDeals = deals.filter(
      (d) => !d.updated_at || new Date(d.updated_at) < cutoff14d
    );
    const pipelineTotal = deals.reduce((s, d) => s + (d.value ?? 0), 0);

    const krs = (okrRes.data ?? []) as Array<{
      id: string; title: string | null;
      current_value: number | null; target_value: number | null; start_value: number | null;
    }>;
    const krProgress = krs.map((kr) => {
      const start = kr.start_value ?? 0;
      const current = kr.current_value ?? 0;
      const target = kr.target_value ?? 1;
      const range = target - start;
      if (range === 0) return current >= target ? 100 : 0;
      return Math.min(100, Math.max(0, ((current - start) / range) * 100));
    });
    const avgOkrProgress = krProgress.length > 0
      ? Math.round(krProgress.reduce((a, b) => a + b, 0) / krProgress.length)
      : 0;
    const krsAtRisk = krs.filter((_, i) => (krProgress[i] ?? 0) < 40);

    const teamCount = (teamRes.data ?? []).length;

    const demands = (demandsRes.data ?? []) as Array<{
      id: string; title: string | null; due_date: string | null;
      feito: boolean | null; status: string | null; priority: string | null;
    }>;
    const overdueDemands = demands.filter((d) => d.due_date && d.due_date < today);

    // ── Montar contexto para o Claude ────────────────────────────────────────
    const formatBRL = (v: number) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

    const contextText = `
## Dados do TBO OS em ${new Date().toLocaleDateString("pt-BR")}

### Tarefas
- Total abertas: ${openTasks.length}
- Atrasadas: ${overdueTasks.length} (${openTasks.length > 0 ? Math.round((overdueTasks.length / openTasks.length) * 100) : 0}%)
- Alta prioridade e atrasadas: ${highPriorityOverdue.length}

### Pipeline Comercial
- Deals ativos: ${deals.length}
- Total pipeline: ${formatBRL(pipelineTotal)}
- Deals parados (+14 dias): ${stalledDeals.length}
- Deals próximos do fechamento: ${deals.filter((d) => d.stage?.toLowerCase().includes("proposta") || d.stage?.toLowerCase().includes("negociacao")).length}

### OKRs
- KRs ativos: ${krs.length}
- Progresso médio: ${avgOkrProgress}%
- KRs em risco (<40%): ${krsAtRisk.length}
${krsAtRisk.slice(0, 3).map((kr) => `  - "${kr.title ?? "KR sem título"}"`).join("\n")}

### Equipe
- Colaboradores ativos: ${teamCount}

### Demandas
- Demandas abertas: ${demands.length}
- Demandas vencidas: ${overdueDemands.length}
`.trim();

    // ── Chamar Claude ────────────────────────────────────────────────────────
    const systemPrompt = `Você é um analista de inteligência empresarial da agência TBO.
Analise os dados operacionais e gere de 4 a 6 insights estratégicos acionáveis.

Retorne APENAS um JSON array válido, sem markdown, sem texto fora do JSON:
[
  {
    "title": "título curto do insight (máx 80 chars)",
    "description": "descrição acionável e específica (máx 200 chars)",
    "insight_type": "opportunity|risk|pattern|recommendation|anomaly",
    "category": "financeiro|comercial|pessoas|projetos|okrs",
    "confidence": 0.0 a 1.0
  }
]

Regras:
- Seja específico com números (ex: "3 deals parados há 14+ dias representam risco de perda")
- Tom executivo, direto
- Pelo menos 1 insight de oportunidade e 1 de risco
- Confidence baseada na robustez dos dados disponíveis`;

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: contextText }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const raw = textBlock && "text" in textBlock ? textBlock.text.trim() : "[]";

    // ── Parse insights ────────────────────────────────────────────────────────
    let insights: GeneratedInsight[] = [];
    try {
      // Strip markdown code fences if present
      const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
      const parsed: unknown = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        insights = parsed as GeneratedInsight[];
      }
    } catch {
      return NextResponse.json({ error: "Claude retornou resposta inválida", raw }, { status: 502 });
    }

    if (insights.length === 0) {
      return NextResponse.json({ error: "Nenhum insight gerado" }, { status: 502 });
    }

    // ── Desativar insights antigos e inserir novos ────────────────────────────
    await supabase
      .from("agent_insights")
      .update({ is_active: false } as never)
      .eq("agent_name" as never, "intelligence-analyst" as never);

    const rows = insights.map((insight) => ({
      title: insight.title,
      description: insight.description,
      insight_type: insight.insight_type,
      category: insight.category,
      confidence: Math.min(1, Math.max(0, insight.confidence)),
      agent_name: "intelligence-analyst",
      source_bu: "TBO OS",
      source_cluster: "auto-generated",
      is_active: true,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("agent_insights")
      .insert(rows as never)
      .select("id, title, description, insight_type, category, confidence, agent_name, source_bu, created_at");

    if (insertError) throw insertError;

    return NextResponse.json({
      insights: inserted ?? [],
      count: (inserted ?? []).length,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno do servidor";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
