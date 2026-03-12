// ─── Clicksign API 3.0 HTTP Client ──────────────────────────────────────────

const CLICKSIGN_API_URL =
  process.env.CLICKSIGN_API_URL || "https://sandbox.clicksign.com";
const CLICKSIGN_API_KEY = process.env.CLICKSIGN_API_KEY || "";

export class ClicksignApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string
  ) {
    super(message || `Clicksign API error: ${status}`);
    this.name = "ClicksignApiError";
  }
}

interface RequestOptions {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function clicksignFetch<T = unknown>(
  options: RequestOptions
): Promise<T> {
  const url = `${CLICKSIGN_API_URL}/api/v3${options.path}`;

  const response = await fetch(url, {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${CLICKSIGN_API_KEY}`,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ClicksignApiError(response.status, body);
  }

  if (response.status === 204) return {} as T;
  return response.json() as Promise<T>;
}

/**
 * Upload a file as multipart/form-data to Clicksign.
 */
export async function clicksignUpload<T = unknown>(
  path: string,
  formData: FormData
): Promise<T> {
  const url = `${CLICKSIGN_API_URL}/api/v3${path}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLICKSIGN_API_KEY}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ClicksignApiError(response.status, body);
  }

  return response.json() as Promise<T>;
}
