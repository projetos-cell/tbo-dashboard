// ============================================================================
// TBO OS — Edge Function: Notion Sync
// Pulls demand properties and comments from Notion → upserts into Supabase
// Modes: "properties" | "comments"
// Auth: Notion token passed via x-notion-token header (not stored)
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

// Default Notion database ID for TBO demands
const DEFAULT_DATABASE_ID = "1e5b27ff29e3808aaf3af18ea6c80996";
const TENANT_ID = "89080d1a-bc79-4c3f-8fce-20aabc561c0d";

// ── Notion user → Supabase profile name mapping ────────────────────────────
// Notion "people" property returns user names; we match them to our `responsible` text field
const NOTION_USER_MAP: Record<string, string> = {
  "Marco Andolfato": "Marco",
  "Marco": "Marco",
  "Celso Fernando": "Celso Fernando",
  "Celso Fernando dos S. Rodrigues": "Celso Fernando",
  "Eduarda Anad": "Eduarda Anad",
  "Eduarda Monique Anad": "Eduarda Anad",
  "Gustavo Bientinezi": "Gustavo Bientinezi",
  "Lucca": "Lucca Nonato",
  "Lucca Nonato": "Lucca Nonato",
  "Nathália Runge": "Nathália Runge",
  "Nathalia Runge": "Nathália Runge",
  "Nathália Runge Martins Rodrigues": "Nathália Runge",
  "Nelson Mozart": "Nelson Mozart",
  "Nelson Mozart Weigang Neto": "Nelson Mozart",
  "Rafa": "Rafaela Oltramari",
  "Rafaela Oltramari": "Rafaela Oltramari",
  "Rafaela": "Rafaela Oltramari",
  "Ruy Lima": "Ruy Lima",
  "Tiago Torres": "Tiago Torres",
  "Tiago Maurílio": "Tiago Maurílio",
  "Lúcio Tiago Maurilo Torres": "Tiago Maurílio",
  "Carolina Lima": "Carolina Lima",
  "Carol": "Carolina Lima",
  "Dann": "Dann",
  "Erick Mathias": "Erick Mathias",
  "Felipe Miranda": "Felipe Miranda",
  "Guilherme Beber": "Guilherme Beber",
  "Lucas Faraco": "Lucas Faraco",
  "Mariane Nogueira": "Mariane Nogueira",
};

// Notion user name → Supabase profile ID mapping (for comments author_id)
const NOTION_USER_PROFILE_MAP: Record<string, string> = {
  "Marco Andolfato": "46594a5e-564f-45ad-acef-35bc3706d117",
  "Marco": "46594a5e-564f-45ad-acef-35bc3706d117",
  "Celso Fernando": "44ed986f-8cc8-4123-9b76-890242a700ba",
  "Eduarda Anad": "256c8ed6-7ffd-438a-beae-4b7a302343c7",
  "Gustavo Bientinezi": "9b8ef924-0152-4568-93f0-ebc4408c804b",
  "Lucca": "e1dcb101-7c51-493a-860c-d6eac1bacc6e",
  "Lucca Nonato": "e1dcb101-7c51-493a-860c-d6eac1bacc6e",
  "Nathália Runge": "d3783b0b-3bd6-492e-9b8f-b0cc8c6c235c",
  "Nelson Mozart": "9919855f-0692-424a-bd91-19617fc89dc8",
  "Rafa": "044e983c-bb73-4db0-8d63-68ee2bc91ec8",
  "Rafaela Oltramari": "044e983c-bb73-4db0-8d63-68ee2bc91ec8",
  "Ruy Lima": "c81b9468-9ec3-414d-a5d6-03dc6a061f73",
  "Tiago Torres": "24b3d5f9-63a0-4a69-988b-feb87ea3daaa",
  "Tiago Maurílio": "24b3d5f9-63a0-4a69-988b-feb87ea3daaa",
  "Carolina Lima": "3232ffc4-ba12-4a15-82a2-3db8b8ec926d",
  "Carol": "3232ffc4-ba12-4a15-82a2-3db8b8ec926d",
};

// ── Types ───────────────────────────────────────────────────────────────────

