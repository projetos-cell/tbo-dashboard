import { clicksignFetch } from "./client";

// ─── Notifications ───────────────────────────────────────────────────────────

/**
 * Send notification to all signers of an envelope.
 */
export async function notifyEnvelope(
  envelopeId: string,
  message?: string
): Promise<void> {
  await clicksignFetch({
    method: "POST",
    path: `/envelopes/${envelopeId}/notifications`,
    body: message ? { data: { message } } : undefined,
  });
}

/**
 * Send notification to a specific signer.
 */
export async function notifySigner(
  envelopeId: string,
  signerId: string,
  message?: string
): Promise<void> {
  await clicksignFetch({
    method: "POST",
    path: `/envelopes/${envelopeId}/signers/${signerId}/notifications`,
    body: message ? { data: { message } } : undefined,
  });
}
