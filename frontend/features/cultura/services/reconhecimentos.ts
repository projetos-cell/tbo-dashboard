import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type RecognitionRow = Database["public"]["Tables"]["recognitions"]["Row"];
type RecognitionInsert = Database["public"]["Tables"]["recognitions"]["Insert"];

const COLS =
  "id,tenant_id,from_user,to_user,value_id,value_name,value_emoji,message,likes,points,source,reviewed,meeting_id,detection_context,created_at";

// ─── List recognitions (paginated, ordered) ───
export async function getRecognitions(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  opts: { limit?: number; offset?: number; source?: string } = {}
): Promise<{ data: RecognitionRow[]; count: number }> {
  const { limit = 50, offset = 0, source } = opts;

  let query = supabase
    .from("recognitions")
    .select(COLS, { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (source) query = query.eq("source", source);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

// ─── Get recognitions for a specific user ───
export async function getRecognitionsForUser(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string
): Promise<RecognitionRow[]> {
  const { data, error } = await supabase
    .from("recognitions")
    .select(COLS)
    .eq("tenant_id", tenantId)
    .eq("to_user", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─── Create recognition ───
export async function createRecognition(
  supabase: SupabaseClient<Database>,
  recognition: RecognitionInsert
): Promise<RecognitionRow> {
  const { data, error } = await supabase
    .from("recognitions")
    .insert(recognition as never)
    .select(COLS)
    .single();

  if (error) throw error;
  return data;
}

// ─── Like recognition ───
export async function likeRecognition(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.rpc("increment_field" as never, {
    row_id: id,
    table_name: "recognitions",
    field_name: "likes",
  } as never);
  // Fallback: direct update if RPC not available
  if (error) {
    const { data: current } = await supabase
      .from("recognitions")
      .select("likes")
      .eq("id", id)
      .single();
    await supabase
      .from("recognitions")
      .update({ likes: ((current as { likes: number } | null)?.likes ?? 0) + 1 } as never)
      .eq("id", id);
  }
}

// ─── Delete recognition ───
export async function deleteRecognition(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("recognitions").delete().eq("id", id);
  if (error) throw error;
}

// ─── Get unreviewed (Fireflies auto-detected) ───
export async function getUnreviewedRecognitions(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<RecognitionRow[]> {
  const { data, error } = await supabase
    .from("recognitions")
    .select(COLS)
    .eq("tenant_id", tenantId)
    .eq("reviewed", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─── Approve/Reject auto-detected recognition ───
export async function reviewRecognition(
  supabase: SupabaseClient<Database>,
  id: string,
  approved: boolean
): Promise<void> {
  if (approved) {
    const { error } = await supabase
      .from("recognitions")
      .update({ reviewed: true } as never)
      .eq("id", id);
    if (error) throw error;
  } else {
    await deleteRecognition(supabase, id);
  }
}

// ─── Get KPIs ───
export interface RecognitionKPIs {
  total: number;
  thisMonth: number;
  topRecognized: { user_id: string; count: number }[];
  byValue: { value_id: string; value_name: string; value_emoji: string; count: number }[];
  avgPerPerson: number;
  firefliesCount: number;
  pendingReview: number;
}

export async function getRecognitionKPIs(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<RecognitionKPIs> {
  const { data: all, error } = await supabase
    .from("recognitions")
    .select("id,to_user,value_id,value_name,value_emoji,source,reviewed,created_at")
    .eq("tenant_id", tenantId);

  if (error) throw error;
  const items = all ?? [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonth = items.filter((i) => (i.created_at ?? "") >= monthStart);

  // Top recognized
  const userCounts: Record<string, number> = {};
  items.forEach((i) => {
    userCounts[i.to_user] = (userCounts[i.to_user] || 0) + 1;
  });
  const topRecognized = Object.entries(userCounts)
    .map(([user_id, count]) => ({ user_id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // By value
  const valueCounts: Record<string, { value_name: string; value_emoji: string; count: number }> = {};
  items.forEach((i) => {
    if (!valueCounts[i.value_id]) {
      valueCounts[i.value_id] = { value_name: i.value_name ?? "", value_emoji: i.value_emoji ?? "", count: 0 };
    }
    valueCounts[i.value_id].count++;
  });
  const byValue = Object.entries(valueCounts)
    .map(([value_id, v]) => ({ value_id, ...v }))
    .sort((a, b) => b.count - a.count);

  const uniqueUsers = new Set(items.map((i) => i.to_user));
  const firefliesCount = items.filter((i) => i.source === "fireflies").length;
  const pendingReview = items.filter((i) => i.reviewed === false).length;

  return {
    total: items.length,
    thisMonth: thisMonth.length,
    topRecognized,
    byValue,
    avgPerPerson: uniqueUsers.size > 0 ? Math.round(items.length / uniqueUsers.size) : 0,
    firefliesCount,
    pendingReview,
  };
}

// ─── Get points balance for a user ───
export async function getPointsBalance(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string
): Promise<{ earned: number; spent: number; balance: number }> {
  // Points earned (received recognitions)
  const { data: recognitions } = await supabase
    .from("recognitions")
    .select("points")
    .eq("tenant_id", tenantId)
    .eq("to_user", userId);

  const earned = (recognitions ?? []).reduce((sum, r) => sum + (r.points ?? 1), 0);

  // Points spent (redemptions with approved/delivered status)
  const { data: redemptions } = await supabase
    .from("recognition_redemptions")
    .select("points_spent")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .in("status", ["approved", "delivered"]);

  const spent = (redemptions ?? []).reduce((sum, r) => sum + (r.points_spent ?? 0), 0);

  return { earned, spent, balance: earned - spent };
}

// ─── Anti-fraud: check rate limit ───
export async function checkRateLimit(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  fromUserId: string,
  maxPerDay: number = 5
): Promise<{ allowed: boolean; count: number }> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("recognitions")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("from_user", fromUserId)
    .gte("created_at", todayStart.toISOString());

  if (error) throw error;
  const count = data?.length ?? 0;
  return { allowed: count < maxPerDay, count };
}

// ─── Anti-fraud: check duplicate ───
export async function checkDuplicate(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  fromUser: string,
  toUser: string,
  valueId: string,
  windowHours: number = 24
): Promise<boolean> {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("recognitions")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("from_user", fromUser)
    .eq("to_user", toUser)
    .eq("value_id", valueId)
    .gte("created_at", since)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

// ─── Audit log ───
export async function logAudit(
  supabase: SupabaseClient<Database>,
  entry: {
    tenant_id: string;
    entity_type: string;
    entity_id: string;
    action: string;
    actor_id: string;
    old_data?: Record<string, unknown>;
    new_data?: Record<string, unknown>;
    reason?: string;
  }
): Promise<void> {
  await supabase.from("cultura_audit_log" as never).insert(entry as never);
}
