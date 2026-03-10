import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type OneOnOneRow = Database["public"]["Tables"]["one_on_ones"]["Row"];
type OneOnOneInsert = Database["public"]["Tables"]["one_on_ones"]["Insert"];
type OneOnOneUpdate = Database["public"]["Tables"]["one_on_ones"]["Update"];
type ActionRow = Database["public"]["Tables"]["one_on_one_actions"]["Row"];
type ActionInsert = Database["public"]["Tables"]["one_on_one_actions"]["Insert"];

// Re-export row types for consumers
export type { OneOnOneRow, ActionRow };

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface OneOnOneFilters {
  status?: string | null;
}

export interface OneOnOneKPIs {
  total: number;
  scheduled: number;
  completed: number;
  pendingActions: number;
}

export type OneOnOneWithActions = OneOnOneRow & {
  one_on_one_actions: ActionRow[];
};

// ── One-on-One CRUD ──────────────────────────────────────────────────────────

export async function getOneOnOnes(
  supabase: SupabaseClient<Database>,
  filters?: OneOnOneFilters
): Promise<OneOnOneRow[]> {
  let query = supabase
    .from("one_on_ones")
    .select("*")
    .order("scheduled_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getOneOnOneById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<OneOnOneWithActions> {
  const { data, error } = await supabase
    .from("one_on_ones")
    .select("*, one_on_one_actions(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as OneOnOneWithActions;
}

export async function getUpcomingOneOnOnes(
  supabase: SupabaseClient<Database>,
  limit = 10
): Promise<OneOnOneRow[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("one_on_ones")
    .select("*")
    .eq("status", "scheduled")
    .gte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getOverdueOneOnOnes(
  supabase: SupabaseClient<Database>,
): Promise<OneOnOneRow[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("one_on_ones")
    .select("*")
    .eq("status", "scheduled")
    .lt("scheduled_at", now)
    .order("scheduled_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export async function createOneOnOne(
  supabase: SupabaseClient<Database>,
  data: OneOnOneInsert
): Promise<OneOnOneRow> {
  const { data: row, error } = await supabase
    .from("one_on_ones")
    .insert(data as never)
    .select("*")
    .single();

  if (error) throw error;
  return row;
}

export async function updateOneOnOne(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: OneOnOneUpdate
): Promise<OneOnOneRow> {
  const { data, error } = await supabase
    .from("one_on_ones")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteOneOnOne(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("one_on_ones").delete().eq("id", id);
  if (error) throw error;
}

// ── Actions CRUD ─────────────────────────────────────────────────────────────

export async function getPendingActions(
  supabase: SupabaseClient<Database>,
): Promise<ActionRow[]> {
  const { data, error } = await supabase
    .from("one_on_one_actions")
    .select("*")
    .eq("completed", false)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data ?? [];
}

export async function getOneOnOneActions(
  supabase: SupabaseClient<Database>,
  oneOnOneId: string,
): Promise<ActionRow[]> {
  const { data, error } = await supabase
    .from("one_on_one_actions")
    .select("*")
    .eq("one_on_one_id", oneOnOneId)
    .order("created_at");

  if (error) throw error;
  return data ?? [];
}

export async function createAction(
  supabase: SupabaseClient<Database>,
  action: ActionInsert
): Promise<ActionRow> {
  const { data, error } = await supabase
    .from("one_on_one_actions")
    .insert(action as never)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function toggleAction(
  supabase: SupabaseClient<Database>,
  actionId: string,
  completed: boolean
): Promise<ActionRow> {
  const { data, error } = await supabase
    .from("one_on_one_actions")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    } as never)
    .eq("id", actionId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAction(
  supabase: SupabaseClient<Database>,
  actionId: string,
): Promise<void> {
  const { error } = await supabase
    .from("one_on_one_actions")
    .delete()
    .eq("id", actionId);

  if (error) throw error;
}

// ── KPIs (pure function) ─────────────────────────────────────────────────────

export function computeOneOnOneKPIs(
  oneOnOnes: OneOnOneRow[],
  pendingActionsCount: number
): OneOnOneKPIs {
  let scheduled = 0;
  let completed = 0;

  for (const o of oneOnOnes) {
    if (o.status === "scheduled") scheduled++;
    else if (o.status === "completed") completed++;
  }

  return {
    total: oneOnOnes.length,
    scheduled,
    completed,
    pendingActions: pendingActionsCount,
  };
}
