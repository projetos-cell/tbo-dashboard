import type {
  SupabaseClient,
  OmieCredentials,
  SyncResult,
  LookupMap,
  CostCenterInfoMap,
  ClientNameMap,
} from "./_shared";
import {
  PAGE_SIZE,
  INTER_PAGE_DELAY_MS,
  sleep,
  omieCall,
  batchUpsert,
  parseOmieDate,
  hasTimeRemaining,
} from "./_shared";
import {
  resolveCategoryId,
  resolveCostCenterId,
  deriveBUFromCostCenter,
} from "./_lookups";

// ── Sync contas a pagar → finance_transactions ──────────────────────────────

export async function syncContasPagar(
  supabase: SupabaseClient,
  tenantId: string,
  creds: OmieCredentials,
  userId: string,
  catLookup: LookupMap,
  ccLookup: LookupMap,
  ccInfoLookup: CostCenterInfoMap,
  baLookup: LookupMap,
  startTime: number,
  maxDurationSec: number
): Promise<SyncResult> {
  const errors: string[] = [];
  const allRecords: Record<string, unknown>[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      if (!hasTimeRemaining(startTime, maxDurationSec)) {
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
          // Omie's ListarContasPagar doesn't return valor_pago — use valor_documento when paid
          paid_amount: Number(conta.valor_pago || (status === "pago" ? conta.valor_documento : 0) || 0),
          date:
            parseOmieDate(conta.data_emissao) ||
            parseOmieDate(conta.data_vencimento) ||
            new Date().toISOString().split("T")[0],
          due_date: parseOmieDate(conta.data_vencimento),
          paid_date: parseOmieDate(conta.data_pagamento) || (status === "pago" ? parseOmieDate(conta.data_previsao) : null),
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

// ── Sync contas a receber → finance_transactions ────────────────────────────

export async function syncContasReceber(
  supabase: SupabaseClient,
  tenantId: string,
  creds: OmieCredentials,
  userId: string,
  catLookup: LookupMap,
  ccLookup: LookupMap,
  ccInfoLookup: CostCenterInfoMap,
  baLookup: LookupMap,
  clientNameMap: ClientNameMap,
  startTime: number,
  maxDurationSec: number
): Promise<SyncResult> {
  const errors: string[] = [];
  const allRecords: Record<string, unknown>[] = [];

  try {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      if (!hasTimeRemaining(startTime, maxDurationSec)) {
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
          // Omie's ListarContasReceber doesn't return valor_recebido — use valor_documento when paid
          paid_amount: Number(conta.valor_recebido || conta.valor_pago || (status === "pago" ? conta.valor_documento : 0) || 0),
          date:
            parseOmieDate(conta.data_emissao) ||
            parseOmieDate(conta.data_vencimento) ||
            new Date().toISOString().split("T")[0],
          due_date: parseOmieDate(conta.data_vencimento),
          paid_date: parseOmieDate(conta.data_recebimento) || parseOmieDate(conta.data_pagamento) || (status === "pago" ? parseOmieDate(conta.data_previsao) : null),
          counterpart: (() => {
            // OMIE ListarContasReceber doesn't return nome_cliente — resolve via lookup
            if (conta.nome_cliente) return String(conta.nome_cliente);
            const codCliForn = conta.codigo_cliente_fornecedor ? String(conta.codigo_cliente_fornecedor) : null;
            if (codCliForn) {
              const client = clientNameMap.get(codCliForn);
              if (client) return client.name;
            }
            return null;
          })(),
          counterpart_doc: (() => {
            if (conta.cnpj_cpf_cliente) return String(conta.cnpj_cpf_cliente);
            const codCliForn = conta.codigo_cliente_fornecedor ? String(conta.codigo_cliente_fornecedor) : null;
            if (codCliForn) {
              const client = clientNameMap.get(codCliForn);
              if (client?.cnpj) return client.cnpj;
            }
            return null;
          })(),
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
