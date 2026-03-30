import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewShareLink, SharePermission } from "@/features/review/types";

type AnyClient = SupabaseClient;

export async function getShareLinks(
  supabase: AnyClient,
  projectId: string
): Promise<ReviewShareLink[]> {
  const { data, error } = await supabase
    .from("review_share_links")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ReviewShareLink[];
}

export async function createShareLink(
  supabase: AnyClient,
  input: {
    tenant_id: string;
    project_id: string;
    reviewer_name?: string;
    reviewer_email?: string;
    permissions: SharePermission;
    expires_at?: string | null;
    created_by: string;
  }
): Promise<ReviewShareLink> {
  const { data, error } = await supabase
    .from("review_share_links")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as ReviewShareLink;
}

export async function toggleShareLink(
  supabase: AnyClient,
  id: string,
  isActive: boolean
): Promise<void> {
  const { error } = await supabase
    .from("review_share_links")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw error;
}

export async function validateShareToken(
  supabase: AnyClient,
  token: string
): Promise<ReviewShareLink | null> {
  const { data, error } = await supabase
    .from("review_share_links")
    .select("*")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (error) return null;

  const link = data as ReviewShareLink;

  // Check expiry
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return null;
  }

  return link;
}
