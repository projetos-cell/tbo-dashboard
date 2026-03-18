import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ── Types ────────────────────────────────────────────────────────────────────────

interface RdDeal {
  id: string;
  name: string;
  amount_total?: number;
  deal_pipeline_id?: string;
  deal_stage?: { id: string; name: string };
  organization?: { id: string; name: string } | null;
  contacts?: Array<{
    id: string;
    name: string;
    emails?: Array<{ email: string }>;
    phones?: Array<{ phone: string }>;
  }>;
  user?: { id: string; name: string } | null;
  win?: boolean;
  closed_at?: string;
  created_at?: string;
  updated_at?: string;
  prediction_date?: string;
  campaign?: { id: string; name: string } | null;
  deal_source?: { id: string; name: string } | null;
  rating?: number;
  custom_fields?: Record<string, unknown>;
}

interface RdPipelineStage {
  id: string;
  name: string;
}

interface RdPipeline {
  _id?: string;
  id: string;
  name: string;
  stages?: RdPipelineStage[];
}

interface StageRow {
  id: string;
  label: string;
  sort_order: number;
}

// ── RD Station API helper ────────────────────────────────────────────────────────

const RD_BASE = "https://crm.rdstation.com/api/v1";

async function rdFetchAll<T>(
  endpoint: string,
  token: string,
  limit = 200,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let hasMore = true;
  const MAX_RETRIES = 3;

  while (hasMore) {
    const sep = endpoint.includes("?") ? "&" : "?";
    const url = `${RD_BASE}${endpoint}${sep}token=${token}&page=${page}&limit=${limit}`;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const body = await res.json();

        let items: T[];
        if (Array.isArray(body)) {
          items = body;
        } else {
          const key = Object.keys(body).find((k) => Array.isArray(body[k]));
          items = key ? body[key] : [];
        }

        if (items.length === 0) {
          hasMore = false;
        } else {
          all.push(...items);
          page++;
          if (all.length >= 5000) hasMore = false;
        }

        lastError = null;
        break;
      }

      if (res.status === 429) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        await new Promise((r) => setTimeout(r, delay));
        lastError = new Error(
          `RD Station rate limited (429) after ${MAX_RETRIES} retries`,
        );
        continue;
      }

      // Non-retryable error
      hasMore = false;
      lastError = null;
      break;
    }

    if (lastError) throw lastError;
  }

  return all;
}

// ── Stage mapping (fallback for deals without proper RD stage) ───────────────────

const RD_STAGE_MAP: Record<string, string> = {
  // Lead / Prospecção
  prospecção: "lead",
  prospeccao: "lead",
  prospecting: "lead",
  "contato inicial": "lead",
  "initial contact": "lead",
  lead: "lead",
  // Qualificação
  qualificação: "qualificacao",
  qualificacao: "qualificacao",
  qualification: "qualificacao",
  // Proposta (inclui stages reais do RD Station TBO)
  proposta: "proposta",
  proposal: "proposta",
  "proposta em aberto": "proposta",
  "propostas em aberto": "proposta",
  apresentação: "proposta",
  apresentacao: "proposta",
  // Reunião
  reunião: "qualificacao",
  reuniao: "qualificacao",
  meeting: "qualificacao",
  // Qualificados
  qualificados: "qualificacao",
  qualified: "qualificacao",
  // Negociação
  negociação: "negociacao",
  negociacao: "negociacao",
  negotiation: "negociacao",
  fechamento: "negociacao",
  closing: "negociacao",
  // Ganho (inclui stages reais do RD Station TBO)
  ganho: "fechado_ganho",
  won: "fechado_ganho",
  "fechado ganho": "fechado_ganho",
  vendas: "fechado_ganho",
  venda: "fechado_ganho",
  vendido: "fechado_ganho",
  vendida: "fechado_ganho",
  "venda realizada": "fechado_ganho",
  "contrato assinado": "fechado_ganho",
  "contrato fechado": "fechado_ganho",
  "negócio fechado": "fechado_ganho",
  "negocio fechado": "fechado_ganho",
  aprovado: "fechado_ganho",
  converted: "fechado_ganho",
  closed: "fechado_ganho",
  // Perdido (inclui stages reais do RD Station TBO)
  perdido: "fechado_perdido",
  perdida: "fechado_perdido",
  lost: "fechado_perdido",
  "fechado perdido": "fechado_perdido",
  "propostas perdidas": "fechado_perdido",
  "proposta perdida": "fechado_perdido",
  descartado: "fechado_perdido",
  cancelado: "fechado_perdido",
  arquivado: "fechado_perdido",
};

