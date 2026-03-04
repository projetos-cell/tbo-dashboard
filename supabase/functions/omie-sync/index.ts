// ============================================================================
// TBO OS — Edge Function: Omie ERP Sync v2
// Pulls data from Omie JSON-RPC API → upserts into Supabase
// Trigger: Manual call via API route
// Query params: ?tenant_id=xxx (optional, syncs all if omitted)
//               ?trigger=manual|webhook
//
// Entities synced (5):
//   1. Fornecedores     → fin_vendors
//   2. Clientes         → fin_clients
//   3. Contas a Pagar   → fin_payables
//   4. Contas a Receber → fin_receivables
//   5. Contas Correntes → fin_bank_accounts
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OMIE_BASE_URL = "https://app.omie.com.br/api/v1";
const RATE_LIMIT_MS = 600; // ~1.67 req/s (Omie limit is 3 req/s)
const MAX_RETRIES = 3;

// ── Types ────────────────────────────────────────────────────────────────────

interface OmieCredentials {
  app_key: string;
  app_secret: string;
}

interface SyncCounts {
  vendors_synced: number;
  clients_synced: number;
  payables_synced: number;
  receivables_synced: number;
  bank_accounts_synced: number;
}

interface SyncError {
  entity: string;
  message: string;
  page?: number;
}

// ── Main Handler ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  const startTime = Date.now();

  try {
    const url = new URL(req.url);
    const targetTenantId = url.searchParams.get("tenant_id");
    const triggerSource = url.searchParams.get("trigger") || "manual";

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Get all tenants with Omie integration configured
    let configQuery = supabase
      .from("integration_configs")
      .select("tenant_id, settings")
      .eq("provider", "omie")
      .eq("is_active", true);

    if (targetTenantId) {
      configQuery = configQuery.eq("tenant_id", targetTenantId);
    }

    const { data: configs, error: cfgError } = await configQuery;
    if (cfgError || !configs || configs.length === 0) {
      return jsonResponse({
        message: "Nenhuma integracao Omie configurada",
        error: cfgError?.message,
      });
    }

    const results: Record<string, { counts: SyncCounts; errors: SyncError[] }> = {};

    for (const cfg of configs) {
      const creds = cfg.settings as OmieCredentials | null;
      if (!creds?.app_key || !creds?.app_secret) {
        console.warn(`[omie-sync] Tenant ${cfg.tenant_id}: missing app_key/app_secret`);
        continue;
      }

      const tenantId = cfg.tenant_id;
      const counts: SyncCounts = {
        vendors_synced: 0,
        clients_synced: 0,
        payables_synced: 0,
        receivables_synced: 0,
        bank_accounts_synced: 0,
      };
      const errors: SyncError[] = [];

      // Create sync log entry (status: running)
      const { data: logEntry } = await supabase
        .from("omie_sync_log")
        .insert({
          tenant_id: tenantId,
          status: "running",
          trigger_source: triggerSource,
        })
        .select("id")
        .single();

      const logId = logEntry?.id;

      try {
        // Sync in order: Fornecedores → Clientes → Pagar → Receber → Contas Correntes
        counts.vendors_synced = await syncVendors(supabase, creds, tenantId, errors);
        counts.clients_synced = await syncClients(supabase, creds, tenantId, errors);
        counts.payables_synced = await syncPayables(supabase, creds, tenantId, errors);
        counts.receivables_synced = await syncReceivables(supabase, creds, tenantId, errors);
        counts.bank_accounts_synced = await syncBankAccounts(supabase, creds, tenantId, errors);

        // Update sync log: success or partial
        if (logId) {
          await supabase.from("omie_sync_log").update({
            finished_at: new Date().toISOString(),
            status: errors.length > 0 ? "partial" : "success",
            vendors_synced: counts.vendors_synced,
            clients_synced: counts.clients_synced,
            payables_synced: counts.payables_synced,
            receivables_synced: counts.receivables_synced,
            bank_accounts_synced: counts.bank_accounts_synced,
            errors: errors.length > 0 ? errors : [],
            duration_ms: Date.now() - startTime,
          }).eq("id", logId);
        }
      } catch (e) {
        // Fatal error for this tenant
        if (logId) {
          await supabase.from("omie_sync_log").update({
            finished_at: new Date().toISOString(),
            status: "error",
            errors: [{ entity: "global", message: e.message }],
            duration_ms: Date.now() - startTime,
          }).eq("id", logId);
        }
        errors.push({ entity: "global", message: e.message });
      }

      results[tenantId] = { counts, errors };
    }

    return jsonResponse({ message: "Sync concluido", results, duration_ms: Date.now() - startTime });
  } catch (err) {
    console.error("[omie-sync] Fatal:", err);
    return jsonResponse({ error: err.message }, 500);
  }
});

