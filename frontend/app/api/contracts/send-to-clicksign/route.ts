import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createEnvelope, activateEnvelope } from "@/services/clicksign/envelopes";
import { uploadDocument } from "@/services/clicksign/documents";
import { addSigner } from "@/services/clicksign/signers";
import type { CreateSignerInput } from "@/services/clicksign/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { contractId } = await request.json();

    if (!contractId) {
      return NextResponse.json(
        { error: "contractId é obrigatório" },
        { status: 400 }
      );
    }

    // 1. Fetch contract + signers
    const { data: contract, error: contractErr } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .single();

    if (contractErr || !contract) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
    }

    const { data: signers } = await supabase
      .from("contract_signers" as never)
      .select("*")
      .eq("contract_id", contractId);

    const typedSigners = (signers ?? []) as unknown as Array<{
      id: string;
      name: string;
      email: string;
      cpf: string | null;
    }>;

    if (!typedSigners.length) {
      return NextResponse.json(
        { error: "Adicione ao menos um signatário antes de enviar" },
        { status: 400 }
      );
    }

    // 2. Create Clicksign envelope
    const c = contract as unknown as Record<string, unknown>;

    const envelope = await createEnvelope({
      name: c.title as string,
      locale: "pt-BR",
      auto_close: true,
      block_after_refusal: true,
    });

    const envelopeId = envelope.id;

    // 3. Upload document if file exists
    const fileUrl = c.file_url as string | null;
    if (fileUrl) {
      const fileResponse = await fetch(fileUrl);
      const fileBlob = await fileResponse.blob();
      const fileName = (c.file_name as string) ?? "contrato.pdf";

      const file = new File([fileBlob], fileName, { type: fileBlob.type });
      await uploadDocument(envelopeId, file, fileName);
    }

    // 4. Add signers to envelope
    for (const signer of typedSigners) {
      const signerInput: CreateSignerInput = {
        name: signer.name,
        email: signer.email,
        cpf: signer.cpf ?? undefined,
        has_documentation: !!signer.cpf,
        qualification: "sign",
        communicate_events: true,
      };

      const result = await addSigner(envelopeId, signerInput);
      const clicksignSignerId = (result as unknown as Record<string, unknown>).id as string;

      // Update local signer with Clicksign ID
      await supabase
        .from("contract_signers" as never)
        .update({ clicksign_signer_id: clicksignSignerId } as never)
        .eq("id", signer.id);
    }

    // 5. Activate envelope (sends for signing)
    await activateEnvelope(envelopeId);

    // 6. Update contract with envelope info
    await supabase
      .from("contracts")
      .update({
        clicksign_envelope_id: envelopeId,
        clicksign_status: "running",
        contract_status: "pending_sign",
        status: "active",
      } as never)
      .eq("id", contractId);

    // 7. Log event
    await supabase.from("contract_events" as never).insert({
      contract_id: contractId,
      event_type: "sent_to_clicksign",
      description: "Contrato enviado para assinatura no Clicksign",
      metadata: { envelope_id: envelopeId, sent_by: user.id },
    } as never);

    return NextResponse.json({
      ok: true,
      envelopeId,
      message: "Contrato enviado para assinatura",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao enviar para Clicksign";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
