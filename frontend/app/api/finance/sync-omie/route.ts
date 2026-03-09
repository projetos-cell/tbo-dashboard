import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Allow up to 5 minutes for full historical sync on Vercel
export const maxDuration = 300;

const OMIE_BASE_URL = "https://app.omie.com.br/api/v1";
const PAGE_SIZE = 500;
const BATCH_SIZE = 500;
const MAX_RETRIES = 5;
const INTER_PAGE_DELAY_MS = 2000;
const INTER_PHASE_DELAY_MS = 4000;

// ── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseOmieWaitSeconds(text: string): number {
  const m = text.match(/Aguarde (\d+) segundos/i);
  return m ? Math.min(Number(m[1]) + 2, 30) : 15;
}

/** Check if we have enough time remaining (30s safety margin) */
function hasTimeRemaining(startTime: number): boolean {
  const elapsed = Date.now() - startTime;
  const maxMs = (maxDuration - 30) * 1000; // 4m30s effective
  return elapsed < maxMs;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SupabaseClient = ReturnType<typeof createClient> extends Promise<infer T>
  ? T
  : never;

type LookupMap = Map<string, string>; // omie_id → our UUID

interface CostCenterInfo {
  name: string;
  override: string | null;
}
type CostCenterInfoMap = Map<string, CostCenterInfo>;

interface SyncResult {
  inserted: number;
  updated: number;
  errors: string[];
}

interface SyncLogError {
  entity: string;
  message: string;
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

// ── Date helper ───────────────────────────────────────────────────────────────

function parseOmieDate(raw: unknown): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];

  return null;
}