// Keywords que indicam ganho/perda pelo nome do stage (fuzzy)
const WON_KEYWORDS = [
  "ganho", "won", "venda", "vendas", "vendido", "vendida",
  "assinado", "aprovado", "converted", "closed",
];
const LOST_KEYWORDS = [
  "perdido", "perdida", "perdidas", "lost",
  "descartado", "cancelado", "arquivado",
];

function inferWonLostFromStageName(
  stageName: string | undefined,
): "won" | "lost" | null {
  if (!stageName) return null;
  const n = stageName.toLowerCase().trim();

  // Perdido checks first (mais específico — "fechado perdido" deve ser perdido, não ganho)
  if (LOST_KEYWORDS.some((k) => n.includes(k))) return "lost";
  if (WON_KEYWORDS.some((k) => n.includes(k))) return "won";

  return null;
}

function mapRdStage(
  rdStageName: string | undefined,
  stages: StageRow[],
  isWon: boolean,
  isClosed: boolean,
): string {
  // 1. Flags explícitas do RD (win/closed_at)
  if (isWon) {
    return stages.find((s) => s.id === "fechado_ganho")?.id ?? "fechado_ganho";
  }
  if (isClosed) {
    return (
      stages.find((s) => s.id === "fechado_perdido")?.id ?? "fechado_perdido"
    );
  }

  // 2. Inferir ganho/perda pelo nome do stage (caso win/closed_at não venham)
  const inferred = inferWonLostFromStageName(rdStageName);
  if (inferred === "won") {
    return stages.find((s) => s.id === "fechado_ganho")?.id ?? "fechado_ganho";
  }
  if (inferred === "lost") {
    return stages.find((s) => s.id === "fechado_perdido")?.id ?? "fechado_perdido";
  }

  if (!rdStageName) {
    return stages[0]?.id ?? "lead";
  }

  const normalized = rdStageName.toLowerCase().trim();

  // 3. Match direto no id
  const directMatch = stages.find((s) => s.id === normalized);
  if (directMatch) return directMatch.id;

  // 4. Match pelo label
  const labelMatch = stages.find(
    (s) => s.label.toLowerCase() === normalized,
  );
  if (labelMatch) return labelMatch.id;

  // 5. Lookup no mapa estático
  const mapped = RD_STAGE_MAP[normalized];
  if (mapped) {
    const stageMatch = stages.find((s) => s.id === mapped);
    if (stageMatch) return stageMatch.id;
    // Se o mapped stage não existir na tabela crm_stages, retornar o mapped diretamente
    return mapped;
  }

  // 6. Fuzzy match
  const fuzzy = stages.find(
    (s) =>
      s.label.toLowerCase().includes(normalized) ||
      normalized.includes(s.label.toLowerCase()),
  );
  if (fuzzy) return fuzzy.id;

  // 7. Fallback — primeiro stage não-fechado, ou "lead"
  return (
    stages.find((s) => !s.id.startsWith("fechado"))?.id ??
    stages[0]?.id ??
    "lead"
  );
}

