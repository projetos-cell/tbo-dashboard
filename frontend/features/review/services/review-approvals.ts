import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewApproval } from "@/features/review/types";

type AnyClient = SupabaseClient;

export async function getApprovalsByVersion(
  supabase: AnyClient,
  versionId: string
): Promise<ReviewApproval[]> {
  const { data, error } = await supabase
    .from("review_approvals")
    .select("*")
    .eq("version_id", versionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ReviewApproval[];
}

export async function submitApproval(
  supabase: AnyClient,
  input: {
    tenant_id: string;
    version_id: string;
    user_id: string;
    user_name: string;
    status: "approved" | "rejected" | "changes_requested";
    notes?: string;
  }
): Promise<ReviewApproval> {
  const { data, error } = await supabase
    .from("review_approvals")
    .upsert(
      {
        ...input,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "version_id,user_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as ReviewApproval;
}

export async function resetApprovals(
  supabase: AnyClient,
  versionId: string
): Promise<void> {
  const { error } = await supabase
    .from("review_approvals")
    .delete()
    .eq("version_id", versionId);

  if (error) throw error;
}
