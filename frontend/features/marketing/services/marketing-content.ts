import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// NOTE: Tables will be created via migration. Cast to untyped SupabaseClient.
import type {
  ContentItem,
  ContentBrief,
  ContentAsset,
  ContentApproval,
} from "../types/marketing";

type Client = SupabaseClient<Database>;

// ── Content Items ──────────────────────────────────────────────────

export async function getContentItems(supabase: Client): Promise<ContentItem[]> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_content")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ContentItem[];
}

export async function getContentItem(supabase: Client, id: string): Promise<ContentItem> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_content")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as ContentItem;
}

export async function createContentItem(
  supabase: Client,
  item: Omit<ContentItem, "id" | "created_at" | "updated_at">,
): Promise<ContentItem> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_content")
    .insert(item as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ContentItem;
}

export async function updateContentItem(
  supabase: Client,
  id: string,
  updates: Partial<ContentItem>,
): Promise<ContentItem> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_content")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ContentItem;
}

export async function deleteContentItem(supabase: Client, id: string): Promise<void> {
  const { error } = await (supabase as SupabaseClient).from("marketing_content").delete().eq("id", id);
  if (error) throw error;
}

// ── Briefs ─────────────────────────────────────────────────────────

export async function getContentBriefs(supabase: Client): Promise<ContentBrief[]> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_content_briefs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ContentBrief[];
}

export async function createContentBrief(
  supabase: Client,
  brief: Omit<ContentBrief, "id" | "created_at" | "updated_at">,
): Promise<ContentBrief> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_content_briefs")
    .insert(brief as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ContentBrief;
}

export async function updateContentBrief(
  supabase: Client,
  id: string,
  updates: Partial<ContentBrief>,
): Promise<ContentBrief> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_content_briefs")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ContentBrief;
}

// ── Assets ─────────────────────────────────────────────────────────

export async function getContentAssets(supabase: Client): Promise<ContentAsset[]> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_content_assets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ContentAsset[];
}

export async function uploadContentAsset(
  supabase: Client,
  asset: Omit<ContentAsset, "id" | "created_at">,
): Promise<ContentAsset> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_content_assets")
    .insert(asset as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ContentAsset;
}

export async function deleteContentAsset(supabase: Client, id: string): Promise<void> {
  const { error } = await (supabase as SupabaseClient).from("marketing_content_assets").delete().eq("id", id);
  if (error) throw error;
}

// ── Approvals ──────────────────────────────────────────────────────

export async function getContentApprovals(supabase: Client): Promise<ContentApproval[]> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_content_approvals")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ContentApproval[];
}

export async function updateApprovalStatus(
  supabase: Client,
  id: string,
  status: ContentApproval["status"],
  feedback?: string,
): Promise<ContentApproval> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_content_approvals")
    .update({ status, feedback, reviewed_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ContentApproval;
}
