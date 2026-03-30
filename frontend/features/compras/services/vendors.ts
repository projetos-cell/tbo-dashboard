import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { Vendor, VendorCategory } from "../types";

type Sb = SupabaseClient<Database>;

// ─── Vendor Categories ────────────────────────────────────────────────────────

export async function getVendorCategories(supabase: Sb): Promise<VendorCategory[]> {
  const { data, error } = await supabase
    .from("compras_vendor_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as VendorCategory[];
}

export async function createVendorCategory(
  supabase: Sb,
  input: Omit<VendorCategory, "id" | "created_at">
): Promise<VendorCategory> {
  const { data, error } = await supabase
    .from("compras_vendor_categories")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as VendorCategory;
}

export async function updateVendorCategory(
  supabase: Sb,
  id: string,
  updates: Partial<Omit<VendorCategory, "id" | "tenant_id" | "created_at">>
): Promise<VendorCategory> {
  const { data, error } = await supabase
    .from("compras_vendor_categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as VendorCategory;
}

export async function deleteVendorCategory(supabase: Sb, id: string): Promise<void> {
  const { error } = await supabase
    .from("compras_vendor_categories")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function reorderVendorCategories(
  supabase: Sb,
  items: { id: string; sort_order: number }[]
): Promise<void> {
  const updates = items.map(({ id, sort_order }) =>
    supabase
      .from("compras_vendor_categories")
      .update({ sort_order })
      .eq("id", id)
  );
  await Promise.all(updates);
}

// ─── Vendors ──────────────────────────────────────────────────────────────────

export async function getVendors(supabase: Sb): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from("fin_vendors")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Vendor[];
}

export async function getVendor(supabase: Sb, id: string): Promise<Vendor> {
  const { data, error } = await supabase
    .from("fin_vendors")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Vendor;
}

export async function createVendor(
  supabase: Sb,
  input: Omit<Vendor, "id" | "omie_id" | "omie_synced_at" | "created_at" | "updated_at">
): Promise<Vendor> {
  const { data, error } = await supabase
    .from("fin_vendors")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Vendor;
}

export async function updateVendor(
  supabase: Sb,
  id: string,
  updates: Partial<Omit<Vendor, "id" | "tenant_id" | "omie_id" | "omie_synced_at" | "created_at" | "updated_at">>
): Promise<Vendor> {
  const { data, error } = await supabase
    .from("fin_vendors")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Vendor;
}

export async function deleteVendor(supabase: Sb, id: string): Promise<void> {
  const { error } = await supabase
    .from("fin_vendors")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
