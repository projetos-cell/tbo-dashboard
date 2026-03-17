// ---------------------------------------------------------------------------
// Órulo API v2 — Service Layer
// ---------------------------------------------------------------------------
// Padrão: segue o mesmo pattern de features/mercado/services/ibge.ts
// Auth: OAuth 2.0 Client Credentials (oruloClientAuth)
// Base URL: https://www.orulo.com.br
// ---------------------------------------------------------------------------

import type {
  OruloTokenResponse,
  OruloBuildingListResponse,
  OruloBuilding,
  OruloActiveBuildingIdsResponse,
  OruloRemovedBuildingIdsResponse,
  OruloTypologyListResponse,
  OruloImageListResponse,
  OruloFloorPlanListResponse,
  OruloBuildingUnitListResponse,
  OruloPartnerListResponse,
  OruloPartner,
  OruloStateListResponse,
  OruloCityListResponse,
  OruloAreaListResponse,
  OruloBuildingNameListResponse,
  OruloFeaturesListResponse,
  OruloBuildingTypesResponse,
  OruloApplicationConfig,
  OruloBuildingFilters,
} from "@/features/mercado/types/orulo";

const ORULO_BASE = "https://www.orulo.com.br";
const FETCH_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1_000;

// ---------------------------------------------------------------------------
// Token cache (in-memory, per process)
// ---------------------------------------------------------------------------

let cachedToken: { access_token: string; expires_at: number } | null = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  retries = MAX_RETRIES,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, init);
      if (res.ok) return res;

      // 401 = token expirado, não faz retry aqui
      if (res.status === 401) {
        cachedToken = null;
        throw new Error(`Órulo API: Token expirado ou inválido (401)`);
      }

      // 429 = rate limit, espera mais
      if (res.status === 429) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt + 1);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      // 5xx = retry
      if (res.status >= 500) {
        lastError = new Error(
          `Órulo API: status ${res.status} em ${url}`,
        );
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, Math.min(delay, 10_000)));
        continue;
      }

      // 4xx (exceto 401/429) = não faz retry
      const body = await res.text();
      throw new Error(
        `Órulo API: status ${res.status} — ${body}`,
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        lastError = new Error(`Órulo API: timeout em ${url}`);
        continue;
      }
      throw err;
    }
  }

  throw lastError ?? new Error(`Órulo API: falha após ${retries} tentativas`);
}

// ---------------------------------------------------------------------------
// Auth — OAuth 2.0 Client Credentials
// ---------------------------------------------------------------------------

export async function getOruloToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  // Retorna cache se válido (com margem de 60s)
  if (cachedToken && Date.now() < cachedToken.expires_at - 60_000) {
    return cachedToken.access_token;
  }

  const res = await fetchWithTimeout(
    `${ORULO_BASE}/oauth/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Órulo OAuth falhou: ${res.status} — ${body}`);
  }

  const data: OruloTokenResponse = await res.json();

  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/** Limpa o cache de token (útil para forçar re-auth) */
export function clearOruloTokenCache(): void {
  cachedToken = null;
}

// ---------------------------------------------------------------------------
// Authed fetch helper
// ---------------------------------------------------------------------------