// ── Entity Sync Functions ────────────────────────────────────────────────────

async function syncVendors(
  supabase: SupabaseClient,
  creds: OmieCredentials,
  tenantId: string,
  errors: SyncError[]
): Promise<number> {
  let total = 0;
  let page = 1;
  const pageSize = 50;

  try {
    while (true) {
      const res = await omieCall(creds, "geral/clientes/", "ListarClientes", {
        pagina: page,
        registros_por_pagina: pageSize,
        clientesFiltro: { tags: [{ tag: "Fornecedor" }] },
      });

      const records = res?.clientes_cadastro || [];
      if (records.length === 0) break;

      for (const v of records) {
        try {
          const omieId = String(v.codigo_cliente_omie || "");
          if (!omieId) continue;

          await supabase.from("fin_vendors").upsert({
            tenant_id: tenantId,
            omie_id: omieId,
            name: cleanName(v.nome_fantasia || v.razao_social || `Fornecedor ${omieId}`),
            cnpj: v.cnpj_cpf || null,
            email: v.email || null,
            phone: v.telefone1_ddd && v.telefone1_numero
              ? `(${v.telefone1_ddd}) ${v.telefone1_numero}`
              : null,
            is_active: v.inativo !== "S",
            omie_synced_at: new Date().toISOString(),
          }, { onConflict: "tenant_id,omie_id" });

          total++;
        } catch (e) {
          errors.push({ entity: "vendors", message: e.message, page });
        }
      }

      if (records.length < pageSize) break;
      page++;
      await delay(RATE_LIMIT_MS);
    }
  } catch (e) {
    errors.push({ entity: "vendors", message: e.message });
  }

  console.log(`[omie-sync] Vendors: ${total} synced`);
  return total;
}

async function syncClients(
  supabase: SupabaseClient,
  creds: OmieCredentials,
  tenantId: string,
  errors: SyncError[]
): Promise<number> {
  let total = 0;
  let page = 1;
  const pageSize = 50;

  try {
    while (true) {
      const res = await omieCall(creds, "geral/clientes/", "ListarClientes", {
        pagina: page,
        registros_por_pagina: pageSize,
      });

      const records = res?.clientes_cadastro || [];
      if (records.length === 0) break;

      for (const c of records) {
        try {
          // Skip vendors (tagged as "Fornecedor")
          const tags = c.tags || [];
          const isVendor = tags.some((t: { tag?: string }) =>
            (t.tag || "").toLowerCase() === "fornecedor"
          );
          if (isVendor) continue;

          const omieId = String(c.codigo_cliente_omie || "");
          if (!omieId) continue;

          await supabase.from("fin_clients").upsert({
            tenant_id: tenantId,
            omie_id: omieId,
            name: cleanName(c.nome_fantasia || c.razao_social || `Cliente ${omieId}`),
            cnpj: c.cnpj_cpf || null,
            email: c.email || null,
            phone: c.telefone1_ddd && c.telefone1_numero
              ? `(${c.telefone1_ddd}) ${c.telefone1_numero}`
              : null,
            contact_name: c.contato || null,
            is_active: c.inativo !== "S",
            omie_synced_at: new Date().toISOString(),
          }, { onConflict: "tenant_id,omie_id" });

          total++;
        } catch (e) {
          errors.push({ entity: "clients", message: e.message, page });
        }
      }

      if (records.length < pageSize) break;
      page++;
      await delay(RATE_LIMIT_MS);
    }
  } catch (e) {
    errors.push({ entity: "clients", message: e.message });
  }

  console.log(`[omie-sync] Clients: ${total} synced`);
  return total;
}

