import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  SOP,
  SOPInsert,
  SOPUpdate,
  SOPVersion,
  SOPStep,
  SOPStepInsert,
  SOPStepUpdate,
  SOPBu,
} from "../types/sops";

const SOP_COLS =
  "id,tenant_id,title,slug,bu,category,description,content,content_html,author_id,status,priority,tags,order_index,version,last_reviewed_at,last_reviewed_by,created_at,updated_at";

const STEP_COLS =
  "id,sop_id,title,content,content_html,order_index,step_type,media_url,created_at,updated_at";

const VERSION_COLS =
  "id,sop_id,version,title,content,edited_by,change_summary,created_at";

// ─── SOPs ────────────────────────────────────────────────────────

export async function getSops(
  supabase: SupabaseClient,
  bu?: SOPBu,
  status?: string
): Promise<SOP[]> {
  let query = (supabase as SupabaseClient)
    .from("knowledge_sops")
    .select(SOP_COLS)
    .order("order_index", { ascending: true });

  if (bu) query = query.eq("bu", bu);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SOP[];
}

export async function getSop(
  supabase: SupabaseClient,
  id: string
): Promise<SOP | null> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("knowledge_sops")
    .select(SOP_COLS)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as SOP | null;
}

export async function getSopBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<SOP | null> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("knowledge_sops")
    .select(SOP_COLS)
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data as SOP | null;
}

export async function createSop(
  supabase: SupabaseClient,
  sop: SOPInsert
): Promise<SOP> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("knowledge_sops")
    .insert(sop as never)
    .select(SOP_COLS)
    .single();

  if (error) throw error;
  return data as SOP;
}

export async function updateSop(
  supabase: SupabaseClient,
  id: string,
  updates: SOPUpdate,
  editedBy?: string
): Promise<SOP> {
  // Salvar versão anterior
  const { data: currentRaw } = await (supabase as SupabaseClient)
    .from("knowledge_sops")
    .select("version,title,content")
    .eq("id", id)
    .single();

  const current = currentRaw as { version: number | null; title: string | null; content: string | null } | null;
  const newVersion = (current?.version ?? 0) + 1;

  if (current && editedBy) {
    await (supabase as SupabaseClient)
      .from("knowledge_sop_versions")
      .insert({
        sop_id: id,
        version: current.version ?? 1,
        title: current.title ?? "",
        content: current.content,
        edited_by: editedBy,
      } as never);
  }

  const { data, error } = await (supabase as SupabaseClient)
    .from("knowledge_sops")
    .update({
      ...updates,
      version: newVersion,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .select(SOP_COLS)
    .single();

  if (error) throw error;
  return data as SOP;
}

export async function deleteSop(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await (supabase as SupabaseClient)
    .from("knowledge_sops")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function reorderSops(
  supabase: SupabaseClient,
  items: { id: string; order_index: number }[]
): Promise<void> {
  await Promise.all(
    items.map(({ id, order_index }) =>
      (supabase as SupabaseClient)
        .from("knowledge_sops")
        .update({ order_index } as never)
        .eq("id", id)
    )
  );
}

// ─── Steps ───────────────────────────────────────────────────────

export async function getSopSteps(
  supabase: SupabaseClient,
  sopId: string
): Promise<SOPStep[]> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("knowledge_sop_steps")
    .select(STEP_COLS)
    .eq("sop_id", sopId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SOPStep[];
}

export async function createSopStep(
  supabase: SupabaseClient,
  step: SOPStepInsert
): Promise<SOPStep> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("knowledge_sop_steps")
    .insert(step as never)
    .select(STEP_COLS)
    .single();

  if (error) throw error;
  return data as SOPStep;
}

export async function updateSopStep(
  supabase: SupabaseClient,
  id: string,
  updates: SOPStepUpdate
): Promise<SOPStep> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("knowledge_sop_steps")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select(STEP_COLS)
    .single();

  if (error) throw error;
  return data as SOPStep;
}

export async function deleteSopStep(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await (supabase as SupabaseClient)
    .from("knowledge_sop_steps")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function reorderSopSteps(
  supabase: SupabaseClient,
  items: { id: string; order_index: number }[]
): Promise<void> {
  await Promise.all(
    items.map(({ id, order_index }) =>
      (supabase as SupabaseClient)
        .from("knowledge_sop_steps")
        .update({ order_index } as never)
        .eq("id", id)
    )
  );
}

// ─── Versions ────────────────────────────────────────────────────

export async function getSopVersions(
  supabase: SupabaseClient,
  sopId: string
): Promise<SOPVersion[]> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("knowledge_sop_versions")
    .select(VERSION_COLS)
    .eq("sop_id", sopId)
    .order("version", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SOPVersion[];
}