async function oruloFetch<T>(
  path: string,
  token: string,
  params?: Record<string, string | string[] | number | undefined>,
): Promise<T> {
  const url = new URL(path, ORULO_BASE);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        // Array params: key[]=val1&key[]=val2
        for (const v of value) {
          url.searchParams.append(`${key}[]`, v);
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetchWithRetry(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// 1. Endereços (Estados, Cidades, Bairros)
// ---------------------------------------------------------------------------

export async function fetchStates(
  token: string,
  include?: string[],
): Promise<OruloStateListResponse> {
  return oruloFetch("/api/v2/addresses/states", token, { include });
}

export async function fetchCities(
  token: string,
  state: string,
  include?: string[],
): Promise<OruloCityListResponse> {
  return oruloFetch("/api/v2/addresses/cities", token, { state, include });
}

export async function fetchAreas(
  token: string,
  state: string,
  city: string,
  include?: string[],
): Promise<OruloAreaListResponse> {
  return oruloFetch("/api/v2/addresses/areas", token, { state, city, include });
}

// ---------------------------------------------------------------------------
// 2. Empreendimentos
// ---------------------------------------------------------------------------

export async function fetchBuildings(
  token: string,
  filters: OruloBuildingFilters = {},
): Promise<OruloBuildingListResponse> {
  const params: Record<string, string | string[] | number | undefined> = {};

  // Simple params
  if (filters.state) params.state = filters.state;
  if (filters.city) params.city = filters.city;
  if (filters.min_price) params.min_price = filters.min_price;
  if (filters.max_price) params.max_price = filters.max_price;
  if (filters.min_private_area) params.min_private_area = filters.min_private_area;
  if (filters.max_private_area) params.max_private_area = filters.max_private_area;
  if (filters.min_price_per_private_square_meter)
    params.min_price_per_private_square_meter = filters.min_price_per_private_square_meter;
  if (filters.max_price_per_private_square_meter)
    params.max_price_per_private_square_meter = filters.max_price_per_private_square_meter;
  if (filters.developer_id) params.developer_id = filters.developer_id;
  if (filters.publisher_id) params.publisher_id = filters.publisher_id;
  if (filters.commercial_partner_id)
    params.commercial_partner_id = filters.commercial_partner_id;
  if (filters.updated_after) params.updated_after = filters.updated_after;
  if (filters.results_per_page) params.results_per_page = filters.results_per_page;
  if (filters.page) params.page = filters.page;

  // Ordering
  if (filters.price_order) params.price_order = filters.price_order;
  if (filters.area_order) params.area_order = filters.area_order;
  if (filters.building_id_order) params.building_id_order = filters.building_id_order;
  if (filters.relevancy_order) params.relevancy_order = filters.relevancy_order;
  if (filters.last_updated_date_order)
    params.last_updated_date_order = filters.last_updated_date_order;
  if (filters.launch_date_order) params.launch_date_order = filters.launch_date_order;
  if (filters.price_per_private_square_meter_order)
    params.price_per_private_square_meter_order = filters.price_per_private_square_meter_order;

  // Array params — passados via oruloFetch que já trata arrays
  if (filters.area) params.area = filters.area;
  if (filters.bedrooms) params.bedrooms = filters.bedrooms;
  if (filters.suites) params.suites = filters.suites;
  if (filters.parking) params.parking = filters.parking;
  if (filters.type) params.type = filters.type;
  if (filters.status) params.status = filters.status;
  if (filters.finality) params.finality = filters.finality;
  if (filters.commercial_status) params.commercial_status = filters.commercial_status;
  if (filters.opportunity) params.opportunity = filters.opportunity;
  if (filters.portfolio) params.portfolio = filters.portfolio;
  if (filters.building_ids) params.building_ids = filters.building_ids;
  if (filters.include) params.include = filters.include;

  return oruloFetch("/api/v2/buildings", token, params);
}

export async function fetchBuildingById(
  token: string,
  buildingId: string,
  include?: string[],
): Promise<OruloBuilding> {
  return oruloFetch(`/api/v2/buildings/${buildingId}`, token, { include });
}

export async function searchBuildingsByName(
  token: string,
  name: string,
  maxResults?: number,
  include?: string[],
): Promise<OruloBuildingNameListResponse> {
  return oruloFetch("/api/v2/buildings/name/search", token, {
    name,
    max_results: maxResults,
    include,
  });
}

// ---------------------------------------------------------------------------
// 3. Sincronização
// ---------------------------------------------------------------------------

export async function fetchActiveBuildingIds(
  token: string,
  opts?: { updated_after?: string; results_per_page?: number; page?: number },
): Promise<OruloActiveBuildingIdsResponse> {
  return oruloFetch("/api/v2/buildings/ids/active", token, opts);
}

export async function fetchRemovedBuildingIds(
  token: string,
  updatedAfter: string,
  opts?: { results_per_page?: number; page?: number },
): Promise<OruloRemovedBuildingIdsResponse> {
  return oruloFetch("/api/v2/buildings/ids/removed", token, {
    updated_after: updatedAfter,
    ...opts,
  });
}

export async function fetchAppConfig(
  token: string,
): Promise<OruloApplicationConfig> {
  return oruloFetch("/api/v2/config", token);
}

// ---------------------------------------------------------------------------
// 4. Detalhes do empreendimento
// ---------------------------------------------------------------------------

export async function fetchTypologies(
  token: string,
  buildingId: string,
  include?: string[],
): Promise<OruloTypologyListResponse> {
  return oruloFetch(`/api/v2/buildings/${buildingId}/typologies`, token, {
    include,
  });
}

export async function fetchImages(
  token: string,
  buildingId: string,
  dimensions: string[],
): Promise<OruloImageListResponse> {
  return oruloFetch(`/api/v2/buildings/${buildingId}/images`, token, {
    dimensions,
  });
}

export async function fetchFloorPlans(
  token: string,
  buildingId: string,
  dimensions: string[],
): Promise<OruloFloorPlanListResponse> {
  return oruloFetch(`/api/v2/buildings/${buildingId}/floor_plans`, token, {
    dimensions,
  });
}

export async function fetchUnits(
  token: string,
  buildingId: string,
  typologyId: string,
  include?: string[],
): Promise<OruloBuildingUnitListResponse> {
  return oruloFetch(
    `/api/v2/buildings/${buildingId}/typologies/${typologyId}/units`,
    token,
    { include },
  );
}

// ---------------------------------------------------------------------------
// 5. Parceiros
// ---------------------------------------------------------------------------

export async function fetchPartners(
  token: string,
  opts?: {
    state?: string;
    city?: string;
    type?: string[];
    results_per_page?: number;
    page?: number;
    include?: string[];
  },
): Promise<OruloPartnerListResponse> {
  return oruloFetch("/api/v2/partners", token, opts);
}

export async function fetchPartnerById(
  token: string,
  partnerId: string,
): Promise<OruloPartner> {
  return oruloFetch(`/api/v2/partners/${partnerId}`, token);
}

// ---------------------------------------------------------------------------
// 6. Listas auxiliares
// ---------------------------------------------------------------------------

export async function fetchFeaturesList(
  token: string,
): Promise<OruloFeaturesListResponse> {
  return oruloFetch("/api/v2/buildings/features/list", token);
}

export async function fetchBuildingTypes(
  token: string,
): Promise<OruloBuildingTypesResponse> {
  return oruloFetch("/api/v2/buildings/types/list", token);
}

// ---------------------------------------------------------------------------
// 7. Helper — paginar todas as páginas
// ---------------------------------------------------------------------------

/**
 * Consome TODAS as páginas de um endpoint paginado da Órulo.
 * Útil para sincronização completa (ex: /buildings/ids/active).
 */
export async function fetchAllPages<T extends { total_pages: number; page: number }>(
  fetcher: (page: number) => Promise<T>,
  extractItems: (response: T) => unknown[],
): Promise<unknown[]> {
  const firstPage = await fetcher(1);
  const allItems = [...extractItems(firstPage)];
  const totalPages = firstPage.total_pages;

  // Fetch remaining pages sequentially to avoid rate limiting
  for (let page = 2; page <= totalPages; page++) {
    const pageData = await fetcher(page);
    allItems.push(...extractItems(pageData));
  }

  return allItems;
}
