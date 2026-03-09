import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type RitualTypeRow = Database["public"]["Tables"]["ritual_types"]["Row"];

const COLS =
  "id,tenant_id,name,slug,description,frequency,duration_minutes,default_agenda,default_participants,icon,color,is_system,is_active,sort_order,created_by,created_at,updated_at";

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Diario",
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
  quarterly: "Trimestral",
  custom: "Personalizado",
};

// ─── List ritual types ───
export async function getRitualTypes(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  includeInactive = false
): Promise<RitualTypeRow[]> {
  let query = supabase
    .from("ritual_types")
    .select(COLS)
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });

  if (!includeInactive) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ─── Get by ID ───
export async function getRitualType(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<RitualTypeRow | null> {
  const { data, error } = await supabase
    .from("ritual_types")
    .select(COLS)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// ─── Create ritual type ───
export async function createRitualType(
  supabase: SupabaseClient<Database>,
  ritualType: Database["public"]["Tables"]["ritual_types"]["Insert"]
): Promise<RitualTypeRow> {
  const { data, error } = await supabase
    .from("ritual_types")
    .insert(ritualType as never)
    .select(COLS)
    .single();
  if (error) throw error;
  return data;
}

// ─── Update ritual type ───
export async function updateRitualType(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["ritual_types"]["Update"]
): Promise<RitualTypeRow> {
  const { data, error } = await supabase
    .from("ritual_types")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select(COLS)
    .single();
  if (error) throw error;
  return data;
}

// ─── Delete ritual type (only custom) ───
export async function deleteRitualType(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  // Only allow deleting custom (non-system) types
  const { data: existing } = await supabase
    .from("ritual_types")
    .select("is_system")
    .eq("id", id)
    .single();

  if ((existing as { is_system: boolean } | null)?.is_system) {
    throw new Error("Nao e possivel excluir rituais do sistema.");
  }

  const { error } = await supabase.from("ritual_types").delete().eq("id", id);
  if (error) throw error;
}

// ─── Toggle active ───
export async function toggleRitualTypeActive(
  supabase: SupabaseClient<Database>,
  id: string,
  isActive: boolean
): Promise<void> {
  const { error } = await supabase
    .from("ritual_types")
    .update({ is_active: isActive, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
}
