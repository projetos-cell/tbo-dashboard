import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Tables not yet in generated types — use untyped helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tbl = (supabase: SupabaseClient<Database>, name: string) =>
  (supabase as unknown as SupabaseClient).from(name);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PortalComment {
  id: string;
  tenant_id: string;
  project_id: string;
  task_id: string | null;
  update_id: string | null;
  author_name: string;
  author_email: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortalFile {
  id: string;
  tenant_id: string;
  project_id: string;
  task_id: string | null;
  file_name: string;
  file_size: number;
  storage_path: string;
  public_url: string | null;
  uploaded_by_name: string;
  uploaded_by_email: string;
  created_at: string;
}

export interface PortalApprovalLog {
  id: string;
  tenant_id: string;
  project_id: string;
  task_id: string;
  task_title: string | null;
  status: "pending" | "approved" | "rejected" | "overdue";
  requested_at: string;
  sla_hours: number;
  deadline_at: string;
  responded_at: string | null;
  decision: "approved" | "rejected" | null;
  feedback: string | null;
  client_name: string | null;
  is_overdue: boolean;
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function getPortalComments(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<PortalComment[]> {
  const { data, error } = await tbl(supabase, "portal_comments")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PortalComment[];
}

export async function createPortalComment(
  supabase: SupabaseClient<Database>,
  params: {
    tenant_id: string;
    project_id: string;
    task_id?: string | null;
    update_id?: string | null;
    author_name: string;
    author_email: string;
    content: string;
    is_internal: boolean;
  },
): Promise<PortalComment> {
  const { data, error } = await tbl(supabase, "portal_comments")
    .insert(params)
    .select()
    .single();

  if (error) throw error;
  return data as PortalComment;
}

export async function deletePortalComment(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await tbl(supabase, "portal_comments")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ─── Files ────────────────────────────────────────────────────────────────────

export async function getPortalFiles(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<PortalFile[]> {
  const { data, error } = await tbl(supabase, "portal_files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PortalFile[];
}

export async function uploadPortalFile(
  supabase: SupabaseClient<Database>,
  params: {
    tenant_id: string;
    project_id: string;
    task_id?: string | null;
    uploaded_by_name: string;
    uploaded_by_email: string;
    file: File;
  },
): Promise<PortalFile> {
  const ext = params.file.name.split(".").pop() ?? "bin";
  const storagePath = `${params.tenant_id}/${params.project_id}/${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error: uploadError } = await (supabase as unknown as SupabaseClient).storage
    .from("portal-files")
    .upload(storagePath, params.file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data: urlData } = (supabase as unknown as SupabaseClient).storage
    .from("portal-files")
    .getPublicUrl(storagePath);

  const row = {
    tenant_id: params.tenant_id,
    project_id: params.project_id,
    task_id: params.task_id ?? null,
    file_name: params.file.name,
    file_size: params.file.size,
    storage_path: storagePath,
    public_url: urlData?.publicUrl ?? null,
    uploaded_by_name: params.uploaded_by_name,
    uploaded_by_email: params.uploaded_by_email,
  };

  const { data, error } = await tbl(supabase, "portal_files")
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return data as PortalFile;
}

export async function deletePortalFile(
  supabase: SupabaseClient<Database>,
  id: string,
  storagePath: string,
): Promise<void> {
  const { error: storageError } = await (supabase as unknown as SupabaseClient).storage
    .from("portal-files")
    .remove([storagePath]);

  if (storageError) throw storageError;

  const { error } = await tbl(supabase, "portal_files")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ─── Approvals ────────────────────────────────────────────────────────────────

export async function getApprovalLog(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<PortalApprovalLog[]> {
  const { data, error } = await tbl(supabase, "portal_approval_log")
    .select("*")
    .eq("project_id", projectId)
    .order("requested_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PortalApprovalLog[];
}

export async function requestApproval(
  supabase: SupabaseClient<Database>,
  params: {
    tenant_id: string;
    project_id: string;
    task_id: string;
    sla_hours: number;
    client_name?: string | null;
  },
): Promise<PortalApprovalLog> {
  const requestedAt = new Date();
  const deadlineAt = new Date(requestedAt.getTime() + params.sla_hours * 60 * 60 * 1000);

  const row = {
    tenant_id: params.tenant_id,
    project_id: params.project_id,
    task_id: params.task_id,
    sla_hours: params.sla_hours,
    client_name: params.client_name ?? null,
    status: "pending",
    requested_at: requestedAt.toISOString(),
    deadline_at: deadlineAt.toISOString(),
  };

  const { data, error } = await tbl(supabase, "portal_approval_log")
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return data as PortalApprovalLog;
}

export async function respondToApproval(
  supabase: SupabaseClient<Database>,
  id: string,
  params: {
    decision: "approved" | "rejected";
    feedback?: string | null;
  },
): Promise<void> {
  const { error } = await tbl(supabase, "portal_approval_log")
    .update({
      decision: params.decision,
      feedback: params.feedback ?? null,
      status: params.decision,
      responded_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function getOverdueApprovals(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<PortalApprovalLog[]> {
  const { data, error } = await tbl(supabase, "portal_approval_log")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_overdue", true)
    .order("requested_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PortalApprovalLog[];
}
