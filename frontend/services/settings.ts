import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];

// ── Profile ──────────────────────────────────────────────────────────

export async function getProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as ProfileRow;
}

export async function updateProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  updates: Database["public"]["Tables"]["profiles"]["Update"],
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ProfileRow;
}

export async function uploadAvatar(
  supabase: SupabaseClient<Database>,
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

// ── Users (Admin) ────────────────────────────────────────────────────

export async function getUsers(
  supabase: SupabaseClient<Database>,
  tenantId: string,
): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("tenant_id", tenantId)
    .order("full_name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProfileRow[];
}

export async function updateUserRole(
  supabase: SupabaseClient<Database>,
  userId: string,
  role: string,
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() } as never)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ProfileRow;
}

// ── Audit Logs ───────────────────────────────────────────────────────

export async function getAuditLogs(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  opts: { limit?: number; offset?: number; action?: string; entityType?: string } = {},
): Promise<{ data: AuditLogRow[]; count: number }> {
  const limit = opts.limit ?? 25;
  const offset = opts.offset ?? 0;

  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (opts.action) query = query.eq("action", opts.action);
  if (opts.entityType) query = query.eq("entity_type", opts.entityType);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as AuditLogRow[], count: count ?? 0 };
}
