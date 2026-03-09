import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Allow up to 5 minutes for full historical sync on Vercel
export const maxDuration = 300;

const OMIE_BASE_URL = "https://app.omie.com.br/api/v1";
const PAGE_SIZE = 500;
const MAX_RETRIES = 5;
const INTER_PAGE_DELAY_MS = 2000; // 2s between pages to avoid rate-limiting
const INTER_PHASE_DELAY_MS = 4000; // 4s between sync phases

// ── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Extract wait-seconds from Omie "Consumo redundante" message, or return a default */
function parseOmieWaitSeconds(text: string): number {
  const m = text.match(/Aguarde (\d+) segundos/i);
  return m ? Math.min(Number(m[1]) + 2, 30) : 15; // add 2s buffer, cap at 30s
}

// ── Omie API helper ───────────────────────────────────────────────────────────

interface OmieCredentials {
  app_key: string;
  app_secret: string;
}

async function omieCall(
  creds: OmieCredentials,
  endpoint: string,
  call: string,
  params: Record<string, unknown>[]
): Promise<Record<string, unknown>> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(`${OMIE_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        call,
        app_key: creds.app_key,
        app_secret: creds.app_secret,
        param: params,
      }),
    });

    const text = await res.text().catch(() => "");

    // Rate-limited: parse wait time from Omie and retry
    if (
      !res.ok &&
      text.includes("Consumo redundante") &&
      attempt < MAX_RETRIES
    ) {
      const waitSec = parseOmieWaitSeconds(text);
      console.log(
        `[sync-omie] Rate limited on ${call}, waiting ${waitSec}s (attempt ${attempt + 1}/${MAX_RETRIES})...`
      );
      await sleep(waitSec * 1000);
      continue;
    }

    if (!res.ok) {
      throw new Error(`Omie HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Omie invalid JSON: ${text.slice(0, 200)}`);
    }

    // faultstring can also be rate-limit — retry
    if (data.faultstring) {
      const fault = String(data.faultstring);
      if (fault.includes("Consumo redundante") && attempt < MAX_RETRIES) {
        const waitSec = parseOmieWaitSeconds(fault);
        console.log(
          `[sync-omie] Rate limited (fault) on ${call}, waiting ${waitSec}s (attempt ${attempt + 1}/${MAX_RETRIES})...`
        );
        await sleep(waitSec * 1000);
        continue;
      }
      throw new Error(`Omie error: ${fault}`);
    }

    return data;
  }

  throw new Error(`Omie: max retries exceeded for ${call}`);
}

// ── Date helper ──────────────────────────────────────────────────────────────
// Omie returns dates as "DD/MM/YYYY" — PostgreSQL DATE columns need "YYYY-MM-DD"

function parseOmieDate(raw: unknown): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;

  // Already ISO format? (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

  // DD/MM/YYYY
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  // Fallback: try native Date parse
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];

  return null; // unparseable — let caller decide
}

// ── Sync categories from Omie ─────────────────────────────────────────────────

async function syncCategories(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  tenantId: string,
  creds: OmieCredentials
): Promise<{ inserted: number; updated: number; errors: string[] }> {
  let inserted = 0;
  let updated = 0;
  const errors: string[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`[sync-omie] Categorias — page ${page}...`);

      const data = await omieCall(creds, "geral/categorias/", "ListarCategorias", [
        { pagina: page, registros_por_pagina: PAGE_SIZE },
      ]);

      const categorias = (data.categoria_cadastro || []) as Array<{
        codigo: string;
        descricao: string;
        id_tipo_lancamento?: string;
      }>;

      console.log(`[sync-omie] Categorias — page ${page}: ${categorias.length} records`);

      for (const cat of categorias) {
        // Omie type mapping: R = receita, D = despesa
        const tipo =
          cat.id_tipo_lancamento === "R" ? "receita" : "despesa";

        const { error } = await (supabase as any)
          .from("finance_categories")
          .upsert(
            {
              tenant_id: tenantId,
              name: cat.descricao,
              type: tipo,
              omie_id: cat.codigo,
              is_active: true,
            } as never,
            { onConflict: "tenant_id,omie_id" }
          );

        if (error) {
          errors.push(`Categoria ${cat.codigo}: ${error.message}`);
        } else {
          inserted++;
        }
      }

      const totalPages = Math.ceil(
        ((data.total_de_registros as number) || 0) / PAGE_SIZE
      );
      hasMore = page < totalPages;
      page++;

      if (hasMore) await sleep(INTER_PAGE_DELAY_MS);
    }
  } catch (err) {
    errors.push(
      `Categorias: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  console.log(`[sync-omie] Categorias done: ${inserted} upserted, ${errors.length} errors`);
  return { inserted, updated, errors };
}

