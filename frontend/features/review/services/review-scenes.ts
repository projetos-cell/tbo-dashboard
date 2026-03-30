import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewScene } from "@/features/review/types";

type AnyClient = SupabaseClient;

export async function getScenesByProject(
  supabase: AnyClient,
  projectId: string
): Promise<ReviewScene[]> {
  const { data, error } = await supabase
    .from("review_scenes")
    .select(
      `*,
      review_versions(id, version_label, version_number, file_url, thumbnail_url, status, created_at)`
    )
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => {
    const versions = (Array.isArray(row.review_versions) ? row.review_versions : []) as Array<{ version_number: number }>;
    const sorted = [...versions].sort((a, b) => b.version_number - a.version_number);
    return {
      ...row,
      versions_count: versions.length,
      annotations_count: 0,
      latest_version: sorted[0] ?? null,
    };
  }) as ReviewScene[];
}

export async function getScene(
  supabase: AnyClient,
  id: string
): Promise<ReviewScene | null> {
  const { data, error } = await supabase
    .from("review_scenes")
    .select(
      `*,
      review_versions(*, review_annotations(count), review_approvals(*))`
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ReviewScene;
}

export async function createScene(
  supabase: AnyClient,
  input: {
    tenant_id: string;
    project_id: string;
    name: string;
    description?: string;
    scene_type?: string;
    sort_order?: number;
  }
): Promise<ReviewScene> {
  const { data, error } = await supabase
    .from("review_scenes")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as ReviewScene;
}

export async function updateScene(
  supabase: AnyClient,
  id: string,
  updates: Record<string, unknown>
): Promise<ReviewScene> {
  const { data, error } = await supabase
    .from("review_scenes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ReviewScene;
}

export async function deleteScene(
  supabase: AnyClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("review_scenes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function reorderScenes(
  supabase: AnyClient,
  updates: Array<{ id: string; sort_order: number }>
): Promise<void> {
  const promises = updates.map(({ id, sort_order }) =>
    supabase
      .from("review_scenes")
      .update({ sort_order })
      .eq("id", id)
  );

  const results = await Promise.all(promises);
  for (const { error } of results) {
    if (error) throw error;
  }
}
