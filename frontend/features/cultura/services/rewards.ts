import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type RewardRow = Database["public"]["Tables"]["recognition_rewards"]["Row"];
export type RedemptionRow = Database["public"]["Tables"]["recognition_redemptions"]["Row"];

const REWARD_COLS =
  "id,tenant_id,name,description,points_required,type,value_brl,active,budget_quarter,image_url,created_by,created_at,updated_at";
const REDEMPTION_COLS =
  "id,tenant_id,user_id,reward_id,points_spent,status,approved_by,approved_at,notes,redeemed_at,created_at";

// ─── Rewards Catalog ───

export async function getRewards(
  supabase: SupabaseClient<Database>,
  activeOnly = true
): Promise<RewardRow[]> {
  let query = supabase
    .from("recognition_rewards")
    .select(REWARD_COLS)
    .order("points_required", { ascending: true });

  if (activeOnly) query = query.eq("active", true);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createReward(
  supabase: SupabaseClient<Database>,
  reward: Database["public"]["Tables"]["recognition_rewards"]["Insert"]
): Promise<RewardRow> {
  const { data, error } = await supabase
    .from("recognition_rewards")
    .insert(reward as never)
    .select(REWARD_COLS)
    .single();
  if (error) throw error;
  return data;
}

export async function updateReward(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["recognition_rewards"]["Update"]
): Promise<RewardRow> {
  const { data, error } = await supabase
    .from("recognition_rewards")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select(REWARD_COLS)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteReward(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("recognition_rewards").delete().eq("id", id);
  if (error) throw error;
}

// ─── Redemptions ───

export async function getRedemptions(
  supabase: SupabaseClient<Database>,
  opts: { userId?: string; status?: string } = {}
): Promise<RedemptionRow[]> {
  let query = supabase
    .from("recognition_redemptions")
    .select(REDEMPTION_COLS)
    .order("created_at", { ascending: false });

  if (opts.userId) query = query.eq("user_id", opts.userId);
  if (opts.status) query = query.eq("status", opts.status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createRedemption(
  supabase: SupabaseClient<Database>,
  redemption: Database["public"]["Tables"]["recognition_redemptions"]["Insert"]
): Promise<RedemptionRow> {
  const { data, error } = await supabase
    .from("recognition_redemptions")
    .insert(redemption as never)
    .select(REDEMPTION_COLS)
    .single();
  if (error) throw error;
  return data;
}

export async function updateRedemptionStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: "approved" | "rejected" | "delivered",
  approvedBy?: string,
  notes?: string
): Promise<RedemptionRow> {
  const updates: Record<string, unknown> = { status };
  if (status === "approved" || status === "rejected") {
    updates.approved_by = approvedBy;
    updates.approved_at = new Date().toISOString();
  }
  if (notes) updates.notes = notes;

  const { data, error } = await supabase
    .from("recognition_redemptions")
    .update(updates as never)
    .eq("id", id)
    .select(REDEMPTION_COLS)
    .single();
  if (error) throw error;
  return data;
}

// ─── Rewards KPIs ───

export interface RewardsKPIs {
  totalRewards: number;
  activeRewards: number;
  totalRedemptions: number;
  pendingRedemptions: number;
  totalCostBrl: number;
  monthlyCostBrl: number;
}

export async function getRewardsKPIs(
  supabase: SupabaseClient<Database>
): Promise<RewardsKPIs> {
  const [rewardsRes, redemptionsRes] = await Promise.all([
    supabase.from("recognition_rewards").select("id,active"),
    supabase
      .from("recognition_redemptions")
      .select("id,status,points_spent,created_at"),
  ]);

  const rewards = rewardsRes.data ?? [];
  const redemptions = redemptionsRes.data ?? [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthlyRedemptions = redemptions.filter(
    (r) => (r.created_at ?? "") >= monthStart && (r.status === "approved" || r.status === "delivered")
  );

  return {
    totalRewards: rewards.length,
    activeRewards: rewards.filter((r) => r.active).length,
    totalRedemptions: redemptions.length,
    pendingRedemptions: redemptions.filter((r) => r.status === "pending").length,
    totalCostBrl: redemptions
      .filter((r) => r.status === "approved" || r.status === "delivered")
      .reduce((sum, r) => sum + (r.points_spent ?? 0), 0),
    monthlyCostBrl: monthlyRedemptions.reduce((sum, r) => sum + (r.points_spent ?? 0), 0),
  };
}