async function syncPayables(
  supabase: SupabaseClient,
  creds: OmieCredentials,
  tenantId: string,
  errors: SyncError[]
): Promise<number> {
  let total = 0;
  let page = 1;
  const pageSize = 50;

  try {
    while (true) {
      const res = await omieCall(creds, "financas/contapagar/", "ListarContasPagar", {
        pagina: page,
        registros_por_pagina: pageSize,
      });

      const records = res?.conta_pagar_cadastro || [];
      if (records.length === 0) break;

      for (const p of records) {
        try {
          const omieId = String(p.codigo_lancamento_omie || "");
          if (!omieId) continue;

          // Resolve vendor by omie_id
          let vendorId: string | null = null;
          if (p.codigo_cliente_fornecedor) {
            const { data: vendor } = await supabase
              .from("fin_vendors")
              .select("id")
              .eq("tenant_id", tenantId)
              .eq("omie_id", String(p.codigo_cliente_fornecedor))
              .maybeSingle();
            vendorId = vendor?.id || null;
          }

          // Resolve category by omie_id
          let categoryId: string | null = null;
          if (p.codigo_categoria) {
            const { data: cat } = await supabase
              .from("fin_categories")
              .select("id")
              .eq("tenant_id", tenantId)
              .eq("omie_id", String(p.codigo_categoria))
              .maybeSingle();
            categoryId = cat?.id || null;
          }

          await supabase.from("fin_payables").upsert({
            tenant_id: tenantId,
            omie_id: omieId,
            description: p.observacao || p.numero_documento || `Conta ${omieId}`,
            amount: parseFloat(p.valor_documento) || 0,
            amount_paid: parseFloat(p.valor_pago) || 0,
            due_date: omieDate(p.data_vencimento),
            paid_date: p.data_pagamento ? omieDate(p.data_pagamento) : null,
            status: mapPayableStatus(p.status_titulo),
            vendor_id: vendorId,
            category_id: categoryId,
            payment_method: p.id_conta_corrente ? "transferencia" : null,
            notes: p.observacao || null,
            omie_synced_at: new Date().toISOString(),
          }, { onConflict: "tenant_id,omie_id" });

          total++;
        } catch (e) {
          errors.push({ entity: "payables", message: e.message, page });
        }
      }

      if (records.length < pageSize) break;
      page++;
      await delay(RATE_LIMIT_MS);
    }
  } catch (e) {
    errors.push({ entity: "payables", message: e.message });
  }

  console.log(`[omie-sync] Payables: ${total} synced`);
  return total;
}

async function syncReceivables(
  supabase: SupabaseClient,
  creds: OmieCredentials,
  tenantId: string,
  errors: SyncError[]
): Promise<number> {
  let total = 0;
  let page = 1;
  const pageSize = 50;

  try {
    while (true) {
      const res = await omieCall(creds, "financas/contareceber/", "ListarContasReceber", {
        pagina: page,
        registros_por_pagina: pageSize,
      });

      const records = res?.conta_receber_cadastro || [];
      if (records.length === 0) break;

      for (const r of records) {
        try {
          const omieId = String(r.codigo_lancamento_omie || "");
          if (!omieId) continue;

          // Resolve client by omie_id
          let clientId: string | null = null;
          if (r.codigo_cliente_fornecedor) {
            const { data: client } = await supabase
              .from("fin_clients")
              .select("id")
              .eq("tenant_id", tenantId)
              .eq("omie_id", String(r.codigo_cliente_fornecedor))
              .maybeSingle();
            clientId = client?.id || null;
          }

          // Resolve category by omie_id
          let categoryId: string | null = null;
          if (r.codigo_categoria) {
            const { data: cat } = await supabase
              .from("fin_categories")
              .select("id")
              .eq("tenant_id", tenantId)
              .eq("omie_id", String(r.codigo_categoria))
              .maybeSingle();
            categoryId = cat?.id || null;
          }

          await supabase.from("fin_receivables").upsert({
            tenant_id: tenantId,
            omie_id: omieId,
            description: r.observacao || r.numero_documento || `Recebivel ${omieId}`,
            amount: parseFloat(r.valor_documento) || 0,
            amount_paid: parseFloat(r.valor_recebido) || 0,
            due_date: omieDate(r.data_vencimento),
            paid_date: r.data_recebimento ? omieDate(r.data_recebimento) : null,
            status: mapReceivableStatus(r.status_titulo),
            client_id: clientId,
            category_id: categoryId,
            payment_method: r.id_conta_corrente ? "transferencia" : null,
            notes: r.observacao || null,
            omie_synced_at: new Date().toISOString(),
          }, { onConflict: "tenant_id,omie_id" });

          total++;
        } catch (e) {
          errors.push({ entity: "receivables", message: e.message, page });
        }
      }

      if (records.length < pageSize) break;
      page++;
      await delay(RATE_LIMIT_MS);
    }
  } catch (e) {
    errors.push({ entity: "receivables", message: e.message });
  }

  console.log(`[omie-sync] Receivables: ${total} synced`);
  return total;
}

