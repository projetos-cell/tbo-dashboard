import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { ClicksignWebhookEventSchema } from "@/services/clicksign/types";

const WEBHOOK_SECRET = process.env.CLICKSIGN_WEBHOOK_SECRET || "";

// ─── POST /api/webhooks/clicksign ────────────────────────────────────────────

export async function POST(request: Request) {
  const rawBody = await request.text();

  // ── Validate signature ──────────────────────────────────────────────
  if (WEBHOOK_SECRET) {
    const signature = request.headers.get("x-clicksign-signature") || "";
    const expected = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  // ── Parse event ─────────────────────────────────────────────────────
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ClicksignWebhookEventSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("[clicksign-webhook] Invalid payload:", parsed.error.issues);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const event = parsed.data;
  const envelopeId = event.envelope.id;
  const eventName = event.event.name;

  const supabase = await createServerClient();

  // ── Find contract by clicksign_envelope_id ──────────────────────────
  const { data: contract } = await supabase
    .from("contracts")
    .select("id, tenant_id")
    .eq("clicksign_envelope_id" as never, envelopeId)
    .single();

  if (!contract) {
    // Envelope not linked to any contract — acknowledge but skip
    return NextResponse.json({ status: "skipped", reason: "no_contract" });
  }

  // ── Process event ───────────────────────────────────────────────────
  switch (eventName) {
    case "envelope.closed": {
      // All signatures collected — mark contract as active
      await supabase
        .from("contracts")
        .update({
          clicksign_status: "closed",
          contract_status: "active",
          signed_at: event.event.occurred_at,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", contract.id);

      await logEvent(supabase, contract, "envelope_closed", "Contrato assinado por todos os signatários");
      break;
    }

    case "envelope.canceled": {
      await supabase
        .from("contracts")
        .update({
          clicksign_status: "canceled",
          contract_status: "canceled",
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", contract.id);

      await logEvent(supabase, contract, "envelope_canceled", "Envelope cancelado no Clicksign");
      break;
    }

    case "document.signed": {
      // Individual signer signed — update signer record
      if (event.signer) {
        await supabase
          .from("contract_signers" as never)
          .update({
            sign_status: "signed",
            signed_at: event.event.occurred_at,
          } as never)
          .eq("contract_id", contract.id)
          .eq("clicksign_signer_id", event.signer.id);

        await logEvent(
          supabase,
          contract,
          "document_signed",
          `${event.signer.name || event.signer.email} assinou o documento`,
          { signer_id: event.signer.id, signer_email: event.signer.email }
        );
      }
      break;
    }

    case "envelope.deadline": {
      await logEvent(supabase, contract, "envelope_deadline", "Prazo do envelope atingido");
      break;
    }

    default: {
      await logEvent(supabase, contract, eventName, `Evento Clicksign: ${eventName}`);
    }
  }

  // Update clicksign metadata
  await supabase
    .from("contracts")
    .update({
      clicksign_metadata: event as unknown as Record<string, unknown>,
      clicksign_status: event.envelope.status,
    } as never)
    .eq("id", contract.id);

  return NextResponse.json({ status: "processed", event: eventName });
}

// ─── Helper: log contract event ──────────────────────────────────────────────

async function logEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  contract: { id: string; tenant_id: string },
  eventType: string,
  title: string,
  metadata?: Record<string, unknown>
) {
  await supabase.from("contract_events").insert({
    contract_id: contract.id,
    tenant_id: contract.tenant_id,
    event_type: eventType,
    title,
    description: null,
    metadata: metadata || {},
    source: "clicksign",
    user_id: null,
  } as never);
}
