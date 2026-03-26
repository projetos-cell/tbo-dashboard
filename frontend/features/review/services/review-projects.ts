import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewProject } from "@/features/review/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

export async function getReviewProjects(
  supabase: AnyClient
): Promise<ReviewProject[]> {
  const { data, error } = await supabase
    .from("review_projects")
    .select(
      `*,
      scenes_count:review_scenes(count)`
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    scenes_count: Array.isArray(row.scenes_count)
      ? (row.scenes_count[0] as { count: number })?.count ?? 0
      : 0,
  })) as ReviewProject[];
}

export async function getReviewProject(
  supabase: AnyClient,
  id: string
): Promise<ReviewProject | null> {
  const { data, error } = await supabase
    .from("review_projects")
    .select(
      `*,
      review_scenes(
        *,
        latest_version:review_versions(
          id, version_label, version_number, file_url, thumbnail_url, status, created_at
        )
      )`
    )
    .eq("id", id)
    .order("sort_order", {
      referencedTable: "review_scenes",
      ascending: true,
    })
    .single();

  if (error) throw error;
  return data as ReviewProject;
}

export async function createReviewProject(
  supabase: AnyClient,
  input: {
    tenant_id: string;
    name: string;
    client_name?: string;
    project_id?: string | null;
    description?: string;
    created_by: string;
  }
): Promise<ReviewProject> {
  const { data, error } = await supabase
    .from("review_projects")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as ReviewProject;
}

export async function updateReviewProject(
  supabase: AnyClient,
  id: string,
  updates: Record<string, unknown>
): Promise<ReviewProject> {
  const { data, error } = await supabase
    .from("review_projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ReviewProject;
}

export async function getReviewProjectsByProject(
  supabase: AnyClient,
  projectId: string
): Promise<ReviewProject[]> {
  const { data, error } = await supabase
    .from("review_projects")
    .select(`*, scenes_count:review_scenes(count)`)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    scenes_count: Array.isArray(row.scenes_count)
      ? (row.scenes_count[0] as { count: number })?.count ?? 0
      : 0,
  })) as ReviewProject[];
}

export async function deleteReviewProject(
  supabase: AnyClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("review_projects")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