interface NotionPage {
  id: string;
  url: string;
  properties: Record<string, any>;
  created_time: string;
  last_edited_time: string;
}

interface SyncResult {
  mode: string;
  total_notion_pages?: number;
  matched?: number;
  updated?: number;
  skipped?: number;
  not_found?: number;
  unmatched_titles?: string[];
  total_demands?: number;
  demands_with_notion?: number;
  total_comments_imported?: number;
  demands_processed?: number;
  errors?: string[];
  error?: string;
}

// ── Main handler ────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "properties";
    const limit = parseInt(url.searchParams.get("limit") || "200");
    const databaseId = url.searchParams.get("database_id") || DEFAULT_DATABASE_ID;

    const notionToken = req.headers.get("x-notion-token");
    if (!notionToken) {
      return jsonResponse({ error: "Missing x-notion-token header" }, 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    let result: SyncResult;

    if (mode === "properties") {
      result = await syncProperties(notionToken, databaseId, supabase, limit);
    } else if (mode === "comments") {
      result = await syncComments(notionToken, supabase, limit);
    } else {
      return jsonResponse({ error: `Invalid mode: ${mode}. Use "properties" or "comments".` }, 400);
    }

    return jsonResponse(result);
  } catch (err) {
    console.error("[notion-sync] Fatal:", err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
});

// ── Properties sync ─────────────────────────────────────────────────────────

async function syncProperties(
  token: string,
  databaseId: string,
  supabase: any,
  limit: number
): Promise<SyncResult> {
  const result: SyncResult = {
    mode: "properties",
    total_notion_pages: 0,
    matched: 0,
    updated: 0,
    skipped: 0,
    not_found: 0,
    unmatched_titles: [],
    errors: [],
  };

  // 1. Fetch ALL pages from Notion database (paginated)
  const allPages: NotionPage[] = [];
  let hasMore = true;
  let startCursor: string | undefined;

  while (hasMore && allPages.length < limit) {
    const body: any = { page_size: 100 };
    if (startCursor) body.start_cursor = startCursor;

    const res = await notionFetch(token, `${NOTION_API}/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Notion API ${res.status}: ${text.slice(0, 500)}`);
    }

    const data = await res.json();
    allPages.push(...(data.results || []));
    hasMore = data.has_more ?? false;
    startCursor = data.next_cursor ?? undefined;
  }

  result.total_notion_pages = allPages.length;
  console.log(`[notion-sync] Fetched ${allPages.length} pages from Notion`);

  // 2. Get all demands from Supabase
  const { data: demands, error: dbErr } = await supabase
    .from("demands")
    .select("id, title, notion_page_id, notion_url, status, start_date, due_date, responsible, prioridade")
    .eq("tenant_id", TENANT_ID);

  if (dbErr) throw new Error(`Supabase query error: ${dbErr.message}`);

  // Build lookup maps
  const demandByPageId = new Map<string, any>();
  const demandByTitle = new Map<string, any>();

  for (const d of demands || []) {
    if (d.notion_page_id) {
      // Normalize: Notion IDs have dashes, our stored ones might not
      demandByPageId.set(normalizeId(d.notion_page_id), d);
    }
    // Use lowercase title for fuzzy matching
    const key = (d.title || "").trim().toLowerCase();
    if (key) demandByTitle.set(key, d);
  }

  // 3. Match and update
  for (const page of allPages) {
    try {
      const parsed = parseNotionPage(page);
      if (!parsed.title) {
        result.errors!.push(`Page ${page.id}: empty title, skipping`);
        continue;
      }

      // Try to find matching demand
      const normalizedPageId = normalizeId(page.id);
      let demand = demandByPageId.get(normalizedPageId);

      if (!demand) {
        // Fallback: match by title
        demand = demandByTitle.get(parsed.title.trim().toLowerCase());
      }

      if (!demand) {
        result.not_found!++;
        result.unmatched_titles!.push(parsed.title);
        continue;
      }

      result.matched!++;

      // Build update payload (only update non-null Notion values)
      const updates: Record<string, any> = {
        notion_page_id: normalizedPageId,
        notion_url: page.url,
        updated_at: new Date().toISOString(),
      };

      // Status
      if (parsed.status) {
        updates.status = parsed.status;
        // Auto-set feito based on status
        if (["Concluído", "Concluido", "Aprovado"].includes(parsed.status)) {
          updates.feito = true;
        }
      }

      // Dates: Notion "Prazo" → start_date / due_date
      if (parsed.prazo_start) {
        updates.start_date = parsed.prazo_start;
      }
      if (parsed.prazo_end) {
        updates.due_date = parsed.prazo_end;
      } else if (parsed.prazo_start && !parsed.prazo_end) {
        // Single date = due_date only
        updates.due_date = parsed.prazo_start;
        // Don't overwrite start_date if it's a single date
        delete updates.start_date;
      }

      // Responsible (people property → name string)
      if (parsed.responsible) {
        updates.responsible = parsed.responsible;
      }

      // Priority
      if (parsed.prioridade) {
        updates.prioridade = mapPriority(parsed.prioridade);
      }

      // BUs (multi-select)
      if (parsed.bus && parsed.bus.length > 0) {
        updates.bus = parsed.bus;
      }

      // Tags (multi-select)
      if (parsed.tags && parsed.tags.length > 0) {
        updates.tags = parsed.tags;
      }

      // Tipo de Mídia
      if (parsed.tipo_midia && parsed.tipo_midia.length > 0) {
        updates.tipo_midia = parsed.tipo_midia;
      }

      // Formalização
      if (parsed.formalizacao) {
        updates.formalizacao = parsed.formalizacao;
      }

      // Info (rich text)
      if (parsed.info) {
        updates.info = parsed.info;
      }

      // Feito (checkbox)
      if (parsed.feito !== undefined) {
        updates.feito = parsed.feito;
      }

      // Milestones
      if (parsed.milestones) {
        updates.milestones = parsed.milestones;
      }

      // Sub-item / Item Principal
      if (parsed.subitem) updates.subitem = parsed.subitem;
      if (parsed.item_principal) updates.item_principal = parsed.item_principal;

      // Check if there are actual changes
      const hasChanges = Object.keys(updates).some((key) => {
        if (key === "updated_at" || key === "notion_page_id" || key === "notion_url") return false;
        const oldVal = demand[key];
        const newVal = updates[key];
        if (oldVal === undefined || oldVal === null) return newVal !== null && newVal !== undefined;
        return JSON.stringify(oldVal) !== JSON.stringify(newVal);
      });

      // Always update notion_url and notion_page_id even if no other changes
      const needsNotionFields = !demand.notion_url || !demand.notion_page_id;

      if (hasChanges || needsNotionFields) {
        const { error: upErr } = await supabase
          .from("demands")
          .update(updates)
          .eq("id", demand.id);

        if (upErr) {
          result.errors!.push(`Update ${parsed.title}: ${upErr.message}`);
        } else {
          result.updated!++;
        }
      } else {
        result.skipped!++;
      }
    } catch (e) {
      result.errors!.push(`Page ${page.id}: ${e.message}`);
    }
  }

  return result;
}

