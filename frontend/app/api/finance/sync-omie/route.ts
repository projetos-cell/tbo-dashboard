import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OMIE_BASE_URL = "https://app.omie.com.br/api/v1";
const PAGE_SIZE = 500;

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

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Omie HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();

  if (data.faultstring) {
    throw new Error(`Omie error: ${data.faultstring}`);
  }

  return data;
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
      const data = await omieCall(creds, "geral/categorias/", "ListarCategorias", [
        { pagina: page, registros_por_pagina: PAGE_SIZE },
      ]);

      const categorias = (data.categoria_cadastro || []) as Array<{
        codigo: string;
        descricao: string;
        id_tipo_lancamento?: string;
      }>;

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
          // upsert doesn't tell us insert vs update, count as inserted
          inserted++;
        }
      }

      const totalPages = Math.ceil(
        ((data.total_de_registros as number) || 0) / PAGE_SIZE
      );
      hasMore = page < totalPages;
      page++;
    }
  } catch (err) {
    errors.push(
      `Categorias: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return { inserted, updated, errors };
}

// ── Sync contas a pagar from Omie ─────────────────────────────────────────────

async function syncContasPagar(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  tenantId: string,
  creds: OmieCredentials,
  userId: string
): Promise<{ inserted: number; updated: number; errors: string[] }> {
  let inserted = 0;
  let updated = 0;
  const errors: string[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = await omieCall(
        creds,
        "financas/contapagar/",
        "ListarContasPagar",
        [{ pagina: page, registros_por_pagina: PAGE_SIZE }]
      );

      const contas = (data.conta_pagar_cadastro || []) as Array<
        Record<string, unknown>
      >;

      for (const conta of contas) {
        const omieId = String(conta.codigo_lancamento_omie || "");
        if (!omieId) continue;

        // Map Omie status to our status
        let status = "pendente";
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
          date: String(conta.data_emissao || conta.data_vencimento || new Date().toISOString().split("T")[0]),
          due_date: conta.data_vencimento
            ? String(conta.data_vencimento)
            : null,
          paid_date: conta.data_pagamento
            ? String(conta.data_pagamento)
            : null,
          counterpart: conta.nome_fornecedor
            ? String(conta.nome_fornecedor)
            : null,
          counterpart_doc: conta.cnpj_cpf_fornecedor
            ? String(conta.cnpj_cpf_fornecedor)
            : null,
          omie_id: omieId,
          omie_synced_at: new Date().toISOString(),
          omie_raw: conta,
          updated_by: userId,
        };

        const { data: existing } = await (supabase as any)
          .from("finance_transactions")
          .select("id")
          .eq("tenant_id", tenantId)
          .eq("omie_id", omieId)
          .maybeSingle();

        if (existing) {
          const { error } = await (supabase as any)
            .from("finance_transactions")
            .update(record as never)
            .eq("id", existing.id);
          if (error) errors.push(`CP ${omieId}: ${error.message}`);
          else updated++;
        } else {
          const { error } = await (supabase as any)
            .from("finance_transactions")
            .insert({ ...record, created_by: userId } as never);
          if (error) errors.push(`CP ${omieId}: ${error.message}`);
          else inserted++;
        }
      }

      const total = (data.total_de_registros as number) || 0;
      hasMore = page < Math.ceil(total / PAGE_SIZE);
      page++;
    }
  } catch (err) {
    errors.push(
      `Contas a pagar: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return { inserted, updated, errors };
}

// ── Sync contas a receber from Omie ───────────────────────────────────────────

async function syncContasReceber(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  tenantId: string,
  creds: OmieCredentials,
  userId: string
): Promise<{ inserted: number; updated: number; errors: string[] }> {
  let inserted = 0;
  let updated = 0;
  const errors: string[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const data = await omieCall(
        creds,
        "financas/contareceber/",
        "ListarContasReceber",
        [{ pagina: page, registros_por_pagina: PAGE_SIZE }]
      );

      const contas = (data.conta_receber_cadastro || []) as Array<
        Record<string, unknown>
      >;

      for (const conta of contas) {
        const omieId = String(conta.codigo_lancamento_omie || "");
        if (!omieId) continue;

        let status = "pendente";
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
          date: String(conta.data_emissao || conta.data_vencimento || new Date().toISOString().split("T")[0]),
          due_date: conta.data_vencimento
            ? String(conta.data_vencimento)
            : null,
          paid_date: conta.data_recebimento || conta.data_pagamento
            ? String(conta.data_recebimento || conta.data_pagamento)
            : null,
          counterpart: conta.nome_cliente
            ? String(conta.nome_cliente)
            : null,
          counterpart_doc: conta.cnpj_cpf_cliente
            ? String(conta.cnpj_cpf_cliente)
            : null,
          omie_id: omieId,
          omie_synced_at: new Date().toISOString(),
          omie_raw: conta,
          updated_by: userId,
        };

        const { data: existing } = await (supabase as any)
          .from("finance_transactions")
          .select("id")
          .eq("tenant_id", tenantId)
          .eq("omie_id", omieId)
          .maybeSingle();

        if (existing) {
          const { error } = await (supabase as any)
            .from("finance_transactions")
            .update(record as never)
            .eq("id", existing.id);
          if (error) errors.push(`CR ${omieId}: ${error.message}`);
          else updated++;
        } else {
          const { error } = await (supabase as any)
            .from("finance_transactions")
            .insert({ ...record, created_by: userId } as never);
          if (error) errors.push(`CR ${omieId}: ${error.message}`);
          else inserted++;
        }
      }

      const total = (data.total_de_registros as number) || 0;
      hasMore = page < Math.ceil(total / PAGE_SIZE);
      page++;
    }
  } catch (err) {
    errors.push(
      `Contas a receber: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return { inserted, updated, errors };
}

// ── POST /api/finance/sync-omie ───────────────────────────────────────────────

export async function POST() {
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

    // Run all syncs
    const [catResult, cpResult, crResult] = await Promise.all([
      syncCategories(supabase, tenantId, creds),
      syncContasPagar(supabase, tenantId, creds, user.id),
      syncContasReceber(supabase, tenantId, creds, user.id),
    ]);

    const totalInserted =
      catResult.inserted + cpResult.inserted + crResult.inserted;
    const totalUpdated =
      catResult.updated + cpResult.updated + crResult.updated;
    const allErrors = [
      ...catResult.errors,
      ...cpResult.errors,
      ...crResult.errors,
    ];

    // Log sync result to omie_sync_log (reuse existing table)
    await (supabase as any).from("omie_sync_log").insert({
      tenant_id: tenantId,
      entity: "finance_full",
      status: allErrors.length > 0 ? "partial" : "success",
      records_synced: totalInserted + totalUpdated,
      error_message:
        allErrors.length > 0 ? allErrors.slice(0, 5).join("; ") : null,
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    } as never);

    return NextResponse.json({
      ok: true,
      message: `Sync concluido: ${totalInserted} inseridos, ${totalUpdated} atualizados`,
      inserted: totalInserted,
      updated: totalUpdated,
      errors: allErrors.length > 0 ? allErrors.slice(0, 10) : undefined,
      details: {
        categories: catResult,
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
