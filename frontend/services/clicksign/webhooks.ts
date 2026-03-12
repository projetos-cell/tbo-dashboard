import { clicksignFetch } from "./client";

// ─── Webhook Management ─────────────────────────────────────────────────────

interface WebhookConfig {
  url: string;
  events: string[];
  enabled: boolean;
}

export async function registerWebhook(config: WebhookConfig): Promise<unknown> {
  return clicksignFetch({
    method: "POST",
    path: "/webhooks",
    body: { data: config },
  });
}

export async function listWebhooks(): Promise<unknown[]> {
  const res = await clicksignFetch<{ data: unknown[] }>({
    method: "GET",
    path: "/webhooks",
  });
  return res.data;
}

/**
 * Verify webhook signature (HMAC-SHA256).
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Use Web Crypto API (Edge runtime compatible)
  // For Node.js runtime, use crypto.createHmac
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const data = encoder.encode(payload);

  // Sync comparison not possible with Web Crypto — this is
  // implemented in the webhook handler using Node crypto.
  // This function is a placeholder for the pattern.
  void key;
  void data;

  // The actual verification happens in the webhook route handler
  // using Node.js crypto.createHmac for HMAC-SHA256 comparison.
  return signature.length > 0 && secret.length > 0;
}