// ── Comments sync ───────────────────────────────────────────────────────────

async function syncComments(
  token: string,
  supabase: any,
  limit: number
): Promise<SyncResult> {
  const result: SyncResult = {
    mode: "comments",
    total_demands: 0,
    demands_with_notion: 0,
    total_comments_imported: 0,
    demands_processed: 0,
    errors: [],
  };

  // 1. Get demands that have a notion_page_id
  const { data: demands, error: dbErr } = await supabase
    .from("demands")
    .select("id, title, notion_page_id")
    .eq("tenant_id", TENANT_ID)
    .not("notion_page_id", "is", null)
    .limit(limit);

  if (dbErr) throw new Error(`Supabase query: ${dbErr.message}`);

  result.total_demands = demands?.length ?? 0;
  result.demands_with_notion = demands?.length ?? 0;

  if (!demands || demands.length === 0) {
    result.errors!.push("No demands with notion_page_id found. Run properties sync first.");
    return result;
  }

  // 2. Get existing comments to avoid duplicates
  const { data: existingComments } = await supabase
    .from("demand_comments")
    .select("id, demand_id, content, created_at")
    .eq("tenant_id", TENANT_ID);

  // Build a set of existing comment signatures to detect duplicates
  const existingSet = new Set<string>();
  for (const c of existingComments || []) {
    // Use demand_id + truncated content + date as signature
    const sig = `${c.demand_id}::${(c.content || "").slice(0, 80)}::${c.created_at?.slice(0, 10)}`;
    existingSet.add(sig);
  }

  // 3. Default author for unmapped users
  const DEFAULT_AUTHOR_ID = "46594a5e-564f-45ad-acef-35bc3706d117"; // Marco Andolfato

  // 4. Process each demand
  let processed = 0;

  for (const demand of demands) {
    if (processed >= limit) break;

    try {
      const pageId = normalizeId(demand.notion_page_id);

      // Fetch comments from Notion
      const comments = await fetchAllComments(token, pageId);

      if (comments.length === 0) {
        processed++;
        result.demands_processed!++;
        continue;
      }

      for (const comment of comments) {
        try {
          // Extract comment content
          const content = extractRichText(comment.rich_text || []);
          if (!content.trim()) continue;

          // Map author
          const authorName = comment.created_by?.name || comment.created_by?.person?.email || "Unknown";
          const authorId = findProfileId(authorName) || DEFAULT_AUTHOR_ID;

          // Check for duplicate
          const sig = `${demand.id}::${content.slice(0, 80)}::${comment.created_time?.slice(0, 10)}`;
          if (existingSet.has(sig)) continue;

          // Insert comment
          const { error: insertErr } = await supabase
            .from("demand_comments")
            .insert({
              tenant_id: TENANT_ID,
              demand_id: demand.id,
              author_id: authorId,
              content,
              mentions: [],
              created_at: comment.created_time || new Date().toISOString(),
            });

          if (insertErr) {
            result.errors!.push(`Comment on "${demand.title}": ${insertErr.message}`);
          } else {
            result.total_comments_imported!++;
            existingSet.add(sig); // Prevent duplicates in same run
          }
        } catch (e) {
          result.errors!.push(`Comment parse error on "${demand.title}": ${e.message}`);
        }
      }

      processed++;
      result.demands_processed!++;
    } catch (e) {
      result.errors!.push(`Demand "${demand.title}": ${e.message}`);
      processed++;
      result.demands_processed!++;
    }
  }

  return result;
}

