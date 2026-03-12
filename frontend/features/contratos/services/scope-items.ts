import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ─── Types (manual until gen types runs) ─────────────────────────────────────

export interface ScopeItemRow {
  id: string;
  contract_id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  category: string | null;
  value: number;
  status: string;
  progress_pct: number;
  estimated_start: string | null;
  estimated_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  delivered_at: string | null;
  project_deliverable_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ScopeItemInsert {
  contract_id: string;
  tenant_id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  value?: number;
  status?: string;
  progress_pct?: number;
  estimated_start?: string | null;
  estimated_end?: string | null;
  sort_order?: number;
}

export interface ScopeItemUpdate {
  title?: string;
  description?: string | null;
  category?: string | null;
  value?: number;
  status?: string;
  progress_pct?: number;
  estimated_start?: string | null;
  estimated_end?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
  delivered_at?: string | null;
  sort_order?: number;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getScopeItems(
  supabase: SupabaseClient<Database>,
  contractId: string
): Promise<ScopeItemRow[]> {
  const { data, error } = await supabase
    .from("contract_scope_items" as never)
    .select()
    .eq("contract_id", contractId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ScopeItemRow[];
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function createScopeItem(
  supabase: SupabaseClient<Database>,
  input: ScopeItemInsert
): Promise<ScopeItemRow> {
  const { data, error } = await supabase
    .from("contract_scope_items" as never)
    .insert(input as never)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ScopeItemRow;
}

export async function createScopeItemsBatch(
  supabase: SupabaseClient<Database>,
  items: ScopeItemInsert[]
): Promise<ScopeItemRow[]> {
  if (!items.length) return [];

  const { data, error } = await supabase
    .from("contract_scope_items" as never)
    .insert(items as never[])
    .select();

  if (error) throw error;
  return (data ?? []) as unknown as ScopeItemRow[];
}

export async function updateScopeItem(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: ScopeItemUpdate
): Promise<ScopeItemRow> {
  const { data, error } = await supabase
    .from("contract_scope_items" as never)
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ScopeItemRow;
}

export async function deleteScopeItem(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("contract_scope_items" as never)
    .delete()
    .eq("id", id);
  if (error) throw error;
}
