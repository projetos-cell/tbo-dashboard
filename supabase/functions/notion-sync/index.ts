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
    } else if (mode === "project-import") {
      const projectId = url.searchParams.get("project_id");
      const tenantId = url.searchParams.get("tenant_id") || TENANT_ID;
      if (!projectId) {
        return jsonResponse({ error: "project_id is required for project-import mode" }, 400);
      }
      if (!databaseId && databaseId === DEFAULT_DATABASE_ID) {
        return jsonResponse({ error: "database_id is required for project-import mode" }, 400);
      }
      result = await importProjectTasks(notionToken, databaseId, projectId, tenantId, supabase, limit);
    } else if (mode === "demands-to-tasks") {
      const projectId = url.searchParams.get("project_id");
      const projectName = url.searchParams.get("project_name");
      const tenantId = url.searchParams.get("tenant_id") || TENANT_ID;
      if (!projectId) {
        return jsonResponse({ error: "project_id is required" }, 400);
      }
      if (!projectName) {
        return jsonResponse({ error: "project_name is required" }, 400);
      }
      result = await importDemandsToTasks(projectId, projectName, tenantId, supabase);
    } else {
      return jsonResponse({ error: `Invalid mode: ${mode}. Use "properties", "comments", "project-import", or "demands-to-tasks".` }, 400);
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

// ── Project import (tasks + comments → os_tasks + task_comments) ────────────

interface ProjectImportResult extends SyncResult {
  tasks_created: number;
  tasks_updated: number;
  tasks_skipped: number;
  comments_imported: number;
  sections_created: number;
}

async function importProjectTasks(
  token: string,
  databaseId: string,
  projectId: string,
  tenantId: string,
  supabase: any,
  limit: number
): Promise<ProjectImportResult> {
  const result: ProjectImportResult = {
    mode: "project-import",
    total_notion_pages: 0,
    tasks_created: 0,
    tasks_updated: 0,
    tasks_skipped: 0,
    comments_imported: 0,
    sections_created: 0,
    errors: [],
  };

  // 1. Fetch all pages from the Notion database
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
  console.log(`[project-import] Fetched ${allPages.length} pages from Notion database ${databaseId}`);

  if (allPages.length === 0) return result;

  // 2. Get existing os_tasks for this project (deduplication by notion_page_id)
  const { data: existingTasks } = await supabase
    .from("os_tasks")
    .select("id, title, notion_page_id")
    .eq("project_id", projectId);

  const taskByNotionId = new Map<string, any>();
  const taskByTitle = new Map<string, any>();
  for (const t of existingTasks || []) {
    if (t.notion_page_id) taskByNotionId.set(t.notion_page_id, t);
    if (t.title) taskByTitle.set(t.title.trim().toLowerCase(), t);
  }

  // 3. Get existing sections for this project
  const { data: existingSections } = await supabase
    .from("os_sections")
    .select("id, title")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });

  const sectionByTitle = new Map<string, string>();
  for (const s of existingSections || []) {
    sectionByTitle.set(s.title.trim().toLowerCase(), s.id);
  }

  // 4. Collect unique section names from Notion pages (from "Status" or "Seção" property)
  const sectionNames = new Set<string>();
  const parsedPages: Array<{ page: NotionPage; parsed: ParsedPage; sectionName: string | null }> = [];

  for (const page of allPages) {
    const parsed = parseNotionPage(page);
    // Use status as section grouping (common Notion pattern)
    const sectionName = extractSectionProperty(page) || parsed.status || null;
    if (sectionName) sectionNames.add(sectionName);
    parsedPages.push({ page, parsed, sectionName });
  }

  // 5. Create missing sections
  let sectionOrder = (existingSections || []).length;
  for (const name of sectionNames) {
    if (!sectionByTitle.has(name.trim().toLowerCase())) {
      const { data: newSection, error: secErr } = await supabase
        .from("os_sections")
        .insert({
          project_id: projectId,
          tenant_id: tenantId,
          title: name,
          order_index: sectionOrder++,
        })
        .select("id")
        .single();

      if (secErr) {
        result.errors!.push(`Section "${name}": ${secErr.message}`);
      } else if (newSection) {
        sectionByTitle.set(name.trim().toLowerCase(), newSection.id);
        result.sections_created++;
      }
    }
  }

  // 6. Upsert os_tasks
  const DEFAULT_AUTHOR_ID = "46594a5e-564f-45ad-acef-35bc3706d117"; // Marco
  let orderIndex = (existingTasks || []).length;

  const importedTaskMap = new Map<string, string>(); // notion_page_id → os_task_id

  for (const { page, parsed, sectionName } of parsedPages) {
    try {
      if (!parsed.title) {
        result.errors!.push(`Page ${page.id}: empty title, skipping`);
        continue;
      }

      const notionPageId = normalizeId(page.id);
      const sectionId = sectionName
        ? sectionByTitle.get(sectionName.trim().toLowerCase()) ?? null
        : null;

      // Check if already imported
      let existingTask = taskByNotionId.get(notionPageId);
      if (!existingTask) {
        existingTask = taskByTitle.get(parsed.title.trim().toLowerCase());
      }

      // Map assignee
      const assigneeName = parsed.responsible
        ? mapNotionUser(parsed.responsible)
        : null;
      const assigneeId = parsed.responsible
        ? findProfileId(parsed.responsible)
        : null;

      // Map priority
      const priority = parsed.prioridade
        ? mapPriority(parsed.prioridade).toLowerCase()
        : null;

      // Map status
      const status = mapTaskStatus(parsed.status);

      // Determine dates
      const dueDate = parsed.prazo_end || parsed.prazo_start || null;
      const startDate = parsed.prazo_end ? parsed.prazo_start || null : null;

      if (existingTask) {
        // Update existing task
        const updates: Record<string, any> = {
          notion_page_id: notionPageId,
          updated_at: new Date().toISOString(),
        };

        if (status) updates.status = status;
        if (priority) updates.priority = priority;
        if (assigneeName) updates.assignee_name = assigneeName;
        if (assigneeId) updates.assignee_id = assigneeId;
        if (dueDate) updates.due_date = dueDate;
        if (startDate) updates.start_date = startDate;
        if (sectionId) updates.section_id = sectionId;
        if (parsed.info) updates.description = parsed.info;
        if (parsed.feito !== undefined) {
          updates.is_completed = parsed.feito;
          if (parsed.feito) updates.completed_at = new Date().toISOString();
        }

        const { error: upErr } = await supabase
          .from("os_tasks")
          .update(updates)
          .eq("id", existingTask.id);

        if (upErr) {
          result.errors!.push(`Update "${parsed.title}": ${upErr.message}`);
        } else {
          result.tasks_updated++;
          importedTaskMap.set(notionPageId, existingTask.id);
        }
      } else {
        // Create new task
        const isCompleted = parsed.feito || status === "concluida";
        const { data: newTask, error: insErr } = await supabase
          .from("os_tasks")
          .insert({
            project_id: projectId,
            tenant_id: tenantId,
            section_id: sectionId,
            title: parsed.title,
            description: parsed.info || null,
            status: status || "pendente",
            priority: priority || null,
            assignee_id: assigneeId,
            assignee_name: assigneeName,
            due_date: dueDate,
            start_date: startDate,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
            order_index: orderIndex++,
            notion_page_id: notionPageId,
          })
          .select("id")
          .single();

        if (insErr) {
          result.errors!.push(`Create "${parsed.title}": ${insErr.message}`);
        } else if (newTask) {
          result.tasks_created++;
          importedTaskMap.set(notionPageId, newTask.id);
        }
      }
    } catch (e) {
      result.errors!.push(`Page ${page.id}: ${e.message}`);
    }
  }

  // 7. Import comments for each imported task
  // Get existing task_comments to avoid duplicates
  const taskIds = [...importedTaskMap.values()];
  const { data: existingComments } = taskIds.length > 0
    ? await supabase
        .from("task_comments")
        .select("id, task_id, content, created_at")
        .in("task_id", taskIds)
    : { data: [] };

  const commentSigSet = new Set<string>();
  for (const c of existingComments || []) {
    const contentStr = typeof c.content === "string"
      ? c.content
      : JSON.stringify(c.content || "");
    const sig = `${c.task_id}::${contentStr.slice(0, 80)}::${c.created_at?.slice(0, 10)}`;
    commentSigSet.add(sig);
  }

  for (const [notionPageId, taskId] of importedTaskMap) {
    try {
      const comments = await fetchAllComments(token, notionPageId);
      if (comments.length === 0) continue;

      for (const comment of comments) {
        try {
          const text = extractRichText(comment.rich_text || []);
          if (!text.trim()) continue;

          const authorName = comment.created_by?.name || comment.created_by?.person?.email || "Unknown";
          const authorId = findProfileId(authorName) || DEFAULT_AUTHOR_ID;

          // Build TipTap-compatible JSON content
          const tiptapContent = {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text }],
              },
            ],
          };

          const contentStr = JSON.stringify(tiptapContent);
          const sig = `${taskId}::${contentStr.slice(0, 80)}::${comment.created_time?.slice(0, 10)}`;
          if (commentSigSet.has(sig)) continue;

          const { error: cErr } = await supabase
            .from("task_comments")
            .insert({
              task_id: taskId,
              author_id: authorId,
              content: tiptapContent,
              created_at: comment.created_time || new Date().toISOString(),
              updated_at: comment.created_time || new Date().toISOString(),
            });

          if (cErr) {
            result.errors!.push(`Comment on task ${taskId}: ${cErr.message}`);
          } else {
            result.comments_imported++;
            commentSigSet.add(sig);
          }
        } catch (e) {
          result.errors!.push(`Comment parse: ${e.message}`);
        }
      }
    } catch (e) {
      // Comment fetch failed for this page — non-fatal
      result.errors!.push(`Comments for ${notionPageId}: ${e.message}`);
    }
  }

  return result;
}

