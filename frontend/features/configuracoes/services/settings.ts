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

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB

export async function uploadAvatar(
  supabase: SupabaseClient<Database>,
  userId: string,
  file: File,
): Promise<string> {
  // Validate file type
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error("Formato não suportado. Use JPG, PNG, GIF ou WebP.");
  }

  // Validate file size
  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error("Arquivo muito grande. Máximo 5 MB.");
  }

  const ext = file.name.split(".").pop() ?? "png";
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

// ── Users (Admin) ────────────────────────────────────────────────────

export async function getUsers(
  supabase: SupabaseClient<Database>,
): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select()
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

export type AuditLogWithUser = AuditLogRow & {
  profiles: { full_name: string; avatar_url: string | null } | null;
};

export async function getAuditLogs(
  supabase: SupabaseClient<Database>,
  opts: {
    limit?: number;
    offset?: number;
    action?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {},
): Promise<{ data: AuditLogWithUser[]; count: number }> {
  const limit = opts.limit ?? 25;
  const offset = opts.offset ?? 0;

  let query = supabase
    .from("audit_logs")
    .select("*, profiles!audit_logs_user_id_fkey(full_name, avatar_url)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (opts.action) query = query.eq("action", opts.action);
  if (opts.entityType) query = query.eq("entity_type", opts.entityType);
  if (opts.dateFrom) query = query.gte("created_at", opts.dateFrom);
  if (opts.dateTo) query = query.lte("created_at", opts.dateTo);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as unknown as AuditLogWithUser[], count: count ?? 0 };
}
