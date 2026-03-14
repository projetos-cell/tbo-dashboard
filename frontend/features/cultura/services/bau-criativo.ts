import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BauReferenceInsert {
  name: string;
  category_id: string;
  subcategory_id: string;
  url: string;
  description: string;
  submitted_by?: string;
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

export async function getPendingBauReferences(
  supabase: SupabaseClient<Database>
): Promise<BauReferenceRow[]> {
  const { data, error } = await supabase
    .from("bau_references" as never)
    .select("*")
    .eq("status", "pending" as never)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as BauReferenceRow[];
}

export interface BauStats {
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
}

export async function getBauStats(
  supabase: SupabaseClient<Database>
): Promise<BauStats> {
  const { data, error } = await supabase
    .from("bau_references" as never)
    .select("status");

  if (error) throw error;

  const rows = (data ?? []) as { status: string }[];
  return {
    totalApproved: rows.filter((r) => r.status === "approved").length,
    totalPending: rows.filter((r) => r.status === "pending").length,
    totalRejected: rows.filter((r) => r.status === "rejected").length,
  };
}

export async function updateBauReferenceStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: "approved" | "rejected"
): Promise<void> {
  const { error } = await supabase
    .from("bau_references" as never)
    .update({ status } as never)
    .eq("id", id as never);

  if (error) throw error;
}