// ── Sync cost centers (departamentos) from Omie ──────────────────────────────

async function syncCostCenters(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  tenantId: string,
  creds: OmieCredentials
): Promise<{ inserted: number; updated: number; errors: string[] }> {
  let inserted = 0;
  let updated = 0;
  const errors: string[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`[sync-omie] Departamentos (Cost Centers) — page ${page}...`);

      const data = await omieCall(creds, "geral/departamentos/", "ListarDepartamentos", [
        { pagina: page, registros_por_pagina: PAGE_SIZE },
      ]);

      const departamentos = (data.departamentos || []) as Array<{
        codigo: string;
        descricao: string;
        inativo?: string;
      }>;

      console.log(`[sync-omie] Departamentos — page ${page}: ${departamentos.length} records`);

      for (const dep of departamentos) {
        const omieId = String(dep.codigo || "");
        if (!omieId) continue;

        const isActive = dep.inativo !== "S";

        const { error } = await (supabase as any)
          .from("finance_cost_centers")
          .upsert(
            {
              tenant_id: tenantId,
              code: omieId,
              name: dep.descricao || `Departamento ${omieId}`,
              omie_id: omieId,
              is_active: isActive,
            } as never,
            { onConflict: "tenant_id,omie_id" }
          );

        if (error) {
          errors.push(`Departamento ${omieId}: ${error.message}`);
        } else {
          inserted++;
        }
      }

      const totalPages = Math.ceil(
        ((data.total_de_registros as number) || 0) / PAGE_SIZE
      );
      hasMore = page < totalPages;
      page++;

      if (hasMore) await sleep(INTER_PAGE_DELAY_MS);
    }
  } catch (err) {
    errors.push(
      `Departamentos: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  console.log(`[sync-omie] Departamentos done: ${inserted} upserted, ${errors.length} errors`);
  return { inserted, updated, errors };
}

// ── Category & Cost Center lookup maps ───────────────────────────────────────

type LookupMap = Map<string, string>; // omie_id → our UUID

async function buildCategoryLookup(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  tenantId: string
): Promise<LookupMap> {
  const { data } = await (supabase as any)
    .from("finance_categories")
    .select("id, omie_id")
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null);

  const map = new Map<string, string>();
  for (const row of (data ?? []) as Array<{ id: string; omie_id: string }>) {
    map.set(String(row.omie_id), row.id);
  }
  return map;
}

async function buildCostCenterLookup(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  tenantId: string
): Promise<LookupMap> {
  const { data } = await (supabase as any)
    .from("finance_cost_centers")
    .select("id, omie_id")
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null);

  const map = new Map<string, string>();
  for (const row of (data ?? []) as Array<{ id: string; omie_id: string }>) {
    map.set(String(row.omie_id), row.id);
  }
  return map;
}

// ── Cost center name lookup (omie_id → name) for BU derivation ──────────────

type CostCenterNameMap = Map<string, string>; // omie_id → name

async function buildCostCenterNameLookup(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  tenantId: string
): Promise<CostCenterNameMap> {
  const { data } = await (supabase as any)
    .from("finance_cost_centers")
    .select("omie_id, name")
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null);

  const map = new Map<string, string>();
  for (const row of (data ?? []) as Array<{ omie_id: string; name: string }>) {
    map.set(String(row.omie_id), row.name);
  }
  return map;
}

// ── Derive business_unit from cost center name ──────────────────────────────

const BU_NAME_PATTERNS: Array<{ pattern: RegExp; bu: string }> = [
  { pattern: /branding/i, bu: "Branding" },
  { pattern: /digital\s*3d|3d/i, bu: "Digital 3D" },
  { pattern: /marketing/i, bu: "Marketing" },
  { pattern: /audiovisual|audio\s*visual/i, bu: "Audiovisual" },
  { pattern: /interi?ores/i, bu: "Interiores" },
];

function deriveBUFromCostCenter(
  conta: Record<string, unknown>,
  ccNameLookup: CostCenterNameMap
): string | null {
  // Extract the departamento code (same logic as resolveCostCenterId)
  let depCode: string | undefined;

  const departamentos = conta.departamentos as
    | Array<{ codigo_departamento?: string }>
    | undefined;
  if (departamentos?.length) {
    depCode = departamentos[0]?.codigo_departamento
      ? String(departamentos[0].codigo_departamento)
      : undefined;
  }
  if (!depCode) {
    depCode = conta.codigo_departamento
      ? String(conta.codigo_departamento)
      : undefined;
  }

  if (!depCode) return null;

  const ccName = ccNameLookup.get(depCode);
  if (!ccName) return null;

  for (const { pattern, bu } of BU_NAME_PATTERNS) {
    if (pattern.test(ccName)) return bu;
  }

  return null; // No matching BU for this cost center
}

// ── Resolve category_id and cost_center_id from Omie raw data ────────────────

function resolveCategoryId(
  conta: Record<string, unknown>,
  catLookup: LookupMap
): string | null {
  // Omie uses `codigo_categoria` for the category code
  const codigoCat = conta.codigo_categoria || conta.codigo_categoria_str;
  if (codigoCat) {
    const resolved = catLookup.get(String(codigoCat));
    if (resolved) return resolved;
  }
  // Some Omie endpoints nest categories differently
  const categorias = conta.categorias as Array<{ codigo_categoria?: string }> | undefined;
  if (categorias?.length) {
    const firstCat = categorias[0]?.codigo_categoria;
    if (firstCat) {
      const resolved = catLookup.get(String(firstCat));
      if (resolved) return resolved;
    }
  }
  return null;
}

function resolveCostCenterId(
  conta: Record<string, unknown>,
  ccLookup: LookupMap
): string | null {
  // Omie uses `departamentos` array inside contas
  const departamentos = conta.departamentos as Array<{ codigo_departamento?: string }> | undefined;
  if (departamentos?.length) {
    const firstDep = departamentos[0]?.codigo_departamento;
    if (firstDep) {
      const resolved = ccLookup.get(String(firstDep));
      if (resolved) return resolved;
    }
  }
  // Fallback: direct field
  const codigoDep = conta.codigo_departamento;
  if (codigoDep) {
    const resolved = ccLookup.get(String(codigoDep));
    if (resolved) return resolved;
  }
  return null;
}

// ── Sync contas a pagar from Omie ─────────────────────────────────────────────

async function syncContasPagar(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  tenantId: string,
  creds: OmieCredentials,
  userId: string,
  catLookup: LookupMap,
  ccLookup: LookupMap,
  ccNameLookup: CostCenterNameMap
): Promise<{ inserted: number; updated: number; errors: string[] }> {
  let inserted = 0;
  const errors: string[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`[sync-omie] Contas a Pagar — page ${page}...`);

      const data = await omieCall(
        creds,
        "financas/contapagar/",
        "ListarContasPagar",
        [{ pagina: page, registros_por_pagina: PAGE_SIZE }]
      );

      const contas = (data.conta_pagar_cadastro || []) as Array<
        Record<string, unknown>
      >;

      const totalRecords = (data.total_de_registros as number) || 0;
      console.log(
        `[sync-omie] Contas a Pagar — page ${page}: ${contas.length} records (total: ${totalRecords})`
      );

      for (const conta of contas) {
        const omieId = String(conta.codigo_lancamento_omie || "");
        if (!omieId) continue;

        // Map Omie status to our status
        let status = "previsto";
        const statusOmie = String(conta.status_titulo || "").toLowerCase();
        if (statusOmie === "liquidado" || statusOmie === "pago")
          status = "pago";
        else if (statusOmie === "atrasado" || statusOmie === "vencido")
          status = "atrasado";
        else if (statusOmie === "cancelado") status = "cancelado";

        const record: Record<string, unknown> = {
          tenant_id: tenantId,
          type: "despesa",
          status,
          description:
            String(conta.observacao || conta.complemento || "Conta a pagar"),
          amount: Number(conta.valor_documento || 0),
          paid_amount: Number(conta.valor_pago || 0),
          date:
            parseOmieDate(conta.data_emissao) ||
            parseOmieDate(conta.data_vencimento) ||
            new Date().toISOString().split("T")[0],
          due_date: parseOmieDate(conta.data_vencimento),
          paid_date: parseOmieDate(conta.data_pagamento),
          counterpart: conta.nome_fornecedor
            ? String(conta.nome_fornecedor)
            : null,
          counterpart_doc: conta.cnpj_cpf_fornecedor
            ? String(conta.cnpj_cpf_fornecedor)
            : null,
          // Link category, cost center, and business unit from Omie codes
          category_id: resolveCategoryId(conta, catLookup),
          cost_center_id: resolveCostCenterId(conta, ccLookup),
          business_unit: deriveBUFromCostCenter(conta, ccNameLookup),
          payment_method: conta.id_meio_pagamento
            ? String(conta.id_meio_pagamento)
            : null,
          omie_id: omieId,
          omie_synced_at: new Date().toISOString(),
          omie_raw: conta,
          // P2: campos granulares indexados
          omie_juros: Number(conta.nValorJuros || 0),
          omie_multa: Number(conta.nValorMulta || 0),
          omie_desconto: Number(conta.nValorDesconto || 0),
          omie_num_titulo: conta.cNumTitulo ? String(conta.cNumTitulo) : null,
          omie_categoria_codigo: conta.codigo_categoria
            ? String(conta.codigo_categoria)
            : null,
          omie_departamento_codigo: conta.codigo_departamento
            ? String(conta.codigo_departamento)
            : null,
          updated_by: userId,
        };

        const { error } = await (supabase as any)
          .from("finance_transactions")
          .upsert(
            { ...record, created_by: userId } as never,
            { onConflict: "tenant_id,omie_id", ignoreDuplicates: false }
          );
        if (error) errors.push(`CP ${omieId}: ${error.message}`);
        else inserted++;
      }

      const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
      hasMore = page < totalPages;
      page++;

      if (hasMore) await sleep(INTER_PAGE_DELAY_MS);
    }
  } catch (err) {
    errors.push(
      `Contas a pagar: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  console.log(
    `[sync-omie] Contas a Pagar done: ${inserted} upserted, ${errors.length} errors`
  );
  return { inserted, updated: 0, errors };
}

// ── Sync contas a receber from Omie ───────────────────────────────────────────

async function syncContasReceber(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  tenantId: string,
  creds: OmieCredentials,
  userId: string,
  catLookup: LookupMap,
  ccLookup: LookupMap,
  ccNameLookup: CostCenterNameMap
): Promise<{ inserted: number; updated: number; errors: string[] }> {
  let inserted = 0;
  const errors: string[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`[sync-omie] Contas a Receber — page ${page}...`);

      const data = await omieCall(
        creds,
        "financas/contareceber/",
        "ListarContasReceber",
        [{ pagina: page, registros_por_pagina: PAGE_SIZE }]
      );

      const contas = (data.conta_receber_cadastro || []) as Array<
        Record<string, unknown>
      >;

      const totalRecords = (data.total_de_registros as number) || 0;
      console.log(
        `[sync-omie] Contas a Receber — page ${page}: ${contas.length} records (total: ${totalRecords})`
      );

      for (const conta of contas) {
        const omieId = String(conta.codigo_lancamento_omie || "");
        if (!omieId) continue;

        let status = "previsto";
        const statusOmie = String(conta.status_titulo || "").toLowerCase();
        if (statusOmie === "liquidado" || statusOmie === "recebido")
          status = "pago";
        else if (statusOmie === "atrasado" || statusOmie === "vencido")
          status = "atrasado";
        else if (statusOmie === "cancelado") status = "cancelado";

        const record: Record<string, unknown> = {
          tenant_id: tenantId,
          type: "receita",
          status,
          description:
            String(conta.observacao || conta.complemento || "Conta a receber"),
          amount: Number(conta.valor_documento || 0),
          paid_amount: Number(conta.valor_recebido || conta.valor_pago || 0),
          date:
            parseOmieDate(conta.data_emissao) ||
            parseOmieDate(conta.data_vencimento) ||
            new Date().toISOString().split("T")[0],
          due_date: parseOmieDate(conta.data_vencimento),
          paid_date:
            parseOmieDate(conta.data_recebimento) ||
            parseOmieDate(conta.data_pagamento),
          counterpart: conta.nome_cliente
            ? String(conta.nome_cliente)
            : null,
          counterpart_doc: conta.cnpj_cpf_cliente
            ? String(conta.cnpj_cpf_cliente)
            : null,
          // Link category, cost center, and business unit from Omie codes
          category_id: resolveCategoryId(conta, catLookup),
          cost_center_id: resolveCostCenterId(conta, ccLookup),
          business_unit: deriveBUFromCostCenter(conta, ccNameLookup),
          payment_method: conta.id_meio_pagamento
            ? String(conta.id_meio_pagamento)
            : null,
          omie_id: omieId,
          omie_synced_at: new Date().toISOString(),
          omie_raw: conta,
          // P2: campos granulares indexados
          omie_juros: Number(conta.nValorJuros || 0),
          omie_multa: Number(conta.nValorMulta || 0),
          omie_desconto: Number(conta.nValorDesconto || 0),
          omie_num_titulo: conta.cNumTitulo ? String(conta.cNumTitulo) : null,
          omie_categoria_codigo: conta.codigo_categoria
            ? String(conta.codigo_categoria)
            : null,
          omie_departamento_codigo: conta.codigo_departamento
            ? String(conta.codigo_departamento)
            : null,
          updated_by: userId,
        };

        const { error } = await (supabase as any)
          .from("finance_transactions")
          .upsert(
            { ...record, created_by: userId } as never,
            { onConflict: "tenant_id,omie_id", ignoreDuplicates: false }
          );
        if (error) errors.push(`CR ${omieId}: ${error.message}`);
        else inserted++;
      }

      const totalRecords2 = (data.total_de_registros as number) || 0;
      const totalPages = Math.ceil(totalRecords2 / PAGE_SIZE);
      hasMore = page < totalPages;
      page++;

      if (hasMore) await sleep(INTER_PAGE_DELAY_MS);
    }
  } catch (err) {
    errors.push(
      `Contas a receber: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  console.log(
    `[sync-omie] Contas a Receber done: ${inserted} upserted, ${errors.length} errors`
  );
  return { inserted, updated: 0, errors };
}

// ── POST /api/finance/sync-omie ───────────────────────────────────────────────

export async function POST() {
  const startedAt = new Date().toISOString();

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    const tenantId = profile.tenant_id;

    // Fetch Omie credentials
    const { data: config } = await (supabase as any)
      .from("integration_configs")
      .select("settings")
      .eq("tenant_id", tenantId)
      .eq("provider", "omie")
      .eq("is_active", true)
      .maybeSingle();

    // Fallback to env vars
    const appKey =
      config?.settings?.app_key || process.env.OMIE_APP_KEY;
    const appSecret =
      config?.settings?.app_secret || process.env.OMIE_APP_SECRET;

    if (!appKey || !appSecret) {
      return NextResponse.json(
        { ok: false, error: "Credenciais Omie nao configuradas" },
        { status: 400 }
      );
    }

    const creds: OmieCredentials = {
      app_key: appKey,
      app_secret: appSecret,
    };

    console.log("[sync-omie] ════════════════════════════════════════════════");
    console.log("[sync-omie] Starting full sync for tenant:", tenantId);

    // Phase 1: Sync reference data (categories + cost centers)
    console.log("[sync-omie] Phase 1: Categories...");
    const catResult = await syncCategories(supabase, tenantId, creds);

    await sleep(INTER_PHASE_DELAY_MS);

    console.log("[sync-omie] Phase 2: Cost Centers (Departamentos)...");
    const ccResult = await syncCostCenters(supabase, tenantId, creds);

    await sleep(INTER_PHASE_DELAY_MS);

    // Phase 2: Build lookup maps for linking (category_id, cost_center_id)
    console.log("[sync-omie] Building lookup maps for category/cost center linking...");
    const catLookup = await buildCategoryLookup(supabase, tenantId);
    const ccLookup = await buildCostCenterLookup(supabase, tenantId);
    const ccNameLookup = await buildCostCenterNameLookup(supabase, tenantId);
    console.log(
      `[sync-omie] Lookup maps: ${catLookup.size} categories, ${ccLookup.size} cost centers, ${ccNameLookup.size} CC names for BU`
    );

    // Phase 3: Sync transactions with linked references
    console.log("[sync-omie] Phase 3: Contas a Pagar...");
    const cpResult = await syncContasPagar(
      supabase, tenantId, creds, user.id, catLookup, ccLookup, ccNameLookup
    );

    await sleep(INTER_PHASE_DELAY_MS);

    console.log("[sync-omie] Phase 4: Contas a Receber...");
    const crResult = await syncContasReceber(
      supabase, tenantId, creds, user.id, catLookup, ccLookup, ccNameLookup
    );

    const totalInserted =
      catResult.inserted + ccResult.inserted + cpResult.inserted + crResult.inserted;
    const totalUpdated =
      catResult.updated + ccResult.updated + cpResult.updated + crResult.updated;
    const allErrors = [
      ...catResult.errors,
      ...ccResult.errors,
      ...cpResult.errors,
      ...crResult.errors,
    ];

    const finishedAt = new Date().toISOString();

    console.log("[sync-omie] ════════════════════════════════════════════════");
    console.log(
      `[sync-omie] Sync complete: ${totalInserted} inserted, ${totalUpdated} updated, ${allErrors.length} errors`
    );

    // Log sync result to omie_sync_log (reuse existing table)
    await (supabase as any).from("omie_sync_log").insert({
      tenant_id: tenantId,
      entity: "finance_full",
      status: allErrors.length > 0 ? "partial" : "success",
      records_synced: totalInserted + totalUpdated,
      error_message:
        allErrors.length > 0 ? allErrors.slice(0, 5).join("; ") : null,
      started_at: startedAt,
      finished_at: finishedAt,
    } as never);

    return NextResponse.json({
      ok: true,
      message: `Sync concluido: ${totalInserted} inseridos, ${totalUpdated} atualizados`,
      inserted: totalInserted,
      updated: totalUpdated,
      errors: allErrors.length > 0 ? allErrors.slice(0, 10) : undefined,
      details: {
        categories: catResult,
        costCenters: ccResult,
        contasPagar: cpResult,
        contasReceber: crResult,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[finance/sync-omie] Error:", message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