/**
 * Extracts "Seção" or "Section" property from a Notion page (select type).
 * Falls back to null if not present.
 */
function extractSectionProperty(page: NotionPage): string | null {
  for (const [key, prop] of Object.entries(page.properties)) {
    const lower = key.toLowerCase().trim();
    if (
      (lower === "seção" || lower === "secao" || lower === "section" || lower === "grupo" || lower === "group") &&
      prop.type === "select" &&
      prop.select?.name
    ) {
      return prop.select.name;
    }
  }
  return null;
}

/**
 * Maps Notion status values to os_tasks status keys.
 */
function mapTaskStatus(notionStatus?: string): string | null {
  if (!notionStatus) return null;
  const lower = notionStatus.toLowerCase().trim();
  const map: Record<string, string> = {
    "não iniciado": "pendente",
    "not started": "pendente",
    "a fazer": "pendente",
    "pendente": "pendente",
    "to do": "pendente",
    "em andamento": "em_andamento",
    "em progresso": "em_andamento",
    "in progress": "em_andamento",
    "doing": "em_andamento",
    "em revisão": "em_revisao",
    "em revisao": "em_revisao",
    "review": "em_revisao",
    "in review": "em_revisao",
    "revisão": "em_revisao",
    "concluído": "concluida",
    "concluido": "concluida",
    "done": "concluida",
    "feito": "concluida",
    "aprovado": "concluida",
    "approved": "concluida",
    "bloqueado": "bloqueada",
    "blocked": "bloqueada",
    "cancelado": "cancelada",
    "cancelled": "cancelada",
    "canceled": "cancelada",
  };
  return map[lower] || null;
}

