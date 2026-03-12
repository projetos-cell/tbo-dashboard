import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listAllEnvelopes } from "@/services/clicksign/envelopes";
import { listSigners } from "@/services/clicksign/signers";

export const maxDuration = 120;

/**
 * POST /api/contracts/import-clicksign
 *
 * Imports signed (closed) envelopes from Clicksign into the contracts table.
 * Skips envelopes that already exist (matched by clicksign_envelope_id).
 * Also imports signers for each envelope.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    // Get user's tenant
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile?.tenant_id) {
      return NextResponse.json(
        { error: "Tenant nao encontrado" },
        { status: 403 }
      );
    }

    const tenantId = profile.tenant_id;

    // ─── 1. Fetch all envelopes from Clicksign (closed + running) ────────────

    const [closedEnvelopes, runningEnvelopes] = await Promise.all([
      listAllEnvelopes("closed"),
      listAllEnvelopes("running"),
    ]);

    const allEnvelopes = [...closedEnvelopes, ...runningEnvelopes];

    if (!allEnvelopes.length) {
      return NextResponse.json({
        ok: true,
        imported: 0,
        skipped: 0,
        message: "Nenhum envelope encontrado no Clicksign",
      });
    }

    // ─── 2. Check which already exist in DB ──────────────────────────────────

    const envelopeIds = allEnvelopes.map((e) => e.id);

    const { data: existingContracts } = await supabase
      .from("contracts")
      .select("clicksign_envelope_id")
      .in("clicksign_envelope_id", envelopeIds);

    const existingIds = new Set(
      (existingContracts ?? []).map(
        (c) => (c as unknown as Record<string, unknown>).clicksign_envelope_id as string
      )
    );

    // ─── 3. Import new envelopes ─────────────────────────────────────────────

    let imported = 0;
    let skipped = 0;
    const errors: Array<{ envelopeId: string; error: string }> = [];

    for (const envelope of allEnvelopes) {
      if (existingIds.has(envelope.id)) {
        skipped++;
        continue;
      }

      try {
        // Map Clicksign status to contract status
        const contractStatus =
          envelope.status === "closed" ? "active" : "pending_sign";

        const signedAt =
          envelope.status === "closed" ? envelope.updated_at : null;

        // Create contract record
        const { data: newContract, error: insertErr } = await supabase
          .from("contracts")
          .insert({
            tenant_id: tenantId,
            title: envelope.name || `Contrato Clicksign ${envelope.id.slice(0, 8)}`,
            type: "pj",
            status: "active",
            clicksign_envelope_id: envelope.id,
            clicksign_status: envelope.status,
            clicksign_metadata: envelope as unknown,
            contract_status: contractStatus,
            signed_at: signedAt,
            created_by: user.id,
            description: `Importado do Clicksign em ${new Date().toLocaleDateString("pt-BR")}`,
          } as never)
          .select("id")
          .single();

        if (insertErr || !newContract) {
          errors.push({
            envelopeId: envelope.id,
            error: insertErr?.message ?? "Erro ao inserir contrato",
          });
          continue;
        }

        const contractId = (newContract as Record<string, unknown>).id as string;

        // ─── 4. Import signers for this envelope ───────────────────────────

        try {
          const clicksignSigners = await listSigners(envelope.id);

          if (clicksignSigners.length > 0) {
            const signerRows = clicksignSigners.map((s) => ({
              contract_id: contractId,
              tenant_id: tenantId,
              name: s.name || s.email,
              email: s.email,
              cpf: s.cpf ?? null,
              role: "signer",
              clicksign_signer_id: s.id,
              sign_status:
                envelope.status === "closed" ? "signed" : "pending",
              signed_at:
                envelope.status === "closed" ? envelope.updated_at : null,
            }));

            await supabase
              .from("contract_signers" as never)
              .insert(signerRows as never);
          }
        } catch (signerErr) {
          // Non-blocking: contract was created, signers failed
          errors.push({
            envelopeId: envelope.id,
            error: `Contrato importado mas falha nos signatarios: ${
              signerErr instanceof Error ? signerErr.message : "erro"
            }`,
          });
        }

        // ─── 5. Log import event ───────────────────────────────────────────

        await supabase.from("contract_events" as never).insert({
          contract_id: contractId,
          tenant_id: tenantId,
          event_type: "imported",
          title: "Contrato importado do Clicksign",
          description: `Envelope ${envelope.id} (${envelope.status}) importado automaticamente`,
          metadata: {
            clicksign_envelope_id: envelope.id,
            clicksign_status: envelope.status,
            imported_by: user.id,
          },
          source: "clicksign",
          user_id: user.id,
        } as never);

        imported++;
      } catch (envelopeErr) {
        errors.push({
          envelopeId: envelope.id,
          error:
            envelopeErr instanceof Error
              ? envelopeErr.message
              : "Erro desconhecido",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      imported,
      skipped,
      total: allEnvelopes.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${imported} contratos importados, ${skipped} ja existiam`,
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Erro ao importar contratos do Clicksign";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
