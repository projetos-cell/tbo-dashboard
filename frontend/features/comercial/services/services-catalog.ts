import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ServiceType = "fee_mensal" | "projeto" | "hora" | "pacote";
export type ServiceUnit = "unidade" | "hora" | "mes" | "pacote" | "projeto";
export type ServiceStatus = "active" | "draft" | "archived";

export interface ServiceRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  bu: string | null;
  type: ServiceType;
  base_price: number;
  unit: ServiceUnit;
  margin_pct: number;
  status: ServiceStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ServiceInsert {
  tenant_id: string;
  name: string;
  description?: string | null;
  bu?: string | null;
  type: ServiceType;
  base_price: number;
  unit?: ServiceUnit;
  margin_pct?: number;
  status?: ServiceStatus;
}

export interface ServiceUpdate {
  name?: string;
  description?: string | null;
  bu?: string | null;
  type?: ServiceType;
  base_price?: number;
  unit?: ServiceUnit;
  margin_pct?: number;
  status?: ServiceStatus;
  sort_order?: number;
}

export interface ServicePriceHistoryRow {
  id: string;
  service_id: string;
  price: number;
  margin_pct: number | null;
  effective_from: string;
  changed_by: string | null;
  created_at: string;
}

export interface ServiceFilters {
  status?: ServiceStatus;
  bu?: string;
  type?: ServiceType;
  search?: string;
}

// ─── Queries ────────────────────────────────────────────────────────────────

export async function getServices(
  supabase: SupabaseClient<Database>,
  filters?: ServiceFilters,
): Promise<ServiceRow[]> {
  let query = supabase
    .from("services" as never)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.bu) {
    query = query.eq("bu", filters.bu);
  }
  if (filters?.type) {
    query = query.eq("type", filters.type);
  }
  if (filters?.search) {
    const safe = filters.search
      .replace(/\\/g, "\\\\")
      .replace(/%/g, "\\%")
      .replace(/,/g, "\\,")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/\./g, "\\.");
    query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ServiceRow[];
}

export async function getServiceById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<ServiceRow> {
  const { data, error } = await supabase
    .from("services" as never)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as ServiceRow;
}

export async function createService(
  supabase: SupabaseClient<Database>,
  input: ServiceInsert,
): Promise<ServiceRow> {
  const { data, error } = await supabase
    .from("services" as never)
    .insert(input as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ServiceRow;
}

export async function updateService(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: ServiceUpdate,
): Promise<ServiceRow> {
  const { data, error } = await supabase
    .from("services" as never)
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ServiceRow;
}

export async function deleteService(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("services" as never)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── Price History ──────────────────────────────────────────────────────────

export async function getServicePriceHistory(
  supabase: SupabaseClient<Database>,
  serviceId: string,
): Promise<ServicePriceHistoryRow[]> {
  const { data, error } = await supabase
    .from("service_price_history" as never)
    .select("*")
    .eq("service_id", serviceId)
    .order("effective_from", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ServicePriceHistoryRow[];
}

// ─── KPIs ───────────────────────────────────────────────────────────────────

export function computeServiceKPIs(services: ServiceRow[]) {
  const active = services.filter((s) => s.status === "active");
  const avgPrice = active.length
    ? active.reduce((sum, s) => sum + s.base_price, 0) / active.length
    : 0;
  const avgMargin = active.length
    ? active.reduce((sum, s) => sum + s.margin_pct, 0) / active.length
    : 0;

  const byBU = new Map<string, number>();
  for (const s of active) {
    const key = s.bu ?? "Sem BU";
    byBU.set(key, (byBU.get(key) ?? 0) + 1);
  }

  return {
    total: services.length,
    active: active.length,
    draft: services.filter((s) => s.status === "draft").length,
    archived: services.filter((s) => s.status === "archived").length,
    avgPrice,
    avgMargin,
    byBU: Object.fromEntries(byBU),
  };
}
