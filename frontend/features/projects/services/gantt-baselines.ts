import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const TABLE = "gantt_baselines" as never;

export interface GanttBaselineSnapshot {
  taskId: string;
  startDate: string;
  endDate: string;
}

export interface GanttBaseline {
  id: string;
  project_id: string;
  tenant_id: string;
  name: string;
  snapshot: GanttBaselineSnapshot[];
  created_by: string | null;
  created_at: string;
}

/** Get the baseline for a project (max 1 per project). */
export async function getGanttBaseline(
  supabase: SupabaseClient<Database>,
  projectId: string
): Promise<GanttBaseline | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as GanttBaseline | null;
}

/** Save or update the baseline for a project. */
export async function saveGanttBaseline(
  supabase: SupabaseClient<Database>,
  projectId: string,
  tenantId: string,
  snapshot: GanttBaselineSnapshot[],
  userId?: string
): Promise<GanttBaseline> {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        project_id: projectId,
        tenant_id: tenantId,
        name: "Baseline",
        snapshot: JSON.stringify(snapshot),
        created_by: userId ?? null,
      } as never,
      { onConflict: "project_id" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as GanttBaseline;
}

/** Delete baseline for a project. */
export async function deleteGanttBaseline(
  supabase: SupabaseClient<Database>,
  projectId: string
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("project_id", projectId);

  if (error) throw error;
}
