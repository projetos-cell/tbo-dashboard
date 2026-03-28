import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface TaskAttachment {
  id: string;
  tenant_id: string;
  task_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  storage_path: string | null;
  created_at: string;
}

export async function getTaskAttachments(
  supabase: SupabaseClient<Database>,
  taskId: string,
): Promise<TaskAttachment[]> {
  const { data, error } = await supabase
    .from("task_attachments" as never)
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TaskAttachment[];
}

export async function uploadTaskAttachment(
  supabase: SupabaseClient<Database>,
  params: {
    tenant_id: string;
    task_id: string;
    user_id: string;
    file: File;
  },
): Promise<TaskAttachment> {
  const ext = params.file.name.split(".").pop() ?? "bin";
  const fileName = `${params.tenant_id}/${params.task_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("task-attachments")
    .upload(fileName, params.file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("task-attachments")
    .getPublicUrl(fileName);

  const fileUrl = urlData.publicUrl;

  // Insert row
  const { data, error } = await supabase
    .from("task_attachments" as never)
    .insert({
      tenant_id: params.tenant_id,
      task_id: params.task_id,
      uploaded_by: params.user_id,
      file_name: params.file.name,
      file_url: fileUrl,
      file_size: params.file.size,
      file_type: params.file.type || null,
      storage_path: fileName,
    } as never)
    .select()
    .single();

  if (error) throw error;
  return data as TaskAttachment;
}

export async function deleteTaskAttachment(
  supabase: SupabaseClient<Database>,
  id: string,
  storagePath: string | null,
): Promise<void> {
  // Remove from storage if path exists
  if (storagePath) {
    await supabase.storage.from("task-attachments").remove([storagePath]);
  }

  const { error } = await supabase
    .from("task_attachments" as never)
    .delete()
    .eq("id", id);

  if (error) throw error;
}
