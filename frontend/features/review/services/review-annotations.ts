import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewAnnotation } from "@/features/review/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

export async function getAnnotationsByVersion(
  supabase: AnyClient,
  versionId: string
): Promise<ReviewAnnotation[]> {
  const { data, error } = await supabase
    .from("review_annotations")
    .select("*")
    .eq("version_id", versionId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as ReviewAnnotation[];

  // Group replies under parent annotations
  const topLevel = rows.filter((r) => r.parent_id === null);
  const repliesMap = new Map<string, ReviewAnnotation[]>();

  for (const row of rows) {
    if (row.parent_id) {
      const existing = repliesMap.get(row.parent_id) ?? [];
      existing.push(row);
      repliesMap.set(row.parent_id, existing);
    }
  }

  return topLevel.map((ann) => ({
    ...ann,
    replies: repliesMap.get(ann.id) ?? [],
  }));
}

export async function createAnnotation(
  supabase: AnyClient,
  input: {
    tenant_id: string;
    version_id: string;
    author_id: string;
    author_name: string;
    author_avatar_url?: string | null;
    content: string;
    x_pct?: number | null;
    y_pct?: number | null;
    parent_id?: string | null;
  }
): Promise<ReviewAnnotation> {
  const { data, error } = await supabase
    .from("review_annotations")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as ReviewAnnotation;
}

export async function createReply(
  supabase: AnyClient,
  input: {
    tenant_id: string;
    version_id: string;
    parent_id: string;
    author_id: string;
    author_name: string;
    author_avatar_url?: string | null;
    content: string;
  }
): Promise<ReviewAnnotation> {
  const { data, error } = await supabase
    .from("review_annotations")
    .insert({ ...input, x_pct: null, y_pct: null })
    .select()
    .single();

  if (error) throw error;
  return data as ReviewAnnotation;
}

export async function toggleResolved(
  supabase: AnyClient,
  id: string,
  resolved: boolean,
  resolvedBy?: string
): Promise<void> {
  const { error } = await supabase
    .from("review_annotations")
    .update({
      resolved,
      resolved_by: resolved ? (resolvedBy ?? null) : null,
      resolved_at: resolved ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteAnnotation(
  supabase: AnyClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("review_annotations")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