async function syncBankAccounts(
  supabase: SupabaseClient,
  creds: OmieCredentials,
  tenantId: string,
  errors: SyncError[]
): Promise<number> {
  let total = 0;
  let page = 1;
  const pageSize = 50;

  try {
    while (true) {
      const res = await omieCall(creds, "financas/contacorrente/", "ListarContasCorrentes", {
        pagina: page,
        registros_por_pagina: pageSize,
      });

      const records = res?.ListarContasCorrentes || res?.conta_corrente_lista || [];
      if (records.length === 0) break;

      for (const acc of records) {
        try {
          const omieId = String(acc.nCodCC || "");
          if (!omieId) continue;

          // Map Omie account type to our type
          const tipoCC = (acc.tipo_conta_corrente || "CC").toUpperCase();
          let accountType = "corrente";
          if (tipoCC === "CP" || tipoCC.includes("POUPAN")) accountType = "poupanca";
          else if (tipoCC === "CI" || tipoCC.includes("INVEST")) accountType = "investimento";

          await supabase.from("fin_bank_accounts").upsert({
            tenant_id: tenantId,
            omie_id: omieId,
            name: acc.descricao || acc.cDescricao || `Conta ${omieId}`,
            bank_code: acc.codigo_banco || acc.cCodBanco || null,
            bank_name: acc.descricao_banco || acc.cNomeBanco || null,
            agency: acc.agencia || acc.cAgencia || null,
            account_number: acc.conta_corrente || acc.cContaCorrente || acc.nro_conta_corrente || null,
            account_type: accountType,
            balance: parseFloat(acc.saldo || acc.nSaldo || "0") || 0,
            is_active: acc.inativo !== "S" && acc.cInativo !== "S",
            omie_synced_at: new Date().toISOString(),
          }, { onConflict: "tenant_id,omie_id" });

          total++;
        } catch (e) {
          errors.push({ entity: "bank_accounts", message: e.message, page });
        }
      }

      if (records.length < pageSize) break;
      page++;
      await delay(RATE_LIMIT_MS);
    }
  } catch (e) {
    errors.push({ entity: "bank_accounts", message: e.message });
  }

  console.log(`[omie-sync] Bank accounts: ${total} synced`);
  return total;
}

// ── Omie API Helper ──────────────────────────────────────────────────────────

async function omieCall(
  creds: OmieCredentials,
  endpoint: string,
  call: string,
  params: Record<string, unknown>,
  retries = MAX_RETRIES
): Promise<any> {
  const url = `${OMIE_BASE_URL}/${endpoint}`;
  const body = {
    call,
    app_key: creds.app_key,
    app_secret: creds.app_secret,
    param: [params],
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await delay(RATE_LIMIT_MS);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();

        // Rate limited — wait and retry
        if (res.status === 429 || res.status === 503) {
          const waitMs = Math.min(2000 * Math.pow(2, attempt - 1), 16000);
          console.warn(`[omie-sync] Rate limited on ${call}, waiting ${waitMs}ms (attempt ${attempt})`);
          await delay(waitMs);
          continue;
        }

        throw new Error(`Omie ${call} HTTP ${res.status}: ${text.slice(0, 200)}`);
      }

      return res.json();
    } catch (e) {
      if (attempt === retries) throw e;

      // Exponential backoff for network errors
      const waitMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
      console.warn(`[omie-sync] Retry ${attempt}/${retries} for ${call}: ${e.message}`);
      await delay(waitMs);
    }
  }
}

// ── Mapping Helpers ──────────────────────────────────────────────────────────

/** Convert Omie date "DD/MM/YYYY" → "YYYY-MM-DD" */
function omieDate(dateStr: string | null | undefined): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return dateStr; // Already ISO or unknown format
}

/** Map Omie payable status_titulo → TBO status */
function mapPayableStatus(omieStatus: string | null | undefined): string {
  const s = (omieStatus || "").toUpperCase();
  if (s === "LIQUIDADO" || s === "PAGO") return "pago";
  if (s === "ATRASADO" || s === "VENCIDO") return "atrasado";
  if (s === "CANCELADO") return "cancelado";
  if (s === "PARCIAL" || s === "PARCIALMENTE_LIQUIDADO") return "parcial";
  if (s === "APROVADO") return "aprovado";
  return "aberto";
}

/** Map Omie receivable status_titulo → TBO status */
function mapReceivableStatus(omieStatus: string | null | undefined): string {
  const s = (omieStatus || "").toUpperCase();
  if (s === "LIQUIDADO" || s === "RECEBIDO") return "recebido";
  if (s === "ATRASADO" || s === "VENCIDO") return "atrasado";
  if (s === "CANCELADO") return "cancelado";
  if (s === "PARCIAL" || s === "PARCIALMENTE_LIQUIDADO") return "parcial";
  if (s === "EMITIDO" || s === "FATURADO") return "emitido";
  return "aberto";
}

/** Strip trailing CNPJ/CPF numbers and trim */
function cleanName(name: string): string {
  return name
    .replace(/\s*[-–]\s*\d{2,3}\.\d{3}\.\d{3}[\/\-]?\d{0,4}[-]?\d{0,2}\s*$/, "")
    .replace(/\s*[-–]\s*\d{11,14}\s*$/, "")
    .trim();
}

/** Promise-based delay */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** JSON response helper */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
