import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface ProjectResource {
  id: string;
  project_id: string;
  tenant_id: string;
  label: string;
  url: string;
  type: string;
  position: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateResourceParams = {
  project_id: string;
  tenant_id: string;
  label: string;
  url: string;
  type?: string;
  created_by?: string;
};

const TABLE = "project_resources" as never;

export async function getProjectResources(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<ProjectResource[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ProjectResource[];
}

export async function createProjectResource(
  supabase: SupabaseClient<Database>,
  params: CreateResourceParams,
): Promise<ProjectResource> {
  // Get next position
  const { count } = await supabase
    .from(TABLE)
    .select("*", { count: "exact", head: true })
    .eq("project_id", params.project_id);

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...params, position: count ?? 0 } as never)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ProjectResource;
}

export async function deleteProjectResource(
  supabase: SupabaseClient<Database>,
  resourceId: string,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", resourceId);

  if (error) throw error;
}
