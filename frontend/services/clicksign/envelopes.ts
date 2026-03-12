import { clicksignFetch } from "./client";
import type {
  ClicksignEnvelope,
  CreateEnvelopeInput,
} from "./types";

// ─── Envelopes CRUD ──────────────────────────────────────────────────────────

export async function createEnvelope(
  input: CreateEnvelopeInput
): Promise<ClicksignEnvelope> {
  const res = await clicksignFetch<{ data: ClicksignEnvelope }>({
    method: "POST",
    path: "/envelopes",
    body: { data: { ...input } },
  });
  return res.data;
}

export async function getEnvelope(
  envelopeId: string
): Promise<ClicksignEnvelope> {
  const res = await clicksignFetch<{ data: ClicksignEnvelope }>({
    method: "GET",
    path: `/envelopes/${envelopeId}`,
  });
  return res.data;
}

export async function activateEnvelope(
  envelopeId: string
): Promise<ClicksignEnvelope> {
  const res = await clicksignFetch<{ data: ClicksignEnvelope }>({
    method: "POST",
    path: `/envelopes/${envelopeId}/activate`,
  });
  return res.data;
}

export async function cancelEnvelope(
  envelopeId: string
): Promise<ClicksignEnvelope> {
  const res = await clicksignFetch<{ data: ClicksignEnvelope }>({
    method: "POST",
    path: `/envelopes/${envelopeId}/cancel`,
  });
  return res.data;
}
