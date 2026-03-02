import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type CategoryRow = Database["public"]["Tables"]["fin_categories"]["Row"];
type CostCenterRow = Database["public"]["Tables"]["fin_cost_centers"]["Row"];
type VendorRow = Database["public"]["Tables"]["fin_vendors"]["Row"];
type FinClientRow = Database["public"]["Tables"]["fin_clients"]["Row"];

// ── Categories ────────────────────────────────────────────────

export async function listCategories(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  type?: string
): Promise<CategoryRow[]> {
  let query = supabase
    .from("fin_categories")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("name");

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

// ── Cost Centers ──────────────────────────────────────────────

export async function listCostCenters(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<CostCenterRow[]> {
  const { data, error } = await supabase
    .from("fin_cost_centers")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []) as CostCenterRow[];
}

export async function createCostCenter(
  supabase: SupabaseClient<Database>,
  cc: Database["public"]["Tables"]["fin_cost_centers"]["Insert"]
): Promise<CostCenterRow> {
  const { data, error } = await supabase
    .from("fin_cost_centers")
    .insert(cc as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as CostCenterRow;
}

export async function updateCostCenter(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["fin_cost_centers"]["Update"]
): Promise<CostCenterRow> {
  const { data, error } = await supabase
    .from("fin_cost_centers")
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as CostCenterRow;
}

// ── Vendors ───────────────────────────────────────────────────

export async function listVendors(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  search?: string
): Promise<VendorRow[]> {
  let query = supabase
    .from("fin_vendors")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("name");

  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as VendorRow[];
}

export async function createVendor(
  supabase: SupabaseClient<Database>,
  vendor: Database["public"]["Tables"]["fin_vendors"]["Insert"]
): Promise<VendorRow> {
  const { data, error } = await supabase
    .from("fin_vendors")
    .insert(vendor as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as VendorRow;
}

export async function updateVendor(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["fin_vendors"]["Update"]
): Promise<VendorRow> {
  const { data, error } = await supabase
    .from("fin_vendors")
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as VendorRow;
}

// ── Fin Clients ───────────────────────────────────────────────

export async function listFinClients(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  search?: string
): Promise<FinClientRow[]> {
  let query = supabase
    .from("fin_clients")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("name");

  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as FinClientRow[];
}

export async function createFinClient(
  supabase: SupabaseClient<Database>,
  client: Database["public"]["Tables"]["fin_clients"]["Insert"]
): Promise<FinClientRow> {
  const { data, error } = await supabase
    .from("fin_clients")
    .insert(client as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as FinClientRow;
}

export async function updateFinClient(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["fin_clients"]["Update"]
): Promise<FinClientRow> {
  const { data, error } = await supabase
    .from("fin_clients")
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as FinClientRow;
}
