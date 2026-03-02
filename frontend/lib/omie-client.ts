// ============================================================================
// Omie ERP — Server-side REST client
// JSON-RPC style API: all calls are POST to app.omie.com.br/api/v1/{endpoint}
// Rate limiting: Omie allows ~3 req/sec — we enforce 600ms between calls
// ============================================================================

const OMIE_BASE_URL = "https://app.omie.com.br/api/v1/";
const RATE_LIMIT_DELAY = 600; // ms between calls

let lastRequestTime = 0;

// ── Types ──────────────────────────────────────────────────────

export interface OmieCredentials {
  appKey: string;
  appSecret: string;
}

export interface OmieRequestBody {
  call: string;
  app_key: string;
  app_secret: string;
  param: Record<string, unknown>[];
}

// ── Core request ───────────────────────────────────────────────

async function omieRequest(
  credentials: OmieCredentials,
  endpoint: string,
  call: string,
  params: Record<string, unknown>[] = [{}]
): Promise<unknown> {
  // Rate limiting
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_DELAY) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_DELAY - elapsed));
  }

  const url = `${OMIE_BASE_URL}${endpoint}`;
  const body: OmieRequestBody = {
    call,
    app_key: credentials.appKey,
    app_secret: credentials.appSecret,
    param: params,
  };

  lastRequestTime = Date.now();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Omie API ${response.status}: ${text.slice(0, 300)}`);
  }

  const result = await response.json();

  // Omie returns errors in body with faultstring
  if (result.faultstring) {
    throw new Error(`Omie: ${result.faultstring}`);
  }

  return result;
}

// ── Paginated fetch ────────────────────────────────────────────

async function fetchAllPages(
  credentials: OmieCredentials,
  endpoint: string,
  call: string,
  listKey: string,
  extraParams: Record<string, unknown> = {}
): Promise<unknown[]> {
  const all: unknown[] = [];
  let page = 1;
  const pageSize = 500;

  while (true) {
    const result = (await omieRequest(credentials, endpoint, call, [
      { pagina: page, registros_por_pagina: pageSize, ...extraParams },
    ])) as Record<string, unknown>;

    const items = result[listKey];
    if (!Array.isArray(items) || items.length === 0) break;
    all.push(...items);

    const totalPages = (result.total_de_paginas as number) || 1;
    if (page >= totalPages) break;
    page++;
  }

  return all;
}

// ── Public API ─────────────────────────────────────────────────

export function getOmieCredentials(): OmieCredentials | null {
  const appKey = process.env.OMIE_APP_KEY;
  const appSecret = process.env.OMIE_APP_SECRET;
  if (!appKey || !appSecret) return null;
  return { appKey, appSecret };
}

export async function fetchFornecedores(
  creds: OmieCredentials
): Promise<unknown[]> {
  return fetchAllPages(creds, "geral/clientes/", "ListarClientes", "clientes_cadastro", {
    clientesFiltro: { tags: [{ tag: "Fornecedor" }] },
  });
}

export async function fetchClientes(
  creds: OmieCredentials
): Promise<unknown[]> {
  return fetchAllPages(creds, "geral/clientes/", "ListarClientes", "clientes_cadastro");
}

export async function fetchContasPagar(
  creds: OmieCredentials
): Promise<unknown[]> {
  return fetchAllPages(creds, "financas/contapagar/", "ListarContasPagar", "conta_pagar_cadastro");
}

export async function fetchContasReceber(
  creds: OmieCredentials
): Promise<unknown[]> {
  return fetchAllPages(creds, "financas/contareceber/", "ListarContasReceber", "conta_receber_cadastro");
}

export async function testConnection(
  creds: OmieCredentials
): Promise<{ ok: boolean; total: number }> {
  const result = (await omieRequest(creds, "geral/categorias/", "ListarCategorias", [
    { pagina: 1, registros_por_pagina: 1 },
  ])) as Record<string, unknown>;
  return { ok: true, total: (result.total_de_registros as number) || 0 };
}

// ── Proxy helper (forward raw body) ───────────────────────────

export async function proxyOmieRequest(
  endpoint: string,
  body: unknown
): Promise<{ status: number; data: unknown }> {
  const url = `${OMIE_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

  const text = await response.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 500) };
  }

  return { status: response.status, data };
}
