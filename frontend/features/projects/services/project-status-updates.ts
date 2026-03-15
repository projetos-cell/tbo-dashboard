import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface ProjectStatusUpdate {
  id: string;
  project_id: string;
  tenant_id: string;
  author_id: string;
  author_name: string;
  health: "on_track" | "at_risk" | "off_track";
  content: string;
  created_at: string;
  updated_at: string;
}

const TABLE = "project_status_updates" as never;

export async function getProjectStatusUpdates(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<ProjectStatusUpdate[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as ProjectStatusUpdate[];
}

export async function createProjectStatusUpdate(
  supabase: SupabaseClient<Database>,
  params: {
    project_id: string;
    tenant_id: string;
    author_id: string;
    author_name: string;
    health: string;
    content: string;
  },
): Promise<ProjectStatusUpdate> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(params as never)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ProjectStatusUpdate;
}

export async function deleteProjectStatusUpdate(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
}
