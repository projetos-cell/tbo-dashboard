import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BauReferenceInsert {
  name: string;
  category_id: string;
  subcategory_id: string;
  url: string;
  description: string;
}

export interface BauReferenceRow extends BauReferenceInsert {
  id: string;
  status: "pending" | "approved" | "rejected";
  submitted_by: string;
  created_at: string;
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function createBauReference(
  supabase: SupabaseClient<Database>,
  data: BauReferenceInsert
): Promise<void> {
  const { error } = await supabase
    .from("bau_references" as never)
    .insert({ ...data, status: "pending" } as never);

  if (error) throw error;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getBauReferencesBySubcategory(
  supabase: SupabaseClient<Database>,
  subcategoryId: string
): Promise<BauReferenceRow[]> {
  const { data, error } = await supabase
    .from("bau_references" as never)
    .select("*")
    .eq("subcategory_id", subcategoryId as never)
    .eq("status", "approved" as never)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as BauReferenceRow[];
}
