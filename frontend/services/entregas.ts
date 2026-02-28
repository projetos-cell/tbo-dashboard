import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type DeliverableRow = Database["public"]["Tables"]["deliverables"]["Row"];

const FULL_COLS = "*";

export async function getDeliverables(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<DeliverableRow[]> {
  const { data, error } = await supabase
    .from("deliverables")
    .select(FULL_COLS)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getDeliverableById(
  supabase: SupabaseClient<Database>,
  id: string,
  tenantId: string
): Promise<DeliverableRow | null> {
  const { data, error } = await supabase
    .from("deliverables")
    .select(FULL_COLS)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (error) throw error;
  return data;
}

export async function createDeliverable(
  supabase: SupabaseClient<Database>,
  deliverable: Database["public"]["Tables"]["deliverables"]["Insert"]
): Promise<DeliverableRow> {
  const { data, error } = await supabase
    .from("deliverables")
    .insert(deliverable as never)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateDeliverable(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["deliverables"]["Update"]
): Promise<DeliverableRow> {
  const { data, error } = await supabase
    .from("deliverables")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select(FULL_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDeliverable(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("deliverables").delete().eq("id", id);
  if (error) throw error;
}
