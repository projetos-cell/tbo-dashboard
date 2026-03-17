import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// NOTE: Tables (marketing_campaigns, etc.) will be created via migration.
// Until then, cast to untyped SupabaseClient to bypass strict DB typing.
import type {
  MarketingCampaign,
  CampaignBriefing,
  CampaignPiece,
  CampaignBudget,
} from "../types/marketing";

type Client = SupabaseClient<Database>;

// ── Campaigns ──────────────────────────────────────────────────────

export async function getCampaigns(supabase: Client): Promise<MarketingCampaign[]> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_campaigns")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as MarketingCampaign[];
}

export async function getCampaign(supabase: Client, id: string): Promise<MarketingCampaign> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_campaigns")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as MarketingCampaign;
}

export async function createCampaign(
  supabase: Client,
  campaign: Omit<MarketingCampaign, "id" | "created_at" | "updated_at">,
): Promise<MarketingCampaign> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_campaigns")
    .insert(campaign as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as MarketingCampaign;
}

export async function updateCampaign(
  supabase: Client,
  id: string,
  updates: Partial<MarketingCampaign>,
): Promise<MarketingCampaign> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_campaigns")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as MarketingCampaign;
}

export async function deleteCampaign(supabase: Client, id: string): Promise<void> {
  const { error } = await (supabase as SupabaseClient).from("marketing_campaigns").delete().eq("id", id);
  if (error) throw error;
}

// ── Briefings ──────────────────────────────────────────────────────

export async function getCampaignBriefings(
  supabase: Client,
  campaignId: string,
): Promise<CampaignBriefing[]> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_campaign_briefings")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CampaignBriefing[];
}

export async function createCampaignBriefing(
  supabase: Client,
  briefing: Omit<CampaignBriefing, "id" | "created_at" | "updated_at">,
): Promise<CampaignBriefing> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_campaign_briefings")
    .insert(briefing as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as CampaignBriefing;
}

// ── Pieces ─────────────────────────────────────────────────────────

export async function getCampaignPieces(
  supabase: Client,
  campaignId: string,
): Promise<CampaignPiece[]> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_campaign_pieces")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CampaignPiece[];
}

export async function createCampaignPiece(
  supabase: Client,
  piece: Omit<CampaignPiece, "id" | "created_at" | "updated_at">,
): Promise<CampaignPiece> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_campaign_pieces")
    .insert(piece as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as CampaignPiece;
}

// ── Budget ─────────────────────────────────────────────────────────

export async function getCampaignBudget(
  supabase: Client,
  campaignId: string,
): Promise<CampaignBudget[]> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_campaign_budget")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CampaignBudget[];
}

export async function createBudgetItem(
  supabase: Client,
  item: Omit<CampaignBudget, "id" | "created_at">,
): Promise<CampaignBudget> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_campaign_budget")
    .insert(item as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as CampaignBudget;
}

// ── Briefing update ─────────────────────────────────────────────────

export async function updateCampaignBriefing(
  supabase: Client,
  id: string,
  updates: Partial<CampaignBriefing>,
): Promise<CampaignBriefing> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_campaign_briefings")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as CampaignBriefing;
}

// ── Piece update / delete ───────────────────────────────────────────

export async function updateCampaignPiece(
  supabase: Client,
  id: string,
  updates: Partial<CampaignPiece>,
): Promise<CampaignPiece> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_campaign_pieces")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as CampaignPiece;
}

export async function deleteCampaignPiece(supabase: Client, id: string): Promise<void> {
  const { error } = await (supabase as SupabaseClient)
    .from("marketing_campaign_pieces")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Budget update / delete ──────────────────────────────────────────

export async function updateBudgetItem(
  supabase: Client,
  id: string,
  updates: Partial<CampaignBudget>,
): Promise<CampaignBudget> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("marketing_campaign_budget")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as CampaignBudget;
}

export async function deleteBudgetItem(supabase: Client, id: string): Promise<void> {
  const { error } = await (supabase as SupabaseClient)
    .from("marketing_campaign_budget")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
