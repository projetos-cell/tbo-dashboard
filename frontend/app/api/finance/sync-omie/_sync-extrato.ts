import type {
  SupabaseClient,
  OmieCredentials,
  SyncResult,
  LookupMap,
} from "./_shared";
import {
  INTER_PAGE_DELAY_MS,
  sleep,
  omieCall,
  batchUpsert,
  parseOmieDate,
  formatOmieDateParam,
  hasTimeRemaining,
} from "./_shared";

// ── Sync extrato bancário → finance_bank_statements ─────────────────────────

export async function syncExtratoBancario(
  supabase: SupabaseClient,
  tenantId: string,
  creds: OmieCredentials,
  baLookup: LookupMap,
  startTime: number,
  maxDurationSec: number
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
    if (!hasTimeRemaining(startTime, maxDurationSec)) {
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
        if (!hasTimeRemaining(startTime, maxDurationSec)) break;

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

          // Omie returns the array under "listaMovimentos"
          const movimentos = (data.listaMovimentos || data.extrato || data.movimentos || []) as Array<
            Record<string, unknown>
          >;

          console.log(
            `[sync-omie] Extrato ${bankOmieId}: ${movimentos.length} movements`
          );

          for (const mov of movimentos) {
            const nCodMov = mov.nCodLancamento || mov.nCodMov || mov.nCodMovCC;
            if (!nCodMov) continue;

            const omieId = `extrato_${bankOmieId}_${nCodMov}`;
            const valor = Number(mov.nValorDocumento || mov.nValor || 0);
            // cNatureza: "E" = entrada (credit), "S" = saída (debit)
            const natureza = String(mov.cNatureza || "").toUpperCase();
            const isCredit = natureza === "E" || (!natureza && valor >= 0);

            allRecords.push({
              tenant_id: tenantId,
              bank_account_id: bankUuid,
              omie_id: omieId,
              date: parseOmieDate(mov.dDataLancamento || mov.dMov) || new Date().toISOString().split("T")[0],
              description: String(
                mov.cDesCliente || mov.cObservacoes || mov.cDescMov || "Movimento"
              ),
              amount: Math.abs(valor),
              balance: mov.nSaldo != null ? Number(mov.nSaldo) : null,
              type: isCredit ? "credit" : "debit",
              category: mov.cCodCategoria ? String(mov.cCodCategoria) : null,
              document_number: mov.cNumero ? String(mov.cNumero) : (mov.cDocumentoFiscal ? String(mov.cDocumentoFiscal) : null),
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
