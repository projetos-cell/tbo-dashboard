import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewVersion } from "@/features/review/types";
import { getVersionLabel } from "@/features/review/types";
import { REVIEW_BUCKET } from "@/features/review/constants";

type AnyClient = SupabaseClient;

export async function getVersionsByScene(
  supabase: AnyClient,
  sceneId: string
): Promise<ReviewVersion[]> {
  const { data, error } = await supabase
    .from("review_versions")
    .select(`*, annotations_count:review_annotations(count), review_approvals(*)`)
    .eq("scene_id", sceneId)
    .order("version_number", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    annotations_count: Array.isArray(row.annotations_count)
      ? (row.annotations_count[0] as { count: number })?.count ?? 0
      : 0,
    approvals: (row.review_approvals as unknown[]) ?? [],
  })) as ReviewVersion[];
}

export async function getVersion(
  supabase: AnyClient,
  id: string
): Promise<ReviewVersion | null> {
  const { data, error } = await supabase
    .from("review_versions")
    .select(`*, review_annotations(count), review_approvals(*)`)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ReviewVersion;
}

export async function createVersion(
  supabase: AnyClient,
  input: {
    tenant_id: string;
    scene_id: string;
    file_url: string;
    file_path?: string;
    thumbnail_url?: string;
    file_size_bytes?: number;
    mime_type?: string;
    uploaded_by: string;
    uploaded_by_name: string;
  }
): Promise<ReviewVersion> {
  // Auto-calculate next version_number
  const { data: existing } = await supabase
    .from("review_versions")
    .select("version_number")
    .eq("scene_id", input.scene_id)
    .order("version_number", { ascending: false })
    .limit(1);

  const maxNum = (existing?.[0] as { version_number: number } | undefined)?.version_number ?? -1;
  const version_number = maxNum + 1;
  const version_label = getVersionLabel(version_number);

  const { data, error } = await supabase
    .from("review_versions")
    .insert({
      ...input,
      version_number,
      version_label,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data as ReviewVersion;
}

export async function updateVersionStatus(
  supabase: AnyClient,
  id: string,
  status: string
): Promise<ReviewVersion> {
  const { data, error } = await supabase
    .from("review_versions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ReviewVersion;
}

export interface UploadVersionResult {
  publicUrl: string;
  storagePath: string;
}

export async function uploadVersionFile(
  supabase: AnyClient,
  file: File,
  meta: {
    tenantId: string;
    projectId: string;
    sceneId: string;
    versionLabel: string;
  }
): Promise<UploadVersionResult> {
  const ext = file.name.includes(".")
    ? `.${file.name.split(".").pop()?.toLowerCase()}`
    : "";
  const storagePath = `${meta.tenantId}/${meta.projectId}/${meta.sceneId}/${meta.versionLabel}${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(REVIEW_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: true });

  if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);

  const { data: urlData } = supabase.storage
    .from(REVIEW_BUCKET)
    .getPublicUrl(storagePath);

  return { publicUrl: urlData.publicUrl, storagePath };
}
