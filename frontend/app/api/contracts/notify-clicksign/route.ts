import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyEnvelope } from "@/services/clicksign/notifications";

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

    const envelopeId = (contract as unknown as Record<string, unknown>)
      .clicksign_envelope_id as string | null;

    if (!envelopeId) {
      return NextResponse.json(
        { error: "Contrato não possui envelope no Clicksign" },
        { status: 400 }
      );
    }

    await notifyEnvelope(
      envelopeId,
      "Lembrete: você possui um contrato pendente de assinatura."
    );

    // Log event
    await supabase.from("contract_events" as never).insert({
      contract_id: contractId,
      event_type: "notification_sent",
      description: "Lembrete enviado aos signatários",
      metadata: { envelope_id: envelopeId, sent_by: user.id },
    } as never);

    return NextResponse.json({
      ok: true,
      message: "Notificação enviada aos signatários",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao notificar signatários";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
