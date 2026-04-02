"use client";

// ---------------------------------------------------------------------------
// Órulo API — React Query Hooks
// ---------------------------------------------------------------------------
// Padrão: segue features/mercado/hooks/use-ibge-data.ts
// Todos os hooks consomem o proxy /api/mercado/orulo
// ---------------------------------------------------------------------------

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  OruloBuildingListResponse,
  OruloBuilding,
  OruloActiveBuildingIdsResponse,
  OruloStateListResponse,
  OruloCityListResponse,
  OruloAreaListResponse,
  OruloBuildingNameListResponse,
  OruloTypologyListResponse,
  OruloPartnerListResponse,
  OruloPartner,
  OruloFeaturesListResponse,
  OruloBuildingTypesResponse,
  OruloApplicationConfig,
  OruloBuildingFilters,
} from "@/features/mercado/types/orulo";

// ---------------------------------------------------------------------------
// Base fetcher
// ---------------------------------------------------------------------------

async function oruloProxy<T>(
  action: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const url = new URL("/api/mercado/orulo", window.location.origin);
  url.searchParams.set("action", action);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Erro ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Endereços
// ---------------------------------------------------------------------------

export function useOruloStates() {
  return useQuery({
    queryKey: ["orulo", "states"],
    queryFn: () => oruloProxy<OruloStateListResponse>("states"),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 dias — estados quase nunca mudam
    gcTime: 30 * 24 * 60 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

export function useOruloCities(state: string | undefined) {
  return useQuery({
    queryKey: ["orulo", "cities", state],
    queryFn: () => oruloProxy<OruloCityListResponse>("cities", { state }),
    enabled: !!state,
    staleTime: 7 * 24 * 60 * 60 * 1000,
    gcTime: 30 * 24 * 60 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

export function useOruloAreas(state: string | undefined, city: string | undefined) {
  return useQuery({
    queryKey: ["orulo", "areas", state, city],
    queryFn: () => oruloProxy<OruloAreaListResponse>("areas", { state, city }),
    enabled: !!state && !!city,
    staleTime: 24 * 60 * 60 * 1000, // 24h
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

// ---------------------------------------------------------------------------
// Empreendimentos
// ---------------------------------------------------------------------------

export function useOruloBuildings(filters: OruloBuildingFilters = {}, enabled = true) {
  const params: Record<string, string | number | boolean | undefined> = {};

  if (filters.state) params.state = filters.state;
  if (filters.city) params.city = filters.city;
  if (filters.page) params.page = filters.page;
  if (filters.results_per_page) params.results_per_page = filters.results_per_page;
  if (filters.updated_after) params.updated_after = filters.updated_after;
  if (filters.min_price) params.min_price = filters.min_price;
  if (filters.max_price) params.max_price = filters.max_price;
  if (filters.price_order) params.price_order = filters.price_order;
  if (filters.include?.includes("not_available")) params.include_not_available = true;
  if (filters.bedrooms) params.bedrooms = filters.bedrooms.join(",");
  if (filters.status) params.status = filters.status.join(",");
  if (filters.finality) params.finality = filters.finality.join(",");
  if (filters.portfolio) params.portfolio = filters.portfolio.join(",");

  return useQuery({
    queryKey: ["orulo", "buildings", filters],
    queryFn: () => oruloProxy<OruloBuildingListResponse>("buildings", params),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 30 * 60 * 1000, // 30 min
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

export function useOruloBuildingDetail(buildingId: string | undefined) {
  return useQuery({
    queryKey: ["orulo", "building", buildingId],
    queryFn: () =>
      oruloProxy<OruloBuilding>("building", { id: buildingId }),
    enabled: !!buildingId,
    staleTime: 10 * 60 * 1000, // 10 min
    gcTime: 60 * 60 * 1000, // 1h
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

export function useOruloBuildingSearch(name: string | undefined, maxResults = 10) {
  return useQuery({
    queryKey: ["orulo", "search", name, maxResults],
    queryFn: () =>
      oruloProxy<OruloBuildingNameListResponse>("search", {
        name,
        max_results: maxResults,
      }),
    enabled: !!name && name.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 min
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

// ---------------------------------------------------------------------------
// Detalhes do empreendimento
// ---------------------------------------------------------------------------

export function useOruloTypologies(buildingId: string | undefined) {
  return useQuery({
    queryKey: ["orulo", "typologies", buildingId],
    queryFn: () =>
      oruloProxy<OruloTypologyListResponse>("typologies", {
        building_id: buildingId,
      }),
    enabled: !!buildingId,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

// ---------------------------------------------------------------------------
// IDs ativos (sincronização)
// ---------------------------------------------------------------------------

export function useOruloActiveBuildingIds(
  opts?: { updated_after?: string; page?: number },
  enabled = true,
) {
  return useQuery({
    queryKey: ["orulo", "active_ids", opts],
    queryFn: () =>
      oruloProxy<OruloActiveBuildingIdsResponse>("active_ids", {
        updated_after: opts?.updated_after,
        page: opts?.page,
      }),
    enabled,
    staleTime: 60 * 1000, // 1 min
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// ---------------------------------------------------------------------------
// Parceiros
// ---------------------------------------------------------------------------

export function useOruloPartners(
  opts?: { state?: string; city?: string; page?: number },
  enabled = true,
) {
  return useQuery({
    queryKey: ["orulo", "partners", opts],
    queryFn: () =>
      oruloProxy<OruloPartnerListResponse>("partners", {
        state: opts?.state,
        city: opts?.city,
        page: opts?.page,
      }),
    enabled,
    staleTime: 30 * 60 * 1000, // 30 min
    gcTime: 2 * 60 * 60 * 1000, // 2h
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
  });
}

export function useOruloPartnerDetail(partnerId: string | undefined) {
  return useQuery({
    queryKey: ["orulo", "partner", partnerId],
    queryFn: () =>
      oruloProxy<OruloPartner>("partner", { id: partnerId }),
    enabled: !!partnerId,
    staleTime: 60 * 60 * 1000, // 1h
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });
}

// ---------------------------------------------------------------------------
// Auxiliares
// ---------------------------------------------------------------------------

export function useOruloFeatures() {
  return useQuery({
    queryKey: ["orulo", "features"],
    queryFn: () => oruloProxy<OruloFeaturesListResponse>("features"),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 dias
    gcTime: 30 * 24 * 60 * 60 * 1000,
    retry: 2,
  });
}

export function useOruloBuildingTypes() {
  return useQuery({
    queryKey: ["orulo", "types"],
    queryFn: () => oruloProxy<OruloBuildingTypesResponse>("types"),
    staleTime: 7 * 24 * 60 * 60 * 1000,
    gcTime: 30 * 24 * 60 * 60 * 1000,
    retry: 2,
  });
}

export function useOruloConfig() {
  return useQuery({
    queryKey: ["orulo", "config"],
    queryFn: () => oruloProxy<OruloApplicationConfig>("config"),
    staleTime: 60 * 60 * 1000, // 1h
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });
}

// ---------------------------------------------------------------------------
// Sync mutation
// ---------------------------------------------------------------------------

export function useOruloSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/mercado/sync-orulo", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error ?? `Sync falhou: ${res.status}`);
      }
      return res.json() as Promise<{
        status: string;
        buildings_synced: number;
        typologies_synced: number;
        buildings_removed: number;
        errors_count: number;
        duration_ms: number;
      }>;
    },
    onSuccess: () => {
      // Invalida queries que usam dados sincronizados do Supabase
      queryClient.invalidateQueries({ queryKey: ["orulo-synced"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Hook para dados sincronizados (Supabase)
// ---------------------------------------------------------------------------

export function useOruloSyncedBuildings(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tables not in generated types (orulo_buildings, orulo_units)
  supabase: SupabaseClient | null,
  tenantId: string | undefined,
  filters?: {
    state?: string;
    city?: string;
    finality?: string;
    available?: boolean;
    limit?: number;
    offset?: number;
  },
) {
  return useQuery({
    queryKey: ["orulo-synced", "buildings", tenantId, filters],
    queryFn: async () => {
      if (!supabase || !tenantId) throw new Error("No client/tenant");

      // Tables not yet in generated types — use untyped access
      let query = supabase
        .from("orulo_buildings")
        .select("*", { count: "exact" })
        .eq("tenant_id", tenantId)
        .order("orulo_updated_at", { ascending: false });

      if (filters?.state) query = query.eq("state", filters.state);
      if (filters?.city) query = query.eq("city", filters.city);
      if (filters?.finality) query = query.eq("finality", filters.finality);
      if (filters?.available !== undefined)
        query = query.eq("available", filters.available);
      if (filters?.limit) query = query.limit(filters.limit);
      if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit ?? 50) - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { buildings: data ?? [], total: count ?? 0 };
    },
    enabled: !!supabase && !!tenantId,
    staleTime: 2 * 60 * 1000, // 2 min
    gcTime: 10 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// CSV Import mutation
// ---------------------------------------------------------------------------

export interface CSVImportResult {
  status: string;
  total_rows: number;
  imported: number;
  updated: number;
  errors: number;
  region: string;
}

export function useOruloCSVImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      csvData,
      region,
      tenantId,
    }: {
      csvData: string;
      region: string;
      tenantId: string;
    }): Promise<CSVImportResult> => {
      const res = await fetch("/api/mercado/import-orulo-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csv_data: csvData,
          region,
          tenant_id: tenantId,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error ?? `Import falhou: ${res.status}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orulo-synced"] });
      queryClient.invalidateQueries({ queryKey: ["orulo-csv"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Hook para dados CSV importados (Supabase) — com filtros regionais
// ---------------------------------------------------------------------------

export function useOruloCSVBuildings(
  supabase: SupabaseClient | null,
  tenantId: string | undefined,
  filters?: {
    region?: string;
    state?: string;
    city?: string;
    status?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  },
) {
  return useQuery({
    queryKey: ["orulo-csv", "buildings", tenantId, filters],
    queryFn: async () => {
      if (!supabase || !tenantId) throw new Error("No client/tenant");

      let query = supabase
        .from("orulo_buildings")
        .select("*", { count: "exact" })
        .eq("tenant_id", tenantId)
        .eq("data_source", "csv_import")
        .order("min_price", { ascending: false, nullsFirst: false });

      if (filters?.region) query = query.eq("import_region", filters.region);
      if (filters?.state) query = query.eq("state", filters.state);
      if (filters?.city) query = query.eq("city", filters.city);
      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,area.ilike.%${filters.search}%,developer_name.ilike.%${filters.search}%,city.ilike.%${filters.search}%`,
        );
      }
      if (filters?.minPrice) query = query.gte("min_price", filters.minPrice);
      if (filters?.maxPrice) query = query.lte("min_price", filters.maxPrice);

      const limit = filters?.limit ?? 50;
      const offset = filters?.offset ?? 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { buildings: data ?? [], total: count ?? 0 };
    },
    enabled: !!supabase && !!tenantId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// Stats por região (para KPIs)
// ---------------------------------------------------------------------------

export function useOruloCSVStats(
  supabase: SupabaseClient | null,
  tenantId: string | undefined,
) {
  return useQuery({
    queryKey: ["orulo-csv", "stats", tenantId],
    queryFn: async () => {
      if (!supabase || !tenantId) throw new Error("No client/tenant");

      const { data, error } = await supabase
        .from("orulo_buildings")
        .select("import_region, state, city, min_price, stock, status")
        .eq("tenant_id", tenantId)
        .eq("data_source", "csv_import");

      if (error) throw error;

      const byRegion: Record<string, { count: number; avgPrice: number; totalStock: number }> = {};

      for (const row of data ?? []) {
        const region = row.import_region || "other";
        if (!byRegion[region]) {
          byRegion[region] = { count: 0, avgPrice: 0, totalStock: 0 };
        }
        byRegion[region].count++;
        byRegion[region].avgPrice += row.min_price ?? 0;
        byRegion[region].totalStock += row.stock ?? 0;
      }

      for (const key of Object.keys(byRegion)) {
        if (byRegion[key].count > 0) {
          byRegion[key].avgPrice /= byRegion[key].count;
        }
      }

      return {
        total: (data ?? []).length,
        byRegion,
      };
    },
    enabled: !!supabase && !!tenantId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useOruloSyncLog(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tables not in generated types (orulo_buildings, orulo_units)
  supabase: SupabaseClient | null,
  tenantId: string | undefined,
) {
  return useQuery({
    queryKey: ["orulo-synced", "sync-log", tenantId],
    queryFn: async () => {
      if (!supabase || !tenantId) throw new Error("No client/tenant");

      const { data, error } = await supabase
        .from("orulo_sync_log")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("started_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!supabase && !!tenantId,
    staleTime: 30 * 1000, // 30s
    gcTime: 5 * 60 * 1000,
  });
}