// ── Notion property parser ──────────────────────────────────────────────────

interface ParsedPage {
  title: string;
  status?: string;
  prazo_start?: string;
  prazo_end?: string;
  responsible?: string;
  prioridade?: string;
  bus?: string[];
  tags?: string[];
  tipo_midia?: string[];
  formalizacao?: string;
  info?: string;
  feito?: boolean;
  milestones?: string;
  subitem?: string;
  item_principal?: string;
}

function parseNotionPage(page: NotionPage): ParsedPage {
  const props = page.properties;
  const result: ParsedPage = { title: "" };

  for (const [key, prop] of Object.entries(props)) {
    const lowerKey = key.toLowerCase().trim();

    switch (prop.type) {
      case "title":
        if (prop.title?.length > 0) {
          result.title = prop.title.map((t: any) => t.plain_text).join("");
        }
        break;

      case "select":
        if (prop.select?.name) {
          if (lowerKey === "status") result.status = prop.select.name;
          else if (lowerKey === "prioridade" || lowerKey === "priority") result.prioridade = prop.select.name;
          else if (lowerKey.includes("formaliza")) result.formalizacao = prop.select.name;
        }
        break;

      case "multi_select":
        if (prop.multi_select?.length > 0) {
          const values = prop.multi_select.map((s: any) => s.name);
          if (lowerKey === "bu" || lowerKey === "bus" || lowerKey.includes("business")) result.bus = values;
          else if (lowerKey === "tags" || lowerKey === "tag") result.tags = values;
          else if (lowerKey.includes("m\u00eddia") || lowerKey.includes("midia") || lowerKey.includes("tipo")) result.tipo_midia = values;
        }
        break;

      case "date":
        if (prop.date) {
          if (lowerKey === "prazo" || lowerKey === "deadline" || lowerKey === "data") {
            result.prazo_start = prop.date.start || undefined;
            result.prazo_end = prop.date.end || undefined;
          }
        }
        break;

      case "people":
        if (prop.people?.length > 0 && (lowerKey.includes("respons") || lowerKey === "assign")) {
          const person = prop.people[0];
          const name = person.name || person.person?.email || "";
          result.responsible = mapNotionUser(name);
        }
        break;

      case "checkbox":
        if (lowerKey === "feito" || lowerKey === "done" || lowerKey === "conclu") {
          result.feito = prop.checkbox;
        }
        break;

      case "rich_text":
        if (prop.rich_text?.length > 0) {
          const text = prop.rich_text.map((t: any) => t.plain_text).join("");
          if (lowerKey.includes("info") || lowerKey.includes("descri")) result.info = text;
          else if (lowerKey.includes("sub")) result.subitem = text;
          else if (lowerKey.includes("milestone")) result.milestones = text;
        }
        break;

      case "relation":
        // Relations return page IDs; we'll store the count or skip
        break;

      case "rollup":
        if (prop.rollup?.type === "array" && prop.rollup.array?.length > 0) {
          const vals = prop.rollup.array
            .filter((v: any) => v.type === "title" && v.title?.length > 0)
            .map((v: any) => v.title[0]?.plain_text)
            .filter(Boolean);
          if (lowerKey.includes("principal") || lowerKey.includes("parent")) {
            result.item_principal = vals.join(", ");
          }
        }
        break;
    }
  }

  return result;
}

