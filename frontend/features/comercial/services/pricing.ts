import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { ServiceRow } from "@/features/comercial/services/services-catalog";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PricingPremises {
  id: string;
  tenant_id: string;
  tax_pct: number;
  commission_pct: number;
  target_margin_pct: number;
  urgency_multiplier: number;
  package_discount_pct: number;
  updated_at: string;
  updated_by: string | null;
}

export interface PricingPremisesUpdate {
  tax_pct?: number;
  commission_pct?: number;
  target_margin_pct?: number;
  urgency_multiplier?: number;
  package_discount_pct?: number;
}

export interface BUCostRow {
  id: string;
  tenant_id: string;
  bu: string;
  total_cost_monthly: number;
  capacity_hours_monthly: number;
  note: string | null;
  updated_at: string;
}

export interface BUCostUpdate {
  total_cost_monthly?: number;
  capacity_hours_monthly?: number;
  note?: string | null;
}

// ServiceRow estendido com campos de precificacao
export type PricingServiceRow = ServiceRow & {
  hours_estimated: number | null;
  third_party_cost: number | null;
  complexity_multiplier: number | null;
  revisions_included: number | null;
  min_price: number | null;
};

export interface ServicePricingComputed {
  service_id: string;
  service_name: string;
  bu: string;
  cost_per_hour: number;
  hours_estimated: number;
  third_party_cost: number;
  direct_cost: number;
  tax_amount: number;
  commission_amount: number;
  margin_amount: number;
  base_price: number;
  revisions_included: number;
  min_price: number;
  complexity_multiplier: number;
  suggested_price: number;
}

export const DEFAULT_PREMISES: Omit<PricingPremises, "id" | "tenant_id" | "updated_at" | "updated_by"> = {
  tax_pct: 0.10,
  commission_pct: 0.10,
  target_margin_pct: 0.30,
  urgency_multiplier: 1.40,
  package_discount_pct: 0.08,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getPricingPremises(
  supabase: SupabaseClient<Database>,
): Promise<PricingPremises | null> {
  const { data, error } = await supabase
    .from("pricing_premises" as never)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? (data as unknown as PricingPremises) : null;
}

export async function upsertPricingPremises(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  updates: PricingPremisesUpdate,
): Promise<PricingPremises> {
  const { data, error } = await supabase
    .from("pricing_premises" as never)
    .upsert(
      { tenant_id: tenantId, ...updates, updated_at: new Date().toISOString() } as never,
      { onConflict: "tenant_id" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as unknown as PricingPremises;
}

export async function getBUCosts(
  supabase: SupabaseClient<Database>,
): Promise<BUCostRow[]> {
  const { data, error } = await supabase
    .from("bu_costs" as never)
    .select("*")
    .order("bu", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as BUCostRow[];
}

export async function upsertBUCost(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  bu: string,
  updates: BUCostUpdate,
): Promise<BUCostRow> {
  const { data, error } = await supabase
    .from("bu_costs" as never)
    .upsert(
      { tenant_id: tenantId, bu, ...updates } as never,
      { onConflict: "tenant_id,bu" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as unknown as BUCostRow;
}

export async function getPricingServices(
  supabase: SupabaseClient<Database>,
): Promise<PricingServiceRow[]> {
  const { data, error } = await supabase
    .from("services" as never)
    .select("*")
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as PricingServiceRow[];
}

// ─── Motor de Precificacao ────────────────────────────────────────────────────

export function costPerHour(row: BUCostRow): number {
  if (!row.capacity_hours_monthly || row.capacity_hours_monthly === 0) return 0;
  return row.total_cost_monthly / row.capacity_hours_monthly;
}

export function computeServicePricing(
  service: PricingServiceRow,
  buCostMap: Map<string, BUCostRow>,
  premises: Pick<PricingPremises, "tax_pct" | "commission_pct" | "target_margin_pct">,
): ServicePricingComputed {
  const buRow = service.bu ? buCostMap.get(service.bu) : undefined;
  const cph = buRow ? costPerHour(buRow) : 0;
  const hours = service.hours_estimated ?? 0;
  const thirdParty = service.third_party_cost ?? 0;
  const directCost = cph * hours + thirdParty;

  const taxAmount = directCost * premises.tax_pct;
  const commissionAmount = directCost * premises.commission_pct;

  // preço_base = custo_direto * (1 + tax + commission) / (1 - margem)
  const denominator = 1 - premises.target_margin_pct;
  const basePrice =
    denominator > 0
      ? (directCost * (1 + premises.tax_pct + premises.commission_pct)) / denominator
      : 0;
  const marginAmount = basePrice - directCost - taxAmount - commissionAmount;

  const complexityMultiplier = service.complexity_multiplier ?? 1;
  const minPrice = service.min_price ?? 0;
  const suggestedPrice = Math.max(basePrice, minPrice) * complexityMultiplier;

  return {
    service_id: service.id,
    service_name: service.name,
    bu: service.bu ?? "",
    cost_per_hour: cph,
    hours_estimated: hours,
    third_party_cost: thirdParty,
    direct_cost: directCost,
    tax_amount: taxAmount,
    commission_amount: commissionAmount,
    margin_amount: marginAmount,
    base_price: basePrice,
    revisions_included: service.revisions_included ?? 0,
    min_price: minPrice,
    complexity_multiplier: complexityMultiplier,
    suggested_price: suggestedPrice,
  };
}
