import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getOmieCredentials,
  fetchFornecedores,
  fetchClientes,
  fetchContasPagar,
  fetchContasReceber,
} from "@/lib/omie-client";

// ── Helpers ──────────────────────────────────────────────────────

/** Convert Omie DD/MM/YYYY → ISO YYYY-MM-DD */
function omieDate(str: string | null | undefined): string | null {
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  const parts = str.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]!.padStart(2, "0")}-${parts[0]!.padStart(2, "0")}`;
  }
  return null;
}

/** Map Omie status → TBO status */
function mapStatus(omieStatus: string | null | undefined): string {
  if (!omieStatus) return "aberto";
  const s = omieStatus.toUpperCase().trim();
  if (s === "LIQUIDADO" || s === "PAGO" || s === "RECEBIDO") return "pago";
  if (s === "ATRASADO" || s === "VENCIDO") return "atrasado";
  if (s === "CANCELADO") return "cancelado";
  if (s === "PARCIAL") return "parcial";
  return "aberto";
}

/** Clean vendor/client name — strip trailing CNPJ/CPF */
function cleanName(name: string | null | undefined): string {
  if (!name) return "Sem nome";
  let clean = name
    .replace(/\s*\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\s*$/, "")
    .replace(/\s*\d{3}\.\d{3}\.\d{3}-\d{2}\s*$/, "")
    .replace(/\s+\d{11,14}\s*$/, "")
    .trim();
  return clean || name;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

// ── POST /api/omie-sync ─────────────────────────────────────────

export async function POST() {
  // ── Auth ──
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  // ── Resolve tenant_id ──
  const { data: profile } = await supabase
    .from("profiles" as never)
    .select("tenant_id" as never)
    .eq("id" as never, user.id as never)
    .single();

  const tenantId = (profile as unknown as AnyRecord)?.tenant_id as string | undefined;
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant nao encontrado" }, { status: 400 });
  }

  // ── Omie credentials ──
  const creds = getOmieCredentials();
  if (!creds) {
    return NextResponse.json(
      { error: "Credenciais Omie nao configuradas (OMIE_APP_KEY / OMIE_APP_SECRET)" },
      { status: 400 }
    );
  }

  // ── Create sync log entry ──
  let syncLogId: string | null = null;
  try {
    const { data: logRow } = await supabase
      .from("omie_sync_log" as never)
      .insert({
        tenant_id: tenantId,
        status: "running",
        triggered_by: user.id,
      } as never)
      .select("id" as never)
      .single();
    syncLogId = (logRow as unknown as AnyRecord)?.id ?? null;
  } catch {
    // tolerate missing table
  }

  const result = {
    vendors_synced: 0,
    clients_synced: 0,
    payables_synced: 0,
    receivables_synced: 0,
    total: 0,
    errors: 0,
    duration_ms: 0,
  };
  const allErrors: { entity: string; omie_id?: string; message: string }[] = [];
  const startTime = Date.now();

  try {
    // ═══════════════════════════════════════════════════════════
    // 1. VENDORS (Fornecedores)
    // ═══════════════════════════════════════════════════════════
    try {
      const raw = await fetchFornecedores(creds);
      for (const item of raw as AnyRecord[]) {
        try {
          const omieId = String(item.codigo_cliente_omie || item.codigo_cliente_integracao || "");
          if (!omieId) continue;

          await supabase
            .from("fin_vendors" as never)
            .upsert(
              {
                tenant_id: tenantId,
                omie_id: omieId,
                name: cleanName(item.nome_fantasia || item.razao_social),
                cnpj: item.cnpj_cpf || null,
                email: item.email || null,
                phone: item.telefone1_numero || null,
                category: "fornecedor",
                notes: item.razao_social ? `Razao Social: ${item.razao_social}` : null,
                omie_synced_at: new Date().toISOString(),
                is_active: true,
              } as never,
              { onConflict: "tenant_id,omie_id" as never } as never
            );
          result.vendors_synced++;
        } catch (e) {
          allErrors.push({
            entity: "vendor",
            omie_id: String(item.codigo_cliente_omie || ""),
            message: e instanceof Error ? e.message : String(e),
          });
        }
      }
    } catch (e) {
      allErrors.push({ entity: "vendors", message: e instanceof Error ? e.message : String(e) });
    }

    // ═══════════════════════════════════════════════════════════
    // 2. CLIENTS (Clientes)
    // ═══════════════════════════════════════════════════════════
    try {
      const raw = await fetchClientes(creds);
      const clientesOnly = (raw as AnyRecord[]).filter((c) => {
        const tags = (c.tags || []).map((t: AnyRecord) => (t.tag || "").toLowerCase());
        return !tags.includes("fornecedor");
      });

      for (const item of clientesOnly) {
        try {
          const omieId = String(item.codigo_cliente_omie || item.codigo_cliente_integracao || "");
          if (!omieId) continue;

          await supabase
            .from("fin_clients" as never)
            .upsert(
              {
                tenant_id: tenantId,
                omie_id: omieId,
                name: cleanName(item.nome_fantasia || item.razao_social),
                cnpj: item.cnpj_cpf || null,
                email: item.email || null,
                phone: item.telefone1_numero || null,
                contact_name: item.nome_fantasia ? cleanName(item.nome_fantasia) : null,
                omie_synced_at: new Date().toISOString(),
                is_active: true,
              } as never,
              { onConflict: "tenant_id,omie_id" as never } as never
            );
          result.clients_synced++;
        } catch (e) {
          allErrors.push({
            entity: "client",
            omie_id: String(item.codigo_cliente_omie || ""),
            message: e instanceof Error ? e.message : String(e),
          });
        }
      }
    } catch (e) {
      allErrors.push({ entity: "clients", message: e instanceof Error ? e.message : String(e) });
    }

    // ═══════════════════════════════════════════════════════════
    // 3. PAYABLES (Contas a Pagar)
    // ═══════════════════════════════════════════════════════════
    try {
      const raw = await fetchContasPagar(creds);
      const vendorCache: Record<string, string | null> = {};

      for (const cp of raw as AnyRecord[]) {
        try {
          const omieId = String(cp.codigo_lancamento_omie || cp.codigo_lancamento_integracao || "");
          if (!omieId) continue;

          // Resolve vendor FK
          let vendorId: string | null = null;
          const vendorOmieId = String(cp.codigo_cliente_fornecedor || "");
          if (vendorOmieId && vendorOmieId !== "0") {
            if (vendorCache[vendorOmieId] !== undefined) {
              vendorId = vendorCache[vendorOmieId]!;
            } else {
              const { data: vendor } = await supabase
                .from("fin_vendors" as never)
                .select("id" as never)
                .eq("tenant_id" as never, tenantId as never)
                .eq("omie_id" as never, vendorOmieId as never)
                .maybeSingle();
              vendorId = (vendor as unknown as AnyRecord)?.id ?? null;
              vendorCache[vendorOmieId] = vendorId;
            }
          }

          const dueDate = omieDate(cp.data_vencimento);
          const paidDate = omieDate(cp.data_pagamento);
          const status = mapStatus(cp.status_titulo);
          const amount = parseFloat(cp.valor_documento) || 0;
          let amountPaid = parseFloat(cp.valor_pago) || 0;
          if (status === "pago" && amountPaid === 0 && amount > 0) {
            amountPaid = amount;
          }

          await supabase
            .from("fin_payables" as never)
            .upsert(
              {
                tenant_id: tenantId,
                omie_id: omieId,
                description: cp.observacao || cp.numero_documento || `Omie #${omieId}`,
                amount,
                amount_paid: amountPaid,
                due_date: dueDate,
                paid_date: paidDate,
                status,
                vendor_id: vendorId,
                notes: cp.numero_documento ? `Doc: ${cp.numero_documento}` : null,
                omie_synced_at: new Date().toISOString(),
              } as never,
              { onConflict: "tenant_id,omie_id" as never } as never
            );
          result.payables_synced++;
        } catch (e) {
          allErrors.push({
            entity: "payable",
            omie_id: String(cp.codigo_lancamento_omie || ""),
            message: e instanceof Error ? e.message : String(e),
          });
        }
      }
    } catch (e) {
      allErrors.push({ entity: "payables", message: e instanceof Error ? e.message : String(e) });
    }

    // ═══════════════════════════════════════════════════════════
    // 4. RECEIVABLES (Contas a Receber)
    // ═══════════════════════════════════════════════════════════
    try {
      const raw = await fetchContasReceber(creds);
      const clientCache: Record<string, string | null> = {};

      for (const cr of raw as AnyRecord[]) {
        try {
          const omieId = String(cr.codigo_lancamento_omie || cr.codigo_lancamento_integracao || "");
          if (!omieId) continue;

          // Resolve client FK
          let clientId: string | null = null;
          const clientOmieId = String(cr.codigo_cliente_fornecedor || "");
          if (clientOmieId && clientOmieId !== "0") {
            if (clientCache[clientOmieId] !== undefined) {
              clientId = clientCache[clientOmieId]!;
            } else {
              // Try fin_clients first
              const { data: client } = await supabase
                .from("fin_clients" as never)
                .select("id" as never)
                .eq("tenant_id" as never, tenantId as never)
                .eq("omie_id" as never, clientOmieId as never)
                .maybeSingle();

              if ((client as unknown as AnyRecord)?.id) {
                clientId = (client as unknown as AnyRecord).id;
              } else {
                // Fallback: check fin_vendors (same Omie ID)
                const { data: vendor } = await supabase
                  .from("fin_vendors" as never)
                  .select("id, name, cnpj, email, phone" as never)
                  .eq("tenant_id" as never, tenantId as never)
                  .eq("omie_id" as never, clientOmieId as never)
                  .maybeSingle();

                if ((vendor as unknown as AnyRecord)?.id) {
                  const v = vendor as unknown as AnyRecord;
                  // Create client record from vendor data
                  const { data: newClient } = await supabase
                    .from("fin_clients" as never)
                    .upsert(
                      {
                        tenant_id: tenantId,
                        omie_id: clientOmieId,
                        name: v.name,
                        cnpj: v.cnpj || null,
                        email: v.email || null,
                        phone: v.phone || null,
                        contact_name: v.name,
                        omie_synced_at: new Date().toISOString(),
                        is_active: true,
                      } as never,
                      { onConflict: "tenant_id,omie_id" as never } as never
                    )
                    .select("id" as never)
                    .single();
                  clientId = (newClient as unknown as AnyRecord)?.id ?? null;
                }
              }
              clientCache[clientOmieId] = clientId;
            }
          }

          const dueDate = omieDate(cr.data_vencimento);
          const paidDate = omieDate(cr.data_pagamento);
          const status = mapStatus(cr.status_titulo);
          const amount = parseFloat(cr.valor_documento) || 0;
          let amountPaid = parseFloat(cr.valor_pago) || 0;
          if (status === "pago" && amountPaid === 0 && amount > 0) {
            amountPaid = amount;
          }

          await supabase
            .from("fin_receivables" as never)
            .upsert(
              {
                tenant_id: tenantId,
                omie_id: omieId,
                description: cr.observacao || cr.numero_documento || `Omie #${omieId}`,
                amount,
                amount_paid: amountPaid,
                due_date: dueDate,
                paid_date: paidDate,
                status,
                client_id: clientId,
                notes: cr.numero_documento ? `Doc: ${cr.numero_documento}` : null,
                omie_synced_at: new Date().toISOString(),
              } as never,
              { onConflict: "tenant_id,omie_id" as never } as never
            );
          result.receivables_synced++;
        } catch (e) {
          allErrors.push({
            entity: "receivable",
            omie_id: String(cr.codigo_lancamento_omie || ""),
            message: e instanceof Error ? e.message : String(e),
          });
        }
      }
    } catch (e) {
      allErrors.push({ entity: "receivables", message: e instanceof Error ? e.message : String(e) });
    }

    // ═══════════════════════════════════════════════════════════
    // FINALIZE
    // ═══════════════════════════════════════════════════════════
    result.total =
      result.vendors_synced +
      result.clients_synced +
      result.payables_synced +
      result.receivables_synced;
    result.errors = allErrors.length;
    result.duration_ms = Date.now() - startTime;

    const status =
      allErrors.length === 0 ? "success" : result.total > 0 ? "partial" : "error";

    // Update sync log
    if (syncLogId) {
      await supabase
        .from("omie_sync_log" as never)
        .update({
          finished_at: new Date().toISOString(),
          status,
          vendors_synced: result.vendors_synced,
          clients_synced: result.clients_synced,
          payables_synced: result.payables_synced,
          receivables_synced: result.receivables_synced,
          errors: allErrors.slice(0, 50),
        } as never)
        .eq("id" as never, syncLogId as never);
    }

    return NextResponse.json({ ...result, status });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);

    // Update sync log with critical error
    if (syncLogId) {
      await supabase
        .from("omie_sync_log" as never)
        .update({
          finished_at: new Date().toISOString(),
          status: "error",
          errors: [{ entity: "sync", message }],
        } as never)
        .eq("id" as never, syncLogId as never);
    }

    return NextResponse.json(
      { error: "Falha critica na sincronizacao", message },
      { status: 500 }
    );
  }
}
