import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type FileAnnotationRow = Database["public"]["Tables"]["file_annotations"]["Row"];
type FileAnnotationInsert = Database["public"]["Tables"]["file_annotations"]["Insert"];

const COLS =
  "id,file_id,task_id,tenant_id,author_id,author_name,x_pct,y_pct,content,resolved,created_at,updated_at";

export async function getFileAnnotations(
  supabase: SupabaseClient<Database>,
  fileId: string
): Promise<FileAnnotationRow[]> {
  const { data, error } = await supabase
    .from("file_annotations")
    .select(COLS)
    .eq("file_id", fileId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createFileAnnotation(
  supabase: SupabaseClient<Database>,
  annotation: FileAnnotationInsert
): Promise<FileAnnotationRow> {
  const { data, error } = await supabase
    .from("file_annotations")
    .insert(annotation as never)
    .select(COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function toggleAnnotationResolved(
  supabase: SupabaseClient<Database>,
  id: string,
  resolved: boolean
): Promise<void> {
  const { error } = await supabase
    .from("file_annotations")
    .update({ resolved, updated_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteFileAnnotation(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("file_annotations")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
