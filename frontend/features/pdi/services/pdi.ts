import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ── Row types ────────────────────────────────────────────────────────────────

type PdiRow = Database["public"]["Tables"]["pdis"]["Row"];
type PdiInsert = Database["public"]["Tables"]["pdis"]["Insert"];
type PdiUpdate = Database["public"]["Tables"]["pdis"]["Update"];

type PdiGoalRow = Database["public"]["Tables"]["pdi_goals"]["Row"];
type PdiGoalInsert = Database["public"]["Tables"]["pdi_goals"]["Insert"];
type PdiGoalUpdate = Database["public"]["Tables"]["pdi_goals"]["Update"];

type PdiActionRow = Database["public"]["Tables"]["pdi_actions"]["Row"];
type PdiActionInsert = Database["public"]["Tables"]["pdi_actions"]["Insert"];

export type { PdiRow, PdiGoalRow, PdiActionRow };

// ── Composite types ─────────────────────────────────────────────────────────

export type PdiGoalWithActions = PdiGoalRow & {
  pdi_actions: PdiActionRow[];
};

export type PdiWithGoals = PdiRow & {
  pdi_goals: PdiGoalWithActions[];
};

export interface PdiFilters {
  status?: string | null;
  personId?: string | null;
}

export interface PdiKPIs {
  active: number;
  overdue: number;
  completed: number;
  openActions: number;
}

// ── PDI CRUD ────────────────────────────────────────────────────────────────

export async function getPdis(
  supabase: SupabaseClient<Database>,
  filters?: PdiFilters
): Promise<PdiRow[]> {
  let query = supabase
    .from("pdis")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.personId) {
    query = query.eq("person_id", filters.personId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPdiById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<PdiWithGoals> {
  const { data, error } = await supabase
    .from("pdis")
    .select("*, pdi_goals(*, pdi_actions(*))")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as PdiWithGoals;
}

export async function createPdi(
  supabase: SupabaseClient<Database>,
  data: PdiInsert
): Promise<PdiRow> {
  const { data: row, error } = await supabase
    .from("pdis")
    .insert(data as never)
    .select("*")
    .single();

  if (error) throw error;
  return row;
}

export async function updatePdi(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: PdiUpdate
): Promise<PdiRow> {
  const { data, error } = await supabase
    .from("pdis")
    .update({ ...updates, last_updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deletePdi(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("pdis").delete().eq("id", id);
  if (error) throw error;
}

// ── Goals CRUD ──────────────────────────────────────────────────────────────

export async function getPdiGoals(
  supabase: SupabaseClient<Database>,
  pdiId: string,
): Promise<PdiGoalWithActions[]> {
  const { data, error } = await supabase
    .from("pdi_goals")
    .select("*, pdi_actions(*)")
    .eq("pdi_id", pdiId)
    .order("sort_order")
    .order("created_at");

  if (error) throw error;
  return (data ?? []) as unknown as PdiGoalWithActions[];
}

export async function createPdiGoal(
  supabase: SupabaseClient<Database>,
  data: PdiGoalInsert
): Promise<PdiGoalRow> {
  const { data: row, error } = await supabase
    .from("pdi_goals")
    .insert(data as never)
    .select("*")
    .single();

  if (error) throw error;
  return row;
}

export async function updatePdiGoal(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: PdiGoalUpdate
): Promise<PdiGoalRow> {
  const { data, error } = await supabase
    .from("pdi_goals")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deletePdiGoal(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("pdi_goals")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Actions CRUD ────────────────────────────────────────────────────────────

export async function createPdiAction(
  supabase: SupabaseClient<Database>,
  data: PdiActionInsert
): Promise<PdiActionRow> {
  const { data: row, error } = await supabase
    .from("pdi_actions")
    .insert(data as never)
    .select("*")
    .single();

  if (error) throw error;
  return row;
}

export async function togglePdiAction(
  supabase: SupabaseClient<Database>,
  actionId: string,
  completed: boolean
): Promise<PdiActionRow> {
  const { data, error } = await supabase
    .from("pdi_actions")
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

export async function deletePdiAction(
  supabase: SupabaseClient<Database>,
  actionId: string,
): Promise<void> {
  const { error } = await supabase
    .from("pdi_actions")
    .delete()
    .eq("id", actionId);
  if (error) throw error;
}

// ── Link 1:1 action to PDI ────────────────────────────────────────────────

export async function linkOneOnOneActionToPdi(
  supabase: SupabaseClient<Database>,
  oneOnOneActionId: string,
  pdiId: string
): Promise<void> {
  const { error } = await supabase
    .from("one_on_one_actions")
    .update({ pdi_link_id: pdiId } as never)
    .eq("id", oneOnOneActionId);

  if (error) throw error;
}

export async function unlinkOneOnOneActionFromPdi(
  supabase: SupabaseClient<Database>,
  oneOnOneActionId: string
): Promise<void> {
  const { error } = await supabase
    .from("one_on_one_actions")
    .update({ pdi_link_id: null } as never)
    .eq("id", oneOnOneActionId);

  if (error) throw error;
}

// ── Open actions count (for KPIs) ──────────────────────────────────────────

export async function getOpenPdiActionsCount(
  supabase: SupabaseClient<Database>,
): Promise<number> {
  const { count, error } = await supabase
    .from("pdi_actions")
    .select("*", { count: "exact", head: true })
    .eq("completed", false);

  if (error) throw error;
  return count ?? 0;
}

// ── Person skills (for scorecard link) ───────────────────────────────────

export type PersonSkillRow = Database["public"]["Tables"]["person_skills"]["Row"];

export async function getPersonSkills(
  supabase: SupabaseClient<Database>,
  personId: string,
): Promise<PersonSkillRow[]> {
  const { data, error } = await supabase
    .from("person_skills")
    .select("*")
    .eq("person_id", personId)
    .order("skill_name");

  if (error) throw error;
  return data ?? [];
}

// ── KPIs (pure function) ───────────────────────────────────────────────────

export function computePdiKPIs(
  pdis: PdiRow[],
  openActionsCount: number
): PdiKPIs {
  let active = 0;
  let overdue = 0;
  let completed = 0;

  for (const p of pdis) {
    if (p.status === "Em andamento") active++;
    else if (p.status === "Atrasado") overdue++;
    else if (p.status === "Concluido") completed++;
  }

  return { active, overdue, completed, openActions: openActionsCount };
}

// ── Progress calculation ───────────────────────────────────────────────────

export function computePdiProgress(goals: PdiGoalWithActions[]): number {
  let total = 0;
  let done = 0;
  for (const g of goals) {
    for (const a of g.pdi_actions) {
      total++;
      if (a.completed) done++;
    }
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}