/** Format date as DD/MM/YYYY for Omie API params */
function formatOmieDateParam(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ── Batch upsert helper ──────────────────────────────────────────────────────

async function batchUpsert(
  supabase: SupabaseClient,
  table: string,
  records: Record<string, unknown>[],
  onConflict: string
): Promise<{ inserted: number; errors: string[] }> {
  let inserted = 0;
  const errors: string[] = [];

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await (supabase as never as { from: (t: string) => { upsert: (d: unknown, o: { onConflict: string; ignoreDuplicates: boolean }) => Promise<{ error: { message: string } | null }> } })
      .from(table)
      .upsert(batch as never, { onConflict, ignoreDuplicates: false });

    if (error) {
      errors.push(`Batch ${table} [${i}-${i + batch.length}]: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }

  return { inserted, errors };
}

// ── Progress update helper ──────────────────────────────────────────────────

async function updateSyncProgress(
  supabase: SupabaseClient,
  syncLogId: string | null,
  updates: Record<string, unknown>
): Promise<void> {
  if (!syncLogId) return;
  await (supabase as never as { from: (t: string) => { update: (d: unknown) => { eq: (c: string, v: string) => Promise<unknown> } } })
    .from("omie_sync_log")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", syncLogId);
}

// ── Phase 0a: Sync vendors → finance_vendors (BATCH) ────────────────────────

async function syncVendors(
  supabase: SupabaseClient,
  tenantId: string,
  creds: OmieCredentials
): Promise<SyncResult> {
  const errors: string[] = [];
  const allRecords: Record<string, unknown>[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`[sync-omie] Vendors — page ${page}...`);

      const data = await omieCall(
        creds,
        "geral/fornecedores/",
        "ListarFornecedores",
        [{ pagina: page, registros_por_pagina: PAGE_SIZE }]
      );

      const fornecedores = (data.cadastro || []) as Array<Record<string, unknown>>;
      const totalRecords = (data.total_de_registros as number) || 0;
      console.log(
        `[sync-omie] Vendors — page ${page}: ${fornecedores.length} records (total: ${totalRecords})`
      );

      for (const f of fornecedores) {
        const omieId = String(f.codigo_fornecedor || "");
        if (!omieId) continue;

        allRecords.push({
          tenant_id: tenantId,
          omie_id: omieId,
          name: String(f.razao_social || f.nome_fantasia || `Fornecedor ${omieId}`),
          cnpj: f.cnpj_cpf ? String(f.cnpj_cpf) : null,
          email: f.email ? String(f.email) : null,
          phone: f.telefone1_numero ? String(f.telefone1_numero) : null,
          is_active: String(f.inativo || "N").toUpperCase() !== "S",
          omie_synced_at: new Date().toISOString(),
        });
      }

      const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
      hasMore = page < totalPages;
      page++;
      if (hasMore) await sleep(INTER_PAGE_DELAY_MS);
    }
  } catch (err) {
    errors.push(`Vendors: ${err instanceof Error ? err.message : String(err)}`);
  }

  const result = await batchUpsert(supabase, "finance_vendors", allRecords, "tenant_id,omie_id");
  errors.push(...result.errors);

  console.log(`[sync-omie] Vendors done: ${result.inserted} upserted, ${errors.length} errors`);
  return { inserted: result.inserted, updated: 0, errors };
}

// ── Phase 0b: Sync clients → finance_clients (BATCH) ────────────────────────

async function syncClients(
  supabase: SupabaseClient,
  tenantId: string,
  creds: OmieCredentials
): Promise<SyncResult> {
  const errors: string[] = [];
  const allRecords: Record<string, unknown>[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`[sync-omie] Clients — page ${page}...`);

      const data = await omieCall(
        creds,
        "geral/clientes/",
        "ListarClientes",
        [{ pagina: page, registros_por_pagina: PAGE_SIZE }]
      );

      const clientes = (data.clientes_cadastro || []) as Array<Record<string, unknown>>;
      const totalRecords = (data.total_de_registros as number) || 0;
      console.log(
        `[sync-omie] Clients — page ${page}: ${clientes.length} records (total: ${totalRecords})`
      );

      for (const c of clientes) {
        const omieId = String(c.codigo_cliente_omie || "");
        if (!omieId) continue;

        allRecords.push({
          tenant_id: tenantId,
          omie_id: omieId,
          name: String(c.razao_social || c.nome_fantasia || `Cliente ${omieId}`),
          cnpj: c.cnpj_cpf ? String(c.cnpj_cpf) : null,
          email: c.email ? String(c.email) : null,
          phone: c.telefone1_numero ? String(c.telefone1_numero) : null,
          contact_name: c.contato ? String(c.contato) : null,
          is_active: String(c.inativo || "N").toUpperCase() !== "S",
          omie_synced_at: new Date().toISOString(),
        });
      }

      const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
      hasMore = page < totalPages;
      page++;
      if (hasMore) await sleep(INTER_PAGE_DELAY_MS);
    }
  } catch (err) {
    errors.push(`Clients: ${err instanceof Error ? err.message : String(err)}`);
  }

  const result = await batchUpsert(supabase, "finance_clients", allRecords, "tenant_id,omie_id");
  errors.push(...result.errors);

  console.log(`[sync-omie] Clients done: ${result.inserted} upserted, ${errors.length} errors`);
  return { inserted: result.inserted, updated: 0, errors };
}

// ── Sync bank accounts → finance_bank_accounts (BATCH) ──────────────────────

async function syncBankAccounts(
  supabase: SupabaseClient,
  tenantId: string,
  creds: OmieCredentials
): Promise<SyncResult> {
  const errors: string[] = [];
  const allRecords: Record<string, unknown>[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`[sync-omie] Bank Accounts — page ${page}...`);

      const data = await omieCall(
        creds,
        "financas/contacorrente/",
        "ListarContasCorrentes",
        [{ pagina: page, registros_por_pagina: PAGE_SIZE }]
      );

      const contas = (data.conta_corrente_lista || []) as Array<Record<string, unknown>>;
      const totalRecords = (data.total_de_registros as number) || 0;
      console.log(
        `[sync-omie] Bank Accounts — page ${page}: ${contas.length} records (total: ${totalRecords})`
      );

      for (const cc of contas) {
        const omieId = String(cc.nCodCC || cc.cCodCC || "");
        if (!omieId) continue;

        allRecords.push({
          tenant_id: tenantId,
          omie_id: omieId,
          name: String(cc.cDescricao || `Conta ${omieId}`),
          bank_code: cc.nCodBanco ? String(cc.nCodBanco) : null,
          bank_name: cc.cDescricaoBanco ? String(cc.cDescricaoBanco) : null,
          agency: cc.cNumAgencia ? String(cc.cNumAgencia) : null,
          account_number: cc.cNumConta ? String(cc.cNumConta) : null,
          account_type: cc.cTipo ? String(cc.cTipo) : "corrente",
          balance: Number(cc.nSaldo || 0),
          is_active: String(cc.cInativo || "N").toUpperCase() !== "S",
          omie_synced_at: new Date().toISOString(),
        });
      }

      const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
      hasMore = page < totalPages;
      page++;
      if (hasMore) await sleep(INTER_PAGE_DELAY_MS);
    }
  } catch (err) {
    errors.push(`BankAccounts: ${err instanceof Error ? err.message : String(err)}`);
  }

  const result = await batchUpsert(supabase, "finance_bank_accounts", allRecords, "tenant_id,omie_id");
  errors.push(...result.errors);

  console.log(`[sync-omie] Bank Accounts done: ${result.inserted} upserted, ${errors.length} errors`);
  return { inserted: result.inserted, updated: 0, errors };
}

// ── Sync categories (BATCH) ─────────────────────────────────────────────────

async function syncCategories(
  supabase: SupabaseClient,
  tenantId: string,
  creds: OmieCredentials
): Promise<SyncResult> {
  const errors: string[] = [];
  const allRecords: Record<string, unknown>[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`[sync-omie] Categorias — page ${page}...`);

      const data = await omieCall(
        creds,
        "geral/categorias/",
        "ListarCategorias",
        [{ pagina: page, registros_por_pagina: PAGE_SIZE }]
      );

      const categorias = (data.categoria_cadastro || []) as Array<{
        codigo: string;
        descricao: string;
        id_tipo_lancamento?: string;
      }>;

      console.log(
        `[sync-omie] Categorias — page ${page}: ${categorias.length} records`
      );

      for (const cat of categorias) {
        const tipo = cat.id_tipo_lancamento === "R" ? "receita" : "despesa";

        allRecords.push({
          tenant_id: tenantId,
          name: cat.descricao,
          type: tipo,
          omie_id: cat.codigo,
          is_active: true,
        });
      }

      const totalPages = Math.ceil(
        ((data.total_de_registros as number) || 0) / PAGE_SIZE
      );
      hasMore = page < totalPages;
      page++;
      if (hasMore) await sleep(INTER_PAGE_DELAY_MS);
    }
  } catch (err) {
    errors.push(`Categorias: ${err instanceof Error ? err.message : String(err)}`);
  }

  const result = await batchUpsert(supabase, "finance_categories", allRecords, "tenant_id,omie_id");
  errors.push(...result.errors);

  console.log(`[sync-omie] Categorias done: ${result.inserted} upserted, ${errors.length} errors`);
  return { inserted: result.inserted, updated: 0, errors };
}

// ── Sync cost centers (BATCH) ───────────────────────────────────────────────

async function syncCostCenters(
  supabase: SupabaseClient,
  tenantId: string,
  creds: OmieCredentials
): Promise<SyncResult> {
  const errors: string[] = [];
  const allRecords: Record<string, unknown>[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`[sync-omie] Departamentos (Cost Centers) — page ${page}...`);

      const data = await omieCall(
        creds,
        "geral/departamentos/",
        "ListarDepartamentos",
        [{ pagina: page, registros_por_pagina: PAGE_SIZE }]
      );

      const departamentos = (data.departamentos || []) as Array<{
        codigo: string;
        descricao: string;
        inativo?: string;
      }>;

      console.log(
        `[sync-omie] Departamentos — page ${page}: ${departamentos.length} records`
      );

      for (const dep of departamentos) {
        const omieId = String(dep.codigo || "");
        if (!omieId) continue;

        allRecords.push({
          tenant_id: tenantId,
          code: omieId,
          name: dep.descricao || `Departamento ${omieId}`,
          omie_id: omieId,
          is_active: dep.inativo !== "S",
        });
      }

      const totalPages = Math.ceil(
        ((data.total_de_registros as number) || 0) / PAGE_SIZE
      );
      hasMore = page < totalPages;
      page++;
      if (hasMore) await sleep(INTER_PAGE_DELAY_MS);
    }
  } catch (err) {
    errors.push(`Departamentos: ${err instanceof Error ? err.message : String(err)}`);
  }

  const result = await batchUpsert(supabase, "finance_cost_centers", allRecords, "tenant_id,omie_id");
  errors.push(...result.errors);

  console.log(`[sync-omie] Departamentos done: ${result.inserted} upserted, ${errors.length} errors`);
  return { inserted: result.inserted, updated: 0, errors };
}

// ── Lookup map builders ───────────────────────────────────────────────────────

async function buildCategoryLookup(
  supabase: SupabaseClient,
  tenantId: string
): Promise<LookupMap> {
  const { data } = await (supabase as never as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { not: (c: string, op: string, v: null) => Promise<{ data: Array<{ id: string; omie_id: string }> | null }> } } } })
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
  supabase: SupabaseClient,
  tenantId: string
): Promise<LookupMap> {
  const { data } = await (supabase as never as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { not: (c: string, op: string, v: null) => Promise<{ data: Array<{ id: string; omie_id: string }> | null }> } } } })
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

async function buildCostCenterInfoLookup(
  supabase: SupabaseClient,
  tenantId: string
): Promise<CostCenterInfoMap> {
  const { data } = await (supabase as never as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { not: (c: string, op: string, v: null) => Promise<{ data: Array<{ omie_id: string; name: string; business_unit_override: string | null }> | null }> } } } })
    .from("finance_cost_centers")
    .select("omie_id, name, business_unit_override")
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null);

  const map = new Map<string, CostCenterInfo>();
  for (const row of (data ?? []) as Array<{
    omie_id: string;
    name: string;
    business_unit_override: string | null;
  }>) {
    map.set(String(row.omie_id), {
      name: row.name,
      override: row.business_unit_override ?? null,
    });
  }
  return map;
}

async function buildBankAccountLookup(
  supabase: SupabaseClient,
  tenantId: string
): Promise<LookupMap> {
  const { data } = await (supabase as never as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { not: (c: string, op: string, v: null) => Promise<{ data: Array<{ id: string; omie_id: string }> | null }> } } } })
    .from("finance_bank_accounts")
    .select("id, omie_id")
    .eq("tenant_id", tenantId)
    .not("omie_id", "is", null);

  const map = new Map<string, string>();
  for (const row of (data ?? []) as Array<{ id: string; omie_id: string }>) {
    map.set(String(row.omie_id), row.id);
  }
  return map;
}

// ── Derive business_unit from cost center ────────────────────────────────────

const BU_NAME_PATTERNS: Array<{ pattern: RegExp; bu: string }> = [
  { pattern: /branding/i, bu: "Branding" },
  { pattern: /digital\s*3d|3d/i, bu: "Digital 3D" },
  { pattern: /marketing/i, bu: "Marketing" },
  { pattern: /audiovisual|audio\s*visual/i, bu: "Audiovisual" },
  { pattern: /interi?ores/i, bu: "Interiores" },
];

function deriveBUFromCostCenter(
  conta: Record<string, unknown>,
  ccInfoLookup: CostCenterInfoMap
): string | null {
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

  const info = ccInfoLookup.get(depCode);
  if (!info) return null;

  if (info.override) return info.override;

  for (const { pattern, bu } of BU_NAME_PATTERNS) {
    if (pattern.test(info.name)) return bu;
  }

  return null;
}

// ── Resolve FK helpers ──────────────────────────────────────────────────────

function resolveCategoryId(
  conta: Record<string, unknown>,
  catLookup: LookupMap
): string | null {
  const codigoCat = conta.codigo_categoria || conta.codigo_categoria_str;
  if (codigoCat) {
    const resolved = catLookup.get(String(codigoCat));
    if (resolved) return resolved;
  }
  const categorias = conta.categorias as
    | Array<{ codigo_categoria?: string }>
    | undefined;
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
  const departamentos = conta.departamentos as
    | Array<{ codigo_departamento?: string }>
    | undefined;
  if (departamentos?.length) {
    const firstDep = departamentos[0]?.codigo_departamento;
    if (firstDep) {
      const resolved = ccLookup.get(String(firstDep));
      if (resolved) return resolved;
    }
  }
  const codigoDep = conta.codigo_departamento;
  if (codigoDep) {
    const resolved = ccLookup.get(String(codigoDep));
    if (resolved) return resolved;
  }
  return null;
}

// ── Sync contas a pagar (BATCH + prefixed omie_id) ─────────────────────────

async function syncContasPagar(
  supabase: SupabaseClient,
  tenantId: string,
  creds: OmieCredentials,
  userId: string,
  catLookup: LookupMap,
  ccLookup: LookupMap,
  ccInfoLookup: CostCenterInfoMap,
  baLookup: LookupMap,
  startTime: number
): Promise<SyncResult> {
  const errors: string[] = [];
  const allRecords: Record<string, unknown>[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      if (!hasTimeRemaining(startTime)) {
        console.log("[sync-omie] Contas a Pagar — aborting, time limit approaching");
        errors.push("Contas a pagar: abortado por limite de tempo");
        break;
      }

      console.log(`[sync-omie] Contas a Pagar — page ${page}...`);

      const data = await omieCall(
        creds,
        "financas/contapagar/",
        "ListarContasPagar",
        [{ pagina: page, registros_por_pagina: PAGE_SIZE }]
      );

      const contas = (data.conta_pagar_cadastro || []) as Array<Record<string, unknown>>;
      const totalRecords = (data.total_de_registros as number) || 0;
      console.log(
        `[sync-omie] Contas a Pagar — page ${page}: ${contas.length} records (total: ${totalRecords})`
      );

      for (const conta of contas) {
        const rawOmieId = String(conta.codigo_lancamento_omie || "");
        if (!rawOmieId) continue;

        // PREFIXED omie_id to avoid collision with receivables
        const omieId = `payable_${rawOmieId}`;

        let status = "previsto";
        const statusOmie = String(conta.status_titulo || "").toLowerCase();
        if (statusOmie === "liquidado" || statusOmie === "pago") status = "pago";
        else if (statusOmie === "atrasado" || statusOmie === "vencido") status = "atrasado";
        else if (statusOmie === "cancelado") status = "cancelado";

        const bankAccountOmieId = conta.codigo_conta_corrente
          ? String(conta.codigo_conta_corrente)
          : null;

        allRecords.push({
          tenant_id: tenantId,
          type: "despesa",
          status,
          description: String(conta.observacao || conta.complemento || "Conta a pagar"),
          amount: Number(conta.valor_documento || 0),
          paid_amount: Number(conta.valor_pago || 0),
          date:
            parseOmieDate(conta.data_emissao) ||
            parseOmieDate(conta.data_vencimento) ||
            new Date().toISOString().split("T")[0],
          due_date: parseOmieDate(conta.data_vencimento),
          paid_date: parseOmieDate(conta.data_pagamento),
          counterpart: conta.nome_fornecedor ? String(conta.nome_fornecedor) : null,
          counterpart_doc: conta.cnpj_cpf_fornecedor ? String(conta.cnpj_cpf_fornecedor) : null,
          category_id: resolveCategoryId(conta, catLookup),
          cost_center_id: resolveCostCenterId(conta, ccLookup),
          business_unit: deriveBUFromCostCenter(conta, ccInfoLookup),
          bank_account: bankAccountOmieId,
          bank_account_id: bankAccountOmieId ? (baLookup.get(bankAccountOmieId) ?? null) : null,
          payment_method: conta.id_meio_pagamento ? String(conta.id_meio_pagamento) : null,
          omie_id: omieId,
          omie_synced_at: new Date().toISOString(),
          omie_raw: conta,
          omie_juros: Number(conta.nValorJuros || 0),
          omie_multa: Number(conta.nValorMulta || 0),
          omie_desconto: Number(conta.nValorDesconto || 0),
          omie_num_titulo: conta.cNumTitulo ? String(conta.cNumTitulo) : null,
          omie_categoria_codigo: conta.codigo_categoria ? String(conta.codigo_categoria) : null,
          omie_departamento_codigo: conta.codigo_departamento ? String(conta.codigo_departamento) : null,
          created_by: userId,
          updated_by: userId,
        });
      }

      const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
      hasMore = page < totalPages;
      page++;
      if (hasMore) await sleep(INTER_PAGE_DELAY_MS);
    }
  } catch (err) {
    errors.push(`Contas a pagar: ${err instanceof Error ? err.message : String(err)}`);
  }

  const result = await batchUpsert(supabase, "finance_transactions", allRecords, "tenant_id,omie_id");
  errors.push(...result.errors);

  console.log(`[sync-omie] Contas a Pagar done: ${result.inserted} upserted, ${errors.length} errors`);
  return { inserted: result.inserted, updated: 0, errors };
}

// ── Sync contas a receber (BATCH + prefixed omie_id) ───────────────────────

async function syncContasReceber(
  supabase: SupabaseClient,
  tenantId: string,
  creds: OmieCredentials,
  userId: string,
  catLookup: LookupMap,
  ccLookup: LookupMap,
  ccInfoLookup: CostCenterInfoMap,
  baLookup: LookupMap,
  startTime: number
): Promise<SyncResult> {
  const errors: string[] = [];
  const allRecords: Record<string, unknown>[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      if (!hasTimeRemaining(startTime)) {
        console.log("[sync-omie] Contas a Receber — aborting, time limit approaching");
        errors.push("Contas a receber: abortado por limite de tempo");
        break;
      }

      console.log(`[sync-omie] Contas a Receber — page ${page}...`);

      const data = await omieCall(
        creds,
        "financas/contareceber/",
        "ListarContasReceber",
        [{ pagina: page, registros_por_pagina: PAGE_SIZE }]
      );

      const contas = (data.conta_receber_cadastro || []) as Array<Record<string, unknown>>;
      const totalRecords = (data.total_de_registros as number) || 0;
      console.log(
        `[sync-omie] Contas a Receber — page ${page}: ${contas.length} records (total: ${totalRecords})`
      );

      for (const conta of contas) {
        const rawOmieId = String(conta.codigo_lancamento_omie || "");
        if (!rawOmieId) continue;

        // PREFIXED omie_id to avoid collision with payables
        const omieId = `receivable_${rawOmieId}`;

        let status = "previsto";
        const statusOmie = String(conta.status_titulo || "").toLowerCase();
        if (statusOmie === "liquidado" || statusOmie === "recebido") status = "pago";
        else if (statusOmie === "atrasado" || statusOmie === "vencido") status = "atrasado";
        else if (statusOmie === "cancelado") status = "cancelado";

        const bankAccountOmieId = conta.codigo_conta_corrente
          ? String(conta.codigo_conta_corrente)
          : null;

        allRecords.push({
          tenant_id: tenantId,
          type: "receita",
          status,
          description: String(conta.observacao || conta.complemento || "Conta a receber"),
          amount: Number(conta.valor_documento || 0),
          paid_amount: Number(conta.valor_recebido || conta.valor_pago || 0),
          date:
            parseOmieDate(conta.data_emissao) ||
            parseOmieDate(conta.data_vencimento) ||
            new Date().toISOString().split("T")[0],
          due_date: parseOmieDate(conta.data_vencimento),
          paid_date: parseOmieDate(conta.data_recebimento) || parseOmieDate(conta.data_pagamento),
          counterpart: conta.nome_cliente ? String(conta.nome_cliente) : null,
          counterpart_doc: conta.cnpj_cpf_cliente ? String(conta.cnpj_cpf_cliente) : null,
          category_id: resolveCategoryId(conta, catLookup),
          cost_center_id: resolveCostCenterId(conta, ccLookup),
          business_unit: deriveBUFromCostCenter(conta, ccInfoLookup),
          bank_account: bankAccountOmieId,
          bank_account_id: bankAccountOmieId ? (baLookup.get(bankAccountOmieId) ?? null) : null,
          payment_method: conta.id_meio_pagamento ? String(conta.id_meio_pagamento) : null,
          omie_id: omieId,
          omie_synced_at: new Date().toISOString(),
          omie_raw: conta,
          omie_juros: Number(conta.nValorJuros || 0),
          omie_multa: Number(conta.nValorMulta || 0),
          omie_desconto: Number(conta.nValorDesconto || 0),
          omie_num_titulo: conta.cNumTitulo ? String(conta.cNumTitulo) : null,
          omie_categoria_codigo: conta.codigo_categoria ? String(conta.codigo_categoria) : null,
          omie_departamento_codigo: conta.codigo_departamento ? String(conta.codigo_departamento) : null,
          created_by: userId,
          updated_by: userId,
        });
      }

      const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
      hasMore = page < totalPages;
      page++;
      if (hasMore) await sleep(INTER_PAGE_DELAY_MS);
    }
  } catch (err) {
    errors.push(`Contas a receber: ${err instanceof Error ? err.message : String(err)}`);
  }

  const result = await batchUpsert(supabase, "finance_transactions", allRecords, "tenant_id,omie_id");
  errors.push(...result.errors);

  console.log(`[sync-omie] Contas a Receber done: ${result.inserted} upserted, ${errors.length} errors`);
  return { inserted: result.inserted, updated: 0, errors };
}

// ── Phase 6: Sync extrato bancário → finance_bank_statements (NEW) ─────────

async function syncExtratoBancario(
  supabase: SupabaseClient,
  tenantId: string,
  creds: OmieCredentials,
  baLookup: LookupMap,
  startTime: number
): Promise<SyncResult> {
  const errors: string[] = [];
  const allRecords: Record<string, unknown>[] = [];

  // Get all bank accounts with their omie_id (nCodCC)
  const bankAccounts = Array.from(baLookup.entries()); // [omie_id, uuid][]

  if (bankAccounts.length === 0) {
    console.log("[sync-omie] Extrato — no bank accounts to sync");
    return { inserted: 0, updated: 0, errors: [] };
  }

  // Historical: from 2020-01-01 to today
  const startDate = new Date("2020-01-01");
  const endDate = new Date();

  for (const [bankOmieId, bankUuid] of bankAccounts) {
    if (!hasTimeRemaining(startTime)) {
      console.log("[sync-omie] Extrato — aborting, time limit approaching");
      errors.push("Extrato: abortado por limite de tempo");
      break;
    }

    console.log(`[sync-omie] Extrato — bank account ${bankOmieId}...`);

    try {
      // Omie ListarExtrato uses periods, not pagination
      // We split into yearly chunks to handle large histories
      let currentStart = new Date(startDate);

      while (currentStart < endDate) {
        if (!hasTimeRemaining(startTime)) break;

        const currentEnd = new Date(
          Math.min(
            new Date(currentStart.getFullYear() + 1, 0, 1).getTime(),
            endDate.getTime()
          )
        );

        console.log(
          `[sync-omie] Extrato ${bankOmieId}: ${formatOmieDateParam(currentStart)} → ${formatOmieDateParam(currentEnd)}`
        );

        try {
          const data = await omieCall(
            creds,
            "financas/extrato/",
            "ListarExtrato",
            [
              {
                nCodCC: Number(bankOmieId),
                dPeriodoInicial: formatOmieDateParam(currentStart),
                dPeriodoFinal: formatOmieDateParam(currentEnd),
              },
            ]
          );

          const movimentos = (data.extrato || data.movimentos || []) as Array<
            Record<string, unknown>
          >;

          console.log(
            `[sync-omie] Extrato ${bankOmieId}: ${movimentos.length} movements`
          );

          for (const mov of movimentos) {
            const nCodMov = mov.nCodMov || mov.nCodMovCC || mov.nIdMov;
            if (!nCodMov) continue;

            const omieId = `extrato_${bankOmieId}_${nCodMov}`;
            const valor = Number(mov.nValor || mov.nValorMov || 0);
            const isCredit = valor >= 0;

            allRecords.push({
              tenant_id: tenantId,
              bank_account_id: bankUuid,
              omie_id: omieId,
              date: parseOmieDate(mov.dMov || mov.dDataMov) || new Date().toISOString().split("T")[0],
              description: String(
                mov.cDescMov || mov.cDescricao || mov.cObs || "Movimento"
              ),
              amount: Math.abs(valor),
              balance: mov.nSaldo != null ? Number(mov.nSaldo) : null,
              type: isCredit ? "credit" : "debit",
              category: mov.cCategoria ? String(mov.cCategoria) : null,
              document_number: mov.cDocumento ? String(mov.cDocumento) : null,
              omie_raw: mov,
            });
          }
        } catch (err) {
          // Some accounts may not have extrato — skip gracefully
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("Não existem registros") || msg.includes("Nao existem")) {
            console.log(`[sync-omie] Extrato ${bankOmieId}: no records for period`);
          } else {
            errors.push(`Extrato ${bankOmieId}: ${msg}`);
          }
        }

        currentStart = currentEnd;
        await sleep(INTER_PAGE_DELAY_MS);
      }
    } catch (err) {
      errors.push(
        `Extrato ${bankOmieId}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  if (allRecords.length > 0) {
    const result = await batchUpsert(
      supabase,
      "finance_bank_statements",
      allRecords,
      "tenant_id,omie_id"
    );
    errors.push(...result.errors);

    console.log(
      `[sync-omie] Extrato done: ${result.inserted} upserted, ${errors.length} errors`
    );
    return { inserted: result.inserted, updated: 0, errors };
  }

  console.log(`[sync-omie] Extrato done: 0 records, ${errors.length} errors`);
  return { inserted: 0, updated: 0, errors };
}

// ── POST /api/finance/sync-omie ───────────────────────────────────────────────

export async function POST() {
  const startedAt = new Date().toISOString();
  const startTime = Date.now();

  let vendorsSynced = 0;
  let clientsSynced = 0;
  let bankAccountsSynced = 0;
  let categoriesSynced = 0;
  let payablesSynced = 0;
  let receivablesSynced = 0;
  let extratoSynced = 0;
  const syncErrors: SyncLogError[] = [];

  let syncLogId: string | null = null;
  let responsePayload: Record<string, unknown> = {};
  let responseStatus = 200;

  const supabase = await createClient();

  try {
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
    const { data: config } = await (supabase as never as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: string) => { eq: (c: string, v: string) => { eq: (c: string, v: boolean) => { maybeSingle: () => Promise<{ data: { settings: { app_key?: string; app_secret?: string } } | null }> } } } } } })
      .from("integration_configs")
      .select("settings")
      .eq("tenant_id", tenantId)
      .eq("provider", "omie")
      .eq("is_active", true)
      .maybeSingle();

    const appKey = config?.settings?.app_key || process.env.OMIE_APP_KEY;
    const appSecret = config?.settings?.app_secret || process.env.OMIE_APP_SECRET;

    if (!appKey || !appSecret) {
      return NextResponse.json(
        { ok: false, error: "Credenciais Omie nao configuradas" },
        { status: 400 }
      );
    }

    const creds: OmieCredentials = { app_key: appKey, app_secret: appSecret };

    // INSERT sync log with status 'running'
    const { data: logRow } = await (supabase as never as { from: (t: string) => { insert: (d: unknown) => { select: (s: string) => { single: () => Promise<{ data: { id: string } | null }> } } } })
      .from("omie_sync_log")
      .insert({
        tenant_id: tenantId,
        status: "running",
        trigger_source: "manual",
        triggered_by: user.id,
        started_at: startedAt,
        vendors_synced: 0,
        clients_synced: 0,
        bank_accounts_synced: 0,
        categories_synced: 0,
        payables_synced: 0,
        receivables_synced: 0,
        extrato_synced: 0,
        errors: [],
      } as never)
      .select("id")
      .single();

    syncLogId = (logRow as { id: string } | null)?.id ?? null;

    console.log("[sync-omie] ════════════════════════════════════════════════");
    console.log("[sync-omie] Starting full sync for tenant:", tenantId);

    // ── Phase 0: Vendors + Clients ──────────────────────────────────────────
    console.log("[sync-omie] Phase 0a: Vendors...");
    const vendorResult = await syncVendors(supabase, tenantId, creds);
    vendorsSynced = vendorResult.inserted;
    vendorResult.errors.forEach((e) => syncErrors.push({ entity: "vendors", message: e }));
    await updateSyncProgress(supabase, syncLogId, {
      vendors_synced: vendorsSynced,
      errors: syncErrors,
    });

    await sleep(INTER_PHASE_DELAY_MS);

    console.log("[sync-omie] Phase 0b: Clients...");
    const clientResult = await syncClients(supabase, tenantId, creds);
    clientsSynced = clientResult.inserted;
    clientResult.errors.forEach((e) => syncErrors.push({ entity: "clients", message: e }));
    await updateSyncProgress(supabase, syncLogId, {
      clients_synced: clientsSynced,
      errors: syncErrors,
    });

    await sleep(INTER_PHASE_DELAY_MS);

    // ── Phase 1: Categories ─────────────────────────────────────────────────
    console.log("[sync-omie] Phase 1: Categories...");
    const catResult = await syncCategories(supabase, tenantId, creds);
    categoriesSynced = catResult.inserted;
    catResult.errors.forEach((e) => syncErrors.push({ entity: "categories", message: e }));
    await updateSyncProgress(supabase, syncLogId, {
      categories_synced: categoriesSynced,
      errors: syncErrors,
    });

    await sleep(INTER_PHASE_DELAY_MS);

    // ── Phase 2: Cost Centers ───────────────────────────────────────────────
    console.log("[sync-omie] Phase 2: Cost Centers (Departamentos)...");
    const ccResult = await syncCostCenters(supabase, tenantId, creds);
    ccResult.errors.forEach((e) => syncErrors.push({ entity: "cost_centers", message: e }));
    await updateSyncProgress(supabase, syncLogId, { errors: syncErrors });

    await sleep(INTER_PHASE_DELAY_MS);

    // ── Phase 3: Bank Accounts ──────────────────────────────────────────────
    console.log("[sync-omie] Phase 3: Bank Accounts...");
    const baResult = await syncBankAccounts(supabase, tenantId, creds);
    bankAccountsSynced = baResult.inserted;
    baResult.errors.forEach((e) => syncErrors.push({ entity: "bank_accounts", message: e }));
    await updateSyncProgress(supabase, syncLogId, {
      bank_accounts_synced: bankAccountsSynced,
      errors: syncErrors,
    });

    await sleep(INTER_PHASE_DELAY_MS);

    // ── Build lookup maps ───────────────────────────────────────────────────
    console.log("[sync-omie] Building lookup maps...");
    const catLookup = await buildCategoryLookup(supabase, tenantId);
    const ccLookup = await buildCostCenterLookup(supabase, tenantId);
    const ccInfoLookup = await buildCostCenterInfoLookup(supabase, tenantId);
    const baLookup = await buildBankAccountLookup(supabase, tenantId);
    console.log(
      `[sync-omie] Lookups: ${catLookup.size} categories, ${ccLookup.size} cost centers, ${baLookup.size} bank accounts`
    );

    // ── Phase 4: Contas a Pagar ─────────────────────────────────────────────
    console.log("[sync-omie] Phase 4: Contas a Pagar...");
    const cpResult = await syncContasPagar(
      supabase, tenantId, creds, user.id,
      catLookup, ccLookup, ccInfoLookup, baLookup, startTime
    );
    payablesSynced = cpResult.inserted;
    cpResult.errors.forEach((e) => syncErrors.push({ entity: "payables", message: e }));
    await updateSyncProgress(supabase, syncLogId, {
      payables_synced: payablesSynced,
      errors: syncErrors,
    });

    await sleep(INTER_PHASE_DELAY_MS);

    // ── Phase 5: Contas a Receber ───────────────────────────────────────────
    console.log("[sync-omie] Phase 5: Contas a Receber...");
    const crResult = await syncContasReceber(
      supabase, tenantId, creds, user.id,
      catLookup, ccLookup, ccInfoLookup, baLookup, startTime
    );
    receivablesSynced = crResult.inserted;
    crResult.errors.forEach((e) => syncErrors.push({ entity: "receivables", message: e }));
    await updateSyncProgress(supabase, syncLogId, {
      receivables_synced: receivablesSynced,
      errors: syncErrors,
    });

    await sleep(INTER_PHASE_DELAY_MS);

    // ── Phase 6: Extrato Bancário (NEW) ─────────────────────────────────────
    if (hasTimeRemaining(startTime)) {
      console.log("[sync-omie] Phase 6: Extrato Bancário...");
      const extResult = await syncExtratoBancario(
        supabase, tenantId, creds, baLookup, startTime
      );
      extratoSynced = extResult.inserted;
      extResult.errors.forEach((e) => syncErrors.push({ entity: "extrato", message: e }));
      await updateSyncProgress(supabase, syncLogId, {
        extrato_synced: extratoSynced,
        errors: syncErrors,
      });
    } else {
      console.log("[sync-omie] Phase 6: Extrato — skipped (time limit)");
      syncErrors.push({ entity: "extrato", message: "Skipped — time limit reached" });
    }

    const totalInserted =
      vendorsSynced + clientsSynced + bankAccountsSynced +
      categoriesSynced + ccResult.inserted + payablesSynced +
      receivablesSynced + extratoSynced;

    console.log("[sync-omie] ════════════════════════════════════════════════");
    console.log(
      `[sync-omie] Sync complete: ${totalInserted} total upserted, ${syncErrors.length} errors`
    );

    responsePayload = {
      ok: true,
      message: `Sync concluido: ${totalInserted} registros sincronizados`,
      totals: {
        vendors: vendorsSynced,
        clients: clientsSynced,
        bankAccounts: bankAccountsSynced,
        categories: categoriesSynced,
        costCenters: ccResult.inserted,
        payables: payablesSynced,
        receivables: receivablesSynced,
        extrato: extratoSynced,
      },
      errors: syncErrors.length > 0 ? syncErrors.slice(0, 20) : undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[finance/sync-omie] Error:", message);
    syncErrors.push({ entity: "handler", message });
    responsePayload = { ok: false, error: message };
    responseStatus = 500;
  } finally {
    if (syncLogId) {
      const finishedAt = new Date().toISOString();
      const durationMs = Date.now() - new Date(startedAt).getTime();

      await updateSyncProgress(supabase, syncLogId, {
        status:
          responseStatus >= 500
            ? "error"
            : syncErrors.length > 0
            ? "partial"
            : "success",
        finished_at: finishedAt,
        duration_ms: durationMs,
        vendors_synced: vendorsSynced,
        clients_synced: clientsSynced,
        bank_accounts_synced: bankAccountsSynced,
        categories_synced: categoriesSynced,
        payables_synced: payablesSynced,
        receivables_synced: receivablesSynced,
        extrato_synced: extratoSynced,
        errors: syncErrors,
      });
    }
  }

  return NextResponse.json(responsePayload, { status: responseStatus });
}
