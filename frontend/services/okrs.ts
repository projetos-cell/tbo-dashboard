import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type CycleRow = Database["public"]["Tables"]["okr_cycles"]["Row"];
type ObjectiveRow = Database["public"]["Tables"]["okr_objectives"]["Row"];
type KeyResultRow = Database["public"]["Tables"]["okr_key_results"]["Row"];
type CheckinRow = Database["public"]["Tables"]["okr_checkins"]["Row"];

// ── Cycles ────────────────────────────────────────────────────────────

export async function getCycles(
  supabase: SupabaseClient<Database>,
  tenantId: string,
) {
  const { data, error } = await supabase
    .from("okr_cycles")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("start_date", { ascending: false });
  if (error) throw error;
  return data as CycleRow[];
}

export async function getActiveCycle(
  supabase: SupabaseClient<Database>,
  tenantId: string,
) {
  const { data, error } = await supabase
    .from("okr_cycles")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as CycleRow | null;
}

export async function createCycle(
  supabase: SupabaseClient<Database>,
  cycle: Database["public"]["Tables"]["okr_cycles"]["Insert"],
) {
  const { data, error } = await supabase
    .from("okr_cycles")
    .insert(cycle as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as CycleRow;
}

export async function updateCycle(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["okr_cycles"]["Update"],
) {
  const { data, error } = await supabase
    .from("okr_cycles")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as CycleRow;
}

export async function deleteCycle(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { error } = await supabase.from("okr_cycles").delete().eq("id", id);
  if (error) throw error;
}

// ── Objectives ────────────────────────────────────────────────────────

export interface ObjectiveFilters {
  cycleId?: string;
  level?: string;
  status?: string;
  ownerId?: string;
}

export async function getObjectives(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: ObjectiveFilters,
) {
  let query = supabase
    .from("okr_objectives")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at");

  if (filters?.cycleId) query = query.eq("period", filters.cycleId);
  if (filters?.level) query = query.eq("level", filters.level);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.ownerId) query = query.eq("owner_id", filters.ownerId);

  const { data, error } = await query;
  if (error) throw error;
  return data as ObjectiveRow[];
}

export async function createObjective(
  supabase: SupabaseClient<Database>,
  obj: Database["public"]["Tables"]["okr_objectives"]["Insert"],
) {
  const { data, error } = await supabase
    .from("okr_objectives")
    .insert(obj as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ObjectiveRow;
}

export async function updateObjective(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["okr_objectives"]["Update"],
) {
  const { data, error } = await supabase
    .from("okr_objectives")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ObjectiveRow;
}

export async function deleteObjective(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { error } = await supabase
    .from("okr_objectives")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Key Results ───────────────────────────────────────────────────────

export async function getKeyResults(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  objectiveId: string,
) {
  const { data, error } = await supabase
    .from("okr_key_results")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("objective_id", objectiveId)
    .order("created_at");
  if (error) throw error;
  return data as KeyResultRow[];
}

export async function createKeyResult(
  supabase: SupabaseClient<Database>,
  kr: Database["public"]["Tables"]["okr_key_results"]["Insert"],
) {
  const { data, error } = await supabase
    .from("okr_key_results")
    .insert(kr as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as KeyResultRow;
}

export async function updateKeyResult(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["okr_key_results"]["Update"],
) {
  const { data, error } = await supabase
    .from("okr_key_results")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as KeyResultRow;
}

export async function deleteKeyResult(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { error } = await supabase
    .from("okr_key_results")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Check-ins ─────────────────────────────────────────────────────────

export async function getCheckins(
  supabase: SupabaseClient<Database>,
  keyResultId: string,
) {
  const { data, error } = await supabase
    .from("okr_checkins")
    .select("*")
    .eq("key_result_id", keyResultId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as CheckinRow[];
}

export async function createCheckin(
  supabase: SupabaseClient<Database>,
  checkin: Database["public"]["Tables"]["okr_checkins"]["Insert"],
) {
  const { data, error } = await supabase
    .from("okr_checkins")
    .insert(checkin as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as CheckinRow;
}

// ── Comments ──────────────────────────────────────────────────────────

interface CommentRow {
  id: string;
  tenant_id: string;
  objective_id: string | null;
  key_result_id: string | null;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export async function getComments(
  supabase: SupabaseClient<Database>,
  params: { objectiveId?: string; keyResultId?: string },
) {
  let query = supabase
    .from("okr_comments" as never)
    .select("*")
    .order("created_at", { ascending: false });

  if (params.objectiveId)
    query = query.eq("objective_id" as never, params.objectiveId as never);
  if (params.keyResultId)
    query = query.eq("key_result_id" as never, params.keyResultId as never);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as CommentRow[];
}

export async function createComment(
  supabase: SupabaseClient<Database>,
  comment: {
    tenant_id: string;
    objective_id?: string | null;
    key_result_id?: string | null;
    author_id: string;
    body: string;
  },
) {
  const { data, error } = await supabase
    .from("okr_comments" as never)
    .insert(comment as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as CommentRow;
}

export async function deleteComment(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { error } = await supabase
    .from("okr_comments" as never)
    .delete()
    .eq("id" as never, id as never);
  if (error) throw error;
}

// ── KPI helpers ───────────────────────────────────────────────────────

export function computeOkrKPIs(objectives: ObjectiveRow[]) {
  const total = objectives.length;
  const avgProgress =
    total > 0
      ? objectives.reduce((s, o) => s + (o.progress ?? 0), 0) / total
      : 0;
  const onTrack = objectives.filter((o) => o.status === "on_track").length;
  const atRisk = objectives.filter(
    (o) => o.status === "at_risk" || o.status === "behind",
  ).length;
  const attention = objectives.filter((o) => o.status === "attention").length;

  return { total, avgProgress, onTrack, atRisk, attention };
}