// ── Demands → Tasks (import from already-synced demands table) ──────────────

async function importDemandsToTasks(
  projectId: string,
  projectName: string,
  tenantId: string,
  supabase: any
): Promise<ProjectImportResult> {
  const result: ProjectImportResult = {
    mode: "demands-to-tasks",
    total_notion_pages: 0,
    tasks_created: 0,
    tasks_updated: 0,
    tasks_skipped: 0,
    comments_imported: 0,
    sections_created: 0,
    errors: [],
  };

  // 1. Fetch demands matching this project name
  const { data: demands, error: dErr } = await supabase
    .from("demands")
    .select("id, title, status, responsible, prioridade, start_date, due_date, bus, tags, notion_page_id, feito, info")
    .eq("tenant_id", tenantId)
    .eq("notion_project_name", projectName);

  if (dErr) throw new Error(`Query demands: ${dErr.message}`);
  if (!demands || demands.length === 0) {
    result.errors!.push(`Nenhuma demand encontrada com notion_project_name = "${projectName}"`);
    return result;
  }

  result.total_notion_pages = demands.length;
  console.log(`[demands-to-tasks] Found ${demands.length} demands for project "${projectName}"`);

  // 2. Get existing os_tasks for deduplication
  const { data: existingTasks } = await supabase
    .from("os_tasks")
    .select("id, title, notion_page_id, legacy_demand_id")
    .eq("project_id", projectId);

  const taskByDemandId = new Map<string, any>();
  const taskByTitle = new Map<string, any>();
  for (const t of existingTasks || []) {
    if (t.legacy_demand_id) taskByDemandId.set(t.legacy_demand_id, t);
    if (t.notion_page_id) taskByDemandId.set(t.notion_page_id, t);
    if (t.title) taskByTitle.set(t.title.trim().toLowerCase(), t);
  }

  // 3. Get existing sections
  const { data: existingSections } = await supabase
    .from("os_sections")
    .select("id, title")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });

  const sectionByTitle = new Map<string, string>();
  for (const s of existingSections || []) {
    sectionByTitle.set(s.title.trim().toLowerCase(), s.id);
  }

  // 4. Collect unique statuses as sections
  const statusNames = new Set<string>();
  for (const d of demands) {
    if (d.status) statusNames.add(d.status);
  }

  let sectionOrder = (existingSections || []).length;
  for (const name of statusNames) {
    if (!sectionByTitle.has(name.trim().toLowerCase())) {
      const { data: newSection, error: secErr } = await supabase
        .from("os_sections")
        .insert({
          project_id: projectId,
          tenant_id: tenantId,
          title: name,
          order_index: sectionOrder++,
        })
        .select("id")
        .single();

      if (secErr) {
        result.errors!.push(`Section "${name}": ${secErr.message}`);
      } else if (newSection) {
        sectionByTitle.set(name.trim().toLowerCase(), newSection.id);
        result.sections_created++;
      }
    }
  }

  // 5. Create/update os_tasks from demands
  let orderIndex = (existingTasks || []).length;
  const demandToTaskMap = new Map<string, string>(); // demand_id → task_id

  for (const d of demands) {
    try {
      if (!d.title) {
        result.errors!.push(`Demand ${d.id}: empty title, skipping`);
        continue;
      }

      // Check if already imported
      let existing = taskByDemandId.get(d.id) || taskByDemandId.get(d.notion_page_id);
      if (!existing) {
        existing = taskByTitle.get(d.title.trim().toLowerCase());
      }

      const sectionId = d.status
        ? sectionByTitle.get(d.status.trim().toLowerCase()) ?? null
        : null;

      // Map responsible name → profile ID
      const assigneeName = d.responsible ? mapNotionUser(d.responsible) : null;
      const assigneeId = d.responsible ? findProfileId(d.responsible) : null;

      // Map priority
      const priority = d.prioridade ? mapPriority(d.prioridade).toLowerCase() : null;

      // Map status
      const status = mapTaskStatus(d.status);

      if (existing) {
        const updates: Record<string, any> = {
          legacy_demand_id: d.id,
          notion_page_id: d.notion_page_id || null,
          updated_at: new Date().toISOString(),
        };
        if (status) updates.status = status;
        if (priority) updates.priority = priority;
        if (assigneeName) updates.assignee_name = assigneeName;
        if (assigneeId) updates.assignee_id = assigneeId;
        if (d.due_date) updates.due_date = d.due_date;
        if (d.start_date) updates.start_date = d.start_date;
        if (sectionId) updates.section_id = sectionId;
        if (d.info) updates.description = d.info;
        if (d.feito !== undefined) {
          updates.is_completed = d.feito;
          if (d.feito) updates.completed_at = new Date().toISOString();
        }

        const { error: upErr } = await supabase
          .from("os_tasks")
          .update(updates)
          .eq("id", existing.id);

        if (upErr) {
          result.errors!.push(`Update "${d.title}": ${upErr.message}`);
        } else {
          result.tasks_updated++;
          demandToTaskMap.set(d.id, existing.id);
        }
      } else {
        const isCompleted = d.feito || status === "concluida";
        const { data: newTask, error: insErr } = await supabase
          .from("os_tasks")
          .insert({
            project_id: projectId,
            tenant_id: tenantId,
            section_id: sectionId,
            title: d.title,
            description: d.info || null,
            status: status || "pendente",
            priority: priority || null,
            assignee_id: assigneeId,
            assignee_name: assigneeName,
            due_date: d.due_date || null,
            start_date: d.start_date || null,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
            order_index: orderIndex++,
            notion_page_id: d.notion_page_id || null,
            legacy_demand_id: d.id,
          })
          .select("id")
          .single();

        if (insErr) {
          result.errors!.push(`Create "${d.title}": ${insErr.message}`);
        } else if (newTask) {
          result.tasks_created++;
          demandToTaskMap.set(d.id, newTask.id);
        }
      }
    } catch (e) {
      result.errors!.push(`Demand "${d.title}": ${e.message}`);
    }
  }

  // 6. Import demand_comments → task_comments
  const demandIds = [...demandToTaskMap.keys()];
  if (demandIds.length > 0) {
    const { data: demandComments } = await supabase
      .from("demand_comments")
      .select("id, demand_id, author_id, content, created_at")
      .in("demand_id", demandIds);

    // Get existing task_comments to avoid duplicates
    const taskIds = [...demandToTaskMap.values()];
    const { data: existingTaskComments } = await supabase
      .from("task_comments")
      .select("id, task_id, content, created_at")
      .in("task_id", taskIds);

    const commentSigSet = new Set<string>();
    for (const c of existingTaskComments || []) {
      const contentStr = typeof c.content === "string" ? c.content : JSON.stringify(c.content || "");
      const sig = `${c.task_id}::${contentStr.slice(0, 80)}::${c.created_at?.slice(0, 10)}`;
      commentSigSet.add(sig);
    }

    for (const dc of demandComments || []) {
      try {
        const taskId = demandToTaskMap.get(dc.demand_id);
        if (!taskId) continue;

        // Convert plain text content to TipTap format if needed
        const tiptapContent = typeof dc.content === "string"
          ? {
              type: "doc",
              content: [{ type: "paragraph", content: [{ type: "text", text: dc.content }] }],
            }
          : dc.content; // Already JSON

        const contentStr = JSON.stringify(tiptapContent);
        const sig = `${taskId}::${contentStr.slice(0, 80)}::${dc.created_at?.slice(0, 10)}`;
        if (commentSigSet.has(sig)) continue;

        const { error: cErr } = await supabase
          .from("task_comments")
          .insert({
            task_id: taskId,
            author_id: dc.author_id,
            content: tiptapContent,
            created_at: dc.created_at || new Date().toISOString(),
            updated_at: dc.created_at || new Date().toISOString(),
          });

        if (cErr) {
          result.errors!.push(`Comment for task ${taskId}: ${cErr.message}`);
        } else {
          result.comments_imported++;
          commentSigSet.add(sig);
        }
      } catch (e) {
        result.errors!.push(`Comment import: ${e.message}`);
      }
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
