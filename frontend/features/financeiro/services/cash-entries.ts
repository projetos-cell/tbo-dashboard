import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CashEntry {
  id: string;
  tenant_id: string;
  amount: number;
  note: string | null;
  recorded_at: string; // ISO timestamp
  created_at: string;  // ISO timestamp
}

export interface CreateCashEntryInput {
  amount: number;
  note?: string;
  recorded_at?: string; // defaults to now() on the DB side
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Returns the most recent N cash entries for a tenant, ordered by recorded_at DESC.
 */
export async function getCashEntries(
  supabase: SupabaseClient<Database>,
  limit = 20,
): Promise<CashEntry[]> {
  const { data, error } = await supabase
    .from("fin_cash_entries")
    .select("id, tenant_id, amount, note, recorded_at, created_at")
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as CashEntry[];
}

/**
 * Returns only the latest cash balance amount, or null if no entries exist.
 */
export async function getLatestCashBalance(
  supabase: SupabaseClient<Database>,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("fin_cash_entries")
    .select("amount")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? (data.amount as number) : null;
}

/**
 * Inserts a new cash entry and returns the created row.
 */
export async function createCashEntry(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  input: CreateCashEntryInput,
): Promise<CashEntry> {
  type InsertRow = Database["public"]["Tables"]["fin_cash_entries"]["Insert"];
  const payload: InsertRow = {
    tenant_id: tenantId,
    amount: input.amount,
    note: input.note ?? null,
    ...(input.recorded_at ? { recorded_at: input.recorded_at } : {}),
  };

  const { data, error } = await supabase
    .from("fin_cash_entries")
    .insert(payload)
    .select("id, tenant_id, amount, note, recorded_at, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data as CashEntry;
}
