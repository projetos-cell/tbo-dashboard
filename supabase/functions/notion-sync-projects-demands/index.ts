// ============================================================================
// TBO OS — Edge Function: Notion Sync (Projects & Demands)
//
// Importa BD Projetos e BD Demandas do Notion para Supabase.
// - Pagina ate trazer tudo (Notion API limita a 100 por request)
// - Salva payload bruto em notion_pages_raw (staging)
// - Transforma e faz upsert em projects e demands
// - Resolve vinculo demanda→projeto pela relation "BD Projetos | TBO"
// - Resolve hierarquia item principal/subitem (parent_demand_id)
//
// Trigger: chamada manual via POST /notion-sync-projects-demands
// Segredos necessarios: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NOTION_API_KEY
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY")!;

const NOTION_DB_PROJETOS = "1f3b27ff29e381d9ba39ea23ea3d87e3";
const NOTION_DB_DEMANDAS = "1e5b27ff29e3808aaf3af18ea6c80996";
const NOTION_API_VERSION = "2022-06-28";

// ── Notion API helpers ───────────────────────────────────────────────────────

async function notionRequest(endpoint: string, body?: Record<string, unknown>) {
  const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Authorization": `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": NOTION_API_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion ${res.status}: ${text.slice(0, 500)}`);
  }
  return res.json();
}

/** Pagina automaticamente ate trazer todos os resultados de um database query */
async function fetchAllPages(databaseId: string, filter?: Record<string, unknown>) {
  const allPages: any[] = [];
  let startCursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const body: Record<string, unknown> = { page_size: 100 };
    if (filter) body.filter = filter;
    if (startCursor) body.start_cursor = startCursor;

    const result = await notionRequest(`databases/${databaseId}/query`, body);
    allPages.push(...(result.results || []));
    hasMore = result.has_more;
    startCursor = result.next_cursor;
  }

  return allPages;
}

// ── Property extractors ──────────────────────────────────────────────────────

function getTitle(page: any, prop: string): string {
  return page.properties?.[prop]?.title?.[0]?.plain_text || "";
}

function getSelect(page: any, prop: string): string {
  return page.properties?.[prop]?.select?.name || "";
}

function getMultiSelect(page: any, prop: string): string[] {
  return (page.properties?.[prop]?.multi_select || []).map((s: any) => s.name);
}

function getStatus(page: any, prop: string): string {
  return page.properties?.[prop]?.status?.name || "";
}

function getDateStart(page: any, prop: string): string | null {
  return page.properties?.[prop]?.date?.start || null;
}

function getDateEnd(page: any, prop: string): string | null {
  return page.properties?.[prop]?.date?.end || null;
}

function getRichText(page: any, prop: string): string {
  return (page.properties?.[prop]?.rich_text || [])
    .map((rt: any) => rt.plain_text)
    .join("");
}

function getUrl(page: any, prop: string): string {
  return page.properties?.[prop]?.url || "";
}

function getPeople(page: any, prop: string): { name: string; email: string } | null {
  const person = page.properties?.[prop]?.people?.[0];
  if (!person) return null;
  return {
    name: person.name || "",
    email: person.person?.email || "",
  };
}

function getRelationIds(page: any, prop: string): string[] {
  return (page.properties?.[prop]?.relation || []).map((r: any) => r.id);
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Determinar tenant_id (usa o primeiro tenant existente)
  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("id")
    .limit(1)
    .single();

  const tenantId = tenantRow?.id;
  if (!tenantId) {
    return new Response(JSON.stringify({ error: "Nenhum tenant encontrado" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Criar run de sync
  const { data: syncRun } = await supabase
    .from("notion_sync_runs")
    .insert({ triggered_by: "manual", status: "running" })
    .select("id")
    .single();

  const runId = syncRun?.id;
  const errors: string[] = [];

  try {
    // ════════════════════════════════════════════════════════════════════════
    // PASSO 1: Buscar todos os projetos do Notion
    // ════════════════════════════════════════════════════════════════════════

    console.log("[Sync] Buscando projetos do Notion...");
    const notionProjects = await fetchAllPages(NOTION_DB_PROJETOS);
    console.log(`[Sync] ${notionProjects.length} projetos encontrados`);

    // Salvar staging (bruto)
    for (const page of notionProjects) {
      await supabase.from("notion_pages_raw").upsert(
        {
          notion_page_id: page.id,
          database_id: NOTION_DB_PROJETOS,
          payload: page,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "notion_page_id,database_id" }
      );
    }

    // Transformar e upsert em projects
    // Mapa: notion_page_id -> supabase project id
    const projectNotionToSupabase = new Map<string, string>();

    for (const page of notionProjects) {
      const projectData = {
        notion_page_id: page.id,
        name: getTitle(page, "Nome Projeto") || "(sem nome)",
        construtora: getSelect(page, "Construtora"),
        bus: getMultiSelect(page, "BUs"),
        status: mapProjectStatus(getStatus(page, "Status")),
        due_date_start: getDateStart(page, "Prazo do Projeto"),
        due_date_end: getDateEnd(page, "Prazo do Projeto"),
        notion_url: page.url || "",
        notion_synced_at: new Date().toISOString(),
        tenant_id: tenantId,
      };

      // Upsert por notion_page_id
      const { data: upserted, error: upErr } = await supabase
        .from("projects")
        .upsert(projectData, {
          onConflict: "notion_page_id",
          ignoreDuplicates: false,
        })
        .select("id, notion_page_id")
        .single();

      if (upErr) {
        errors.push(`Project ${page.id}: ${upErr.message}`);
      } else if (upserted) {
        projectNotionToSupabase.set(upserted.notion_page_id, upserted.id);
      }
    }

    console.log(`[Sync] ${projectNotionToSupabase.size} projetos sincronizados`);

    // ════════════════════════════════════════════════════════════════════════
    // PASSO 2: Buscar todas as demandas do Notion
    // ════════════════════════════════════════════════════════════════════════

    console.log("[Sync] Buscando demandas do Notion...");
    const notionDemandas = await fetchAllPages(NOTION_DB_DEMANDAS);
    console.log(`[Sync] ${notionDemandas.length} demandas encontradas`);

    // Salvar staging
    for (const page of notionDemandas) {
      await supabase.from("notion_pages_raw").upsert(
        {
          notion_page_id: page.id,
          database_id: NOTION_DB_DEMANDAS,
          payload: page,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "notion_page_id,database_id" }
      );
    }

    // PASSO 2a: Primeiro upsert — sem parent_demand_id (evitar FK circular)
    const demandNotionToSupabase = new Map<string, string>();
    const parentRelations: Array<{ notionId: string; parentNotionId: string }> = [];

    for (const page of notionDemandas) {
      const person = getPeople(page, "Responsável") || getPeople(page, "Responsavel");
      const projetoRelIds = getRelationIds(page, "BD Projetos | TBO");
      const parentIds = getRelationIds(page, "item principal");

      // Resolver project_id pela relation do Notion
      let projectId: string | null = null;
      if (projetoRelIds.length > 0) {
        projectId = projectNotionToSupabase.get(projetoRelIds[0]) || null;
      }

      // Guardar relacao de parentesco para resolver depois
      if (parentIds.length > 0) {
        parentRelations.push({ notionId: page.id, parentNotionId: parentIds[0] });
      }

      const demandData = {
        notion_page_id: page.id,
        title: getTitle(page, "Demanda") || "(sem titulo)",
        status: getStatus(page, "Status") || "Briefing",
        due_date: getDateStart(page, "Prazo"),
        responsible: person?.name || "",
        responsible_email: person?.email || "",
        bus: getMultiSelect(page, "BUs Envolvidas"),
        priority: getSelect(page, "Prioridade") || null,
        media_type: getMultiSelect(page, "Tipo Midia"),
        info: getRichText(page, "Info"),
        formalization_url: getUrl(page, "Formalizacao") || getUrl(page, "Formalização"),
        notion_url: page.url || "",
        project_id: projectId,
        notion_synced_at: new Date().toISOString(),
        tenant_id: tenantId,
      };

      const { data: upserted, error: upErr } = await supabase
        .from("demands")
        .upsert(demandData, {
          onConflict: "notion_page_id",
          ignoreDuplicates: false,
        })
        .select("id, notion_page_id")
        .single();

      if (upErr) {
        errors.push(`Demand ${page.id}: ${upErr.message}`);
      } else if (upserted) {
        demandNotionToSupabase.set(upserted.notion_page_id, upserted.id);
      }
    }

    console.log(`[Sync] ${demandNotionToSupabase.size} demandas sincronizadas`);

    // PASSO 2b: Resolver hierarquia parent_demand_id
    let parentResolved = 0;
    for (const rel of parentRelations) {
      const childSupabaseId = demandNotionToSupabase.get(rel.notionId);
      const parentSupabaseId = demandNotionToSupabase.get(rel.parentNotionId);

      if (childSupabaseId && parentSupabaseId) {
        const { error: relErr } = await supabase
          .from("demands")
          .update({ parent_demand_id: parentSupabaseId })
          .eq("id", childSupabaseId);

        if (relErr) {
          errors.push(`Parent link ${rel.notionId}: ${relErr.message}`);
        } else {
          parentResolved++;
        }
      }
    }

    console.log(`[Sync] ${parentResolved} relacoes pai/filho resolvidas`);

    // ════════════════════════════════════════════════════════════════════════
    // PASSO 3: Atualizar run log
    // ════════════════════════════════════════════════════════════════════════

    await supabase
      .from("notion_sync_runs")
      .update({
        finished_at: new Date().toISOString(),
        status: errors.length > 0 ? "partial" : "success",
        projects_synced: projectNotionToSupabase.size,
        demands_synced: demandNotionToSupabase.size,
        errors: errors,
      })
      .eq("id", runId);

    return new Response(
      JSON.stringify({
        success: true,
        run_id: runId,
        projects_synced: projectNotionToSupabase.size,
        demands_synced: demandNotionToSupabase.size,
        parent_relations_resolved: parentResolved,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[Sync] Erro fatal:", error);

    // Atualizar run com erro
    if (runId) {
      await supabase
        .from("notion_sync_runs")
        .update({
          finished_at: new Date().toISOString(),
          status: "error",
          errors: [...errors, (error as Error).message],
        })
        .eq("id", runId);
    }

    return new Response(
      JSON.stringify({ error: (error as Error).message, run_id: runId }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Mapeia status do Notion para status padrao do Supabase projects */
function mapProjectStatus(notionStatus: string): string {
  const map: Record<string, string> = {
    "Parado": "parado",
    "Em Andamento": "em_andamento",
    "Concluido": "finalizado",
    "Concluído": "finalizado",
  };
  return map[notionStatus] || notionStatus.toLowerCase().replace(/\s+/g, "_") || "parado";
}