// ── POST Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const db = await createClient();

    const {
      data: { user },
      error: authErr,
    } = await db.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const tenantId = body.tenant_id;

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenant_id required" },
        { status: 400 },
      );
    }

    // 1. Load RD config
    const { data: rdConfigRaw } = await db
      .from("rd_config" as never)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("enabled", true)
      .maybeSingle();

    const rdConfig = rdConfigRaw as {
      api_token: string;
      enabled: boolean;
    } | null;

    if (!rdConfig?.api_token) {
      return NextResponse.json(
        { error: "RD Station não configurado ou desabilitado" },
        { status: 400 },
      );
    }

    // 2. Create sync log entry
    const { data: syncLog, error: syncLogErr } = await db
      .from("rd_sync_log" as never)
      .insert({
        tenant_id: tenantId,
        status: "running",
        triggered_by: user.id,
        trigger_source: "manual_comercial",
        deals_synced: 0,
        contacts_synced: 0,
        organizations_synced: 0,
        errors: [],
      } as never)
      .select()
      .single();

    if (syncLogErr) {
      return NextResponse.json(
        { error: `Sync log: ${syncLogErr.message}` },
        { status: 500 },
      );
    }

    const syncId = (syncLog as Record<string, unknown>).id as string;

    // 3. Fetch pipelines from RD Station (with stages)
    const token = rdConfig.api_token;
    const pipelineMap = new Map<
      string,
      { name: string; stages: RdPipelineStage[] }
    >();
    let rdPipelines: RdPipeline[] = [];

    try {
      rdPipelines = await rdFetchAll<RdPipeline>("/deal_pipelines", token);
      for (const p of rdPipelines) {
        const pid = p._id ?? p.id;
        pipelineMap.set(pid, {
          name: p.name,
          stages: p.stages ?? [],
        });
      }
    } catch {
      // Non-fatal: pipeline names/stages won't be mapped but deals still sync
    }

    // 3b. Upsert pipelines into rd_pipelines table
    for (const p of rdPipelines) {
      const pid = p._id ?? p.id;
      const pipelineStages = (p.stages ?? []).map((s, idx) => ({
        id: s.id,
        name: s.name,
        order: idx,
      }));

      await db
        .from("rd_pipelines" as never)
        .upsert(
          {
            tenant_id: tenantId,
            rd_pipeline_id: pid,
            name: p.name,
            stages: pipelineStages,
            updated_at: new Date().toISOString(),
          } as never,
          { onConflict: "tenant_id,rd_pipeline_id" },
        );
    }

    // 4. Fetch deals from RD Station
    let rdDeals: RdDeal[] = [];

    try {
      rdDeals = await rdFetchAll<RdDeal>("/deals", token);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "RD Station fetch failed";
      await db
        .from("rd_sync_log" as never)
        .update({
          status: "error",
          errors: [msg],
          finished_at: new Date().toISOString(),
        } as never)
        .eq("id", syncId);
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    // 5. Load our stages for fallback mapping
    const { data: stages } = await db
      .from("crm_stages")
      .select("id, label, sort_order")
      .order("sort_order");

    const stageList = (stages ?? []) as StageRow[];

    // 6. Pre-fetch existing deals in one query (eliminates N+1)
    const rdDealIds = rdDeals.map((d) => d.id);
    const { data: existingDeals } = await db
      .from("crm_deals")
      .select("id, rd_deal_id")
      .eq("tenant_id", tenantId)
      .in("rd_deal_id", rdDealIds);

    const existingMap = new Map(
      (existingDeals ?? []).map((d) => [d.rd_deal_id, d.id]),
    );

    // 7. Count deals per pipeline for stats
    const pipelineDealCounts = new Map<string, number>();

    // 8. Build insert / update batches
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    const toInsert: Record<string, unknown>[] = [];
    const toUpdate: { dbId: string; data: Record<string, unknown> }[] = [];

    for (const rd of rdDeals) {
      try {
        const isClosed = !!rd.closed_at;
        // RD Station pode enviar win como boolean, string "true", ou number 1
        const rawWin: unknown = rd.win;
        const isWon = Boolean(
          rawWin === true
          || String(rawWin) === "true"
          || rawWin === 1
          || (isClosed && rd.deal_stage?.name
            && inferWonLostFromStageName(rd.deal_stage.name) === "won"),
        );

        const stage = mapRdStage(
          rd.deal_stage?.name,
          stageList,
          isWon,
          isClosed && !isWon,
        );

        const contact = rd.contacts?.[0];
        const contactEmail = contact?.emails?.[0]?.email ?? null;
        const contactPhone = contact?.phones?.[0]?.phone ?? null;

        const rdPipelineId = rd.deal_pipeline_id ?? null;
        const pipelineInfo = rdPipelineId
          ? pipelineMap.get(rdPipelineId)
          : null;
        const rdPipelineName = pipelineInfo?.name ?? null;

        // Store original RD stage info
        const rdStageId = rd.deal_stage?.id ?? null;
        const rdStageName = rd.deal_stage?.name ?? null;

        const rdUserId = rd.user
          ? ((rd.user as Record<string, unknown>)._id as string ??
            (rd.user as Record<string, unknown>).id as string ??
            null)
          : null;

        // Track pipeline deal counts
        if (rdPipelineId) {
          pipelineDealCounts.set(
            rdPipelineId,
            (pipelineDealCounts.get(rdPipelineId) ?? 0) + 1,
          );
        }

        const dealData: Record<string, unknown> = {
          tenant_id: tenantId,
          name: rd.name,
          company: rd.organization?.name ?? null,
          contact: contact?.name ?? null,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          stage,
          value: rd.amount_total ?? null,
          probability: isWon
            ? 100
            : isClosed
              ? 0
              : rd.rating
                ? rd.rating * 20
                : null,
          owner_name: rd.user?.name ?? null,
          source: "rdstation",
          rd_deal_id: rd.id,
          rd_pipeline_id: rdPipelineId,
          rd_pipeline_name: rdPipelineName,
          rd_stage_id: rdStageId,
          rd_stage_name: rdStageName,
          rd_user_id: rdUserId,
          expected_close: rd.prediction_date ?? null,
          updated_at: new Date().toISOString(),
        };

        const existingId = existingMap.get(rd.id);

        if (existingId) {
          const { tenant_id: _, ...updates } = dealData;
          toUpdate.push({ dbId: existingId, data: updates });
        } else {
          toInsert.push(dealData);
        }
      } catch (err) {
        results.errors.push(
          `Deal "${rd.name}": ${err instanceof Error ? err.message : "unknown"}`,
        );
      }
    }

    // 9. Batch insert new deals
    if (toInsert.length > 0) {
      const BATCH_SIZE = 100;
      for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
        const batch = toInsert.slice(i, i + BATCH_SIZE);
        const { error: insertErr } = await db
          .from("crm_deals")
          .insert(batch as never);
        if (insertErr) {
          results.errors.push(`Batch insert: ${insertErr.message}`);
        } else {
          results.created += batch.length;
        }
      }
    }

    // 10. Batch update existing deals
    for (const item of toUpdate) {
      const { error: updateErr } = await db
        .from("crm_deals")
        .update(item.data as never)
        .eq("id", item.dbId);
      if (updateErr) {
        results.errors.push(`Update ${item.dbId}: ${updateErr.message}`);
      } else {
        results.updated++;
      }
    }

    // 11. Update pipeline deal counts
    for (const [pid, count] of pipelineDealCounts) {
      await db
        .from("rd_pipelines" as never)
        .update({ deal_count: count, updated_at: new Date().toISOString() } as never)
        .eq("tenant_id", tenantId)
        .eq("rd_pipeline_id", pid);
    }

    // 12. Update sync log
    await db
      .from("rd_sync_log" as never)
      .update({
        status: results.errors.length > 0 ? "error" : "success",
        deals_synced: results.created + results.updated,
        errors: results.errors.length > 0 ? results.errors : [],
        finished_at: new Date().toISOString(),
      } as never)
      .eq("id", syncId);

    // 13. Update rd_config.last_sync
    await db
      .from("rd_config" as never)
      .update({ last_sync: new Date().toISOString() } as never)
      .eq("tenant_id", tenantId);

    return NextResponse.json({
      success: true,
      deals_total: rdDeals.length,
      created: results.created,
      updated: results.updated,
      pipelines_synced: rdPipelines.length,
      errors: results.errors,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
