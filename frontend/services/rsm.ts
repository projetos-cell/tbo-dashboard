import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type RsmAccountRow = Database["public"]["Tables"]["rsm_accounts"]["Row"];
type RsmPostRow = Database["public"]["Tables"]["rsm_posts"]["Row"];
type RsmIdeaRow = Database["public"]["Tables"]["rsm_ideas"]["Row"];

// ── Accounts ──────────────────────────────────────────────────

export async function listAccounts(
  supabase: SupabaseClient<Database>
): Promise<RsmAccountRow[]> {
  const { data, error } = await supabase
    .from("rsm_accounts")
    .select("*")
    .order("platform");
  if (error) throw error;
  return (data ?? []) as RsmAccountRow[];
}

// ── Posts ──────────────────────────────────────────────────────

export async function listPosts(
  supabase: SupabaseClient<Database>,
  filters?: {
    accountId?: string;
    status?: string;
  }
): Promise<RsmPostRow[]> {
  let query = supabase
    .from("rsm_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.accountId) query = query.eq("account_id", filters.accountId);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as RsmPostRow[];
}

export async function createPost(
  supabase: SupabaseClient<Database>,
  post: Database["public"]["Tables"]["rsm_posts"]["Insert"]
): Promise<RsmPostRow> {
  const { data, error } = await supabase
    .from("rsm_posts")
    .insert(post as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as RsmPostRow;
}

export async function updatePost(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["rsm_posts"]["Update"]
): Promise<RsmPostRow> {
  const { data, error } = await supabase
    .from("rsm_posts")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as RsmPostRow;
}

export async function deletePost(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("rsm_posts")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Ideas ─────────────────────────────────────────────────────

export async function listIdeas(
  supabase: SupabaseClient<Database>,
  filters?: {
    status?: string;
  }
): Promise<RsmIdeaRow[]> {
  let query = supabase
    .from("rsm_ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as RsmIdeaRow[];
}

export async function createIdea(
  supabase: SupabaseClient<Database>,
  idea: Database["public"]["Tables"]["rsm_ideas"]["Insert"]
): Promise<RsmIdeaRow> {
  const { data, error } = await supabase
    .from("rsm_ideas")
    .insert(idea as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as RsmIdeaRow;
}

export async function updateIdea(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["rsm_ideas"]["Update"]
): Promise<RsmIdeaRow> {
  const { data, error } = await supabase
    .from("rsm_ideas")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as RsmIdeaRow;
}

export async function deleteIdea(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("rsm_ideas")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Single Account ───────────────────────────────────────────

export async function getAccount(
  supabase: SupabaseClient<Database>,
  accountId: string
): Promise<RsmAccountRow> {
  const { data, error } = await supabase
    .from("rsm_accounts")
    .select("*")
    .eq("id", accountId)
    .single();
  if (error) throw error;
  return data as RsmAccountRow;
}

// ── Metrics ──────────────────────────────────────────────────

export async function listMetrics(
  supabase: SupabaseClient<Database>,
  accountId: string
): Promise<Database["public"]["Tables"]["rsm_metrics"]["Row"][]> {
  const { data, error } = await supabase
    .from("rsm_metrics")
    .select("*")
    .eq("account_id", accountId)
    .order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Database["public"]["Tables"]["rsm_metrics"]["Row"][];
}

// ── Account mutations ────────────────────────────────────────

export async function createAccount(
  supabase: SupabaseClient<Database>,
  account: Database["public"]["Tables"]["rsm_accounts"]["Insert"]
): Promise<RsmAccountRow> {
  const { data, error } = await supabase
    .from("rsm_accounts")
    .insert(account as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as RsmAccountRow;
}

export async function updateAccount(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["rsm_accounts"]["Update"]
): Promise<RsmAccountRow> {
  const { data, error } = await supabase
    .from("rsm_accounts")
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as RsmAccountRow;
}

// ── KPI helpers (client-side aggregation) ─────────────────────

export interface RsmKPIs {
  totalAccounts: number;
  totalFollowers: number;
  postsThisMonth: number;
  scheduledPosts: number;
}

export function computeRsmKPIs(
  accounts: RsmAccountRow[],
  posts: RsmPostRow[]
): RsmKPIs {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const activeAccounts = accounts.filter((a) => a.is_active !== false);
  const totalFollowers = activeAccounts.reduce(
    (sum, a) => sum + (a.followers_count ?? 0),
    0
  );

  const postsThisMonth = posts.filter(
    (p) =>
      p.published_date &&
      p.published_date >= monthStart &&
      p.status === "published"
  ).length;

  const scheduledPosts = posts.filter(
    (p) => p.status === "scheduled"
  ).length;

  return {
    totalAccounts: activeAccounts.length,
    totalFollowers,
    postsThisMonth,
    scheduledPosts,
  };
}
