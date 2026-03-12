import { clicksignFetch } from "./client";
import type { ClicksignSigner, CreateSignerInput } from "./types";

// ─── Signers ─────────────────────────────────────────────────────────────────

export async function addSigner(
  envelopeId: string,
  input: CreateSignerInput
): Promise<ClicksignSigner> {
  const res = await clicksignFetch<{ data: ClicksignSigner }>({
    method: "POST",
    path: `/envelopes/${envelopeId}/signers`,
    body: { data: { ...input } },
  });
  return res.data;
}

export async function listSigners(
  envelopeId: string
): Promise<ClicksignSigner[]> {
  const res = await clicksignFetch<{ data: ClicksignSigner[] }>({
    method: "GET",
    path: `/envelopes/${envelopeId}/signers`,
  });
  return res.data;
}

export async function removeSigner(
  envelopeId: string,
  signerId: string
): Promise<void> {
  await clicksignFetch({
    method: "DELETE",
    path: `/envelopes/${envelopeId}/signers/${signerId}`,
  });
}