// ── Notion API helpers ──────────────────────────────────────────────────────

function notionFetch(token: string, url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

async function fetchAllComments(token: string, pageId: string): Promise<any[]> {
  const allComments: any[] = [];
  let hasMore = true;
  let startCursor: string | undefined;

  while (hasMore) {
    const params = new URLSearchParams({ block_id: pageId });
    if (startCursor) params.set("start_cursor", startCursor);

    const res = await notionFetch(token, `${NOTION_API}/comments?${params}`);

    if (!res.ok) {
      if (res.status === 404) return []; // Page not found or no access
      const text = await res.text();
      throw new Error(`Notion comments ${res.status}: ${text.slice(0, 300)}`);
    }

    const data = await res.json();
    allComments.push(...(data.results || []));
    hasMore = data.has_more ?? false;
    startCursor = data.next_cursor ?? undefined;
  }

  return allComments;
}

function extractRichText(richText: any[]): string {
  return richText.map((t: any) => t.plain_text || "").join("");
}

// ── Mapping helpers ─────────────────────────────────────────────────────────

function mapNotionUser(notionName: string): string {
  // Try direct map
  if (NOTION_USER_MAP[notionName]) return NOTION_USER_MAP[notionName];

  // Try case-insensitive partial match
  const lower = notionName.toLowerCase();
  for (const [key, value] of Object.entries(NOTION_USER_MAP)) {
    if (key.toLowerCase() === lower) return value;
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return value;
  }

  return notionName; // Fallback: use original name
}

function findProfileId(notionName: string): string | null {
  // Try direct map
  if (NOTION_USER_PROFILE_MAP[notionName]) return NOTION_USER_PROFILE_MAP[notionName];

  // Try case-insensitive partial match
  const lower = notionName.toLowerCase();
  for (const [key, value] of Object.entries(NOTION_USER_PROFILE_MAP)) {
    if (key.toLowerCase() === lower) return value;
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return value;
  }

  return null;
}

function mapPriority(notionPriority: string): string {
  const lower = notionPriority.toLowerCase();
  const map: Record<string, string> = {
    urgente: "Urgente",
    urgent: "Urgente",
    alta: "Alta",
    high: "Alta",
    prioridade: "Alta", // Notion field name used as option name
    media: "Média",
    medium: "Média",
    baixa: "Baixa",
    low: "Baixa",
  };
  return map[lower] || notionPriority;
}

function normalizeId(id: string): string {
  // Remove dashes from Notion page IDs for consistent comparison
  return id.replace(/-/g, "");
}

// ── Response helpers ────────────────────────────────────────────────────────

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-notion-token, content-type, apikey, x-client-info",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}
