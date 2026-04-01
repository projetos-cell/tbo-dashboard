import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// file_annotations table not in generated types — define manually
export interface FileAnnotationRow {
  id: string;
  file_id: string;
  task_id: string | null;
  tenant_id: string;
  author_id: string;
  author_name: string;
  x_pct: number;
  y_pct: number;
  content: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}
export type FileAnnotationInsert = Partial<FileAnnotationRow> & {
  file_id: string;
  tenant_id: string;
  author_id: string;
  author_name: string;
  content: string;
  x_pct: number;
  y_pct: number;
};

// Use untyped client to bypass missing table in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedClient = SupabaseClient<any>;

const COLS =
  "id,file_id,task_id,tenant_id,author_id,author_name,x_pct,y_pct,content,resolved,created_at,updated_at";

export async function getFileAnnotations(
  supabase: SupabaseClient<Database>,
  fileId: string
): Promise<FileAnnotationRow[]> {
  const db = supabase as unknown as UntypedClient;
  const { data, error } = await db
    .from("file_annotations")
    .select(COLS)
    .eq("file_id", fileId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as FileAnnotationRow[];
}

export async function createFileAnnotation(
  supabase: SupabaseClient<Database>,
  annotation: FileAnnotationInsert
): Promise<FileAnnotationRow> {
  const db = supabase as unknown as UntypedClient;
  const { data, error } = await db
    .from("file_annotations")
    .insert(annotation)
    .select(COLS)
    .single();

  if (error) throw error;
  return data as FileAnnotationRow;
}

export async function toggleAnnotationResolved(
  supabase: SupabaseClient<Database>,
  id: string,
  resolved: boolean
): Promise<void> {
  const db = supabase as unknown as UntypedClient;
  const { error } = await db
    .from("file_annotations")
    .update({ resolved, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteFileAnnotation(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const db = supabase as unknown as UntypedClient;
  const { error } = await db
    .from("file_annotations")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
