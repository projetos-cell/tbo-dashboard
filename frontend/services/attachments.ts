import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type AttachmentRow = Database["public"]["Tables"]["project_attachments"]["Row"];

const ATTACH_COLS =
  "id,tenant_id,task_id,project_id,file_name,file_path,file_size,mime_type,uploaded_by,created_at";

export async function getAttachments(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  filters?: { task_id?: string; project_id?: string }
): Promise<AttachmentRow[]> {
  let query = supabase
    .from("project_attachments")
    .select(ATTACH_COLS)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (filters?.task_id) query = query.eq("task_id", filters.task_id);
  if (filters?.project_id) query = query.eq("project_id", filters.project_id);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function uploadAttachment(
  supabase: SupabaseClient<Database>,
  file: File,
  meta: {
    tenantId: string;
    projectId?: string;
    taskId?: string;
    uploadedBy?: string;
  }
): Promise<AttachmentRow> {
  const filePath = `${meta.tenantId}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("project-attachments")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("project_attachments")
    .insert({
      tenant_id: meta.tenantId,
      project_id: meta.projectId ?? null,
      task_id: meta.taskId ?? null,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: meta.uploadedBy ?? null,
    } as never)
    .select(ATTACH_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAttachment(
  supabase: SupabaseClient<Database>,
  id: string,
  filePath: string
): Promise<void> {
  await supabase.storage.from("project-attachments").remove([filePath]);

  const { error } = await supabase
    .from("project_attachments")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getSignedUrl(
  supabase: SupabaseClient<Database>,
  filePath: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from("project-attachments")
    .createSignedUrl(filePath, 3600);

  if (error) throw error;
  return data.signedUrl;
}
