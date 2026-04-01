import type { SupabaseClient } from "@supabase/supabase-js";

type Untyped = SupabaseClient<Record<string, never>>;

/* ─── Types ──────────────────────────────────────────────── */

export type AnnouncementPriority = "normal" | "important" | "urgent";

export interface AnnouncementRow {
  id: string;
  tenant_id: string;
  author_id: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  requires_read_confirmation: boolean;
  pinned: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  author_full_name?: string;
  author_avatar_url?: string;
}

export interface AnnouncementReadRow {
  announcement_id: string;
  user_id: string;
  read_at: string;
}

/* ─── Queries ────────────────────────────────────────────── */

export async function getAnnouncements(
  supabase: SupabaseClient,
  params: { tenantId: string; limit?: number },
): Promise<AnnouncementRow[]> {
  const sb = supabase as unknown as Untyped;
  const now = new Date().toISOString();

  const { data, error } = await sb
    .from("announcements")
    .select(
      "*, profiles!announcements_author_id_fkey(full_name, avatar_url)",
    )
    .eq("tenant_id", params.tenantId)
    .not("published_at", "is", null)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(params.limit ?? 20);

  if (error) throw error;

  return ((data as Record<string, unknown>[]) ?? []).map((row) => {
    const profile = row.profiles as
      | { full_name?: string; avatar_url?: string }
      | null;
    return {
      ...(row as unknown as AnnouncementRow),
      author_full_name: profile?.full_name ?? undefined,
      author_avatar_url: profile?.avatar_url ?? undefined,
    };
  });
}

export async function getUnreadAnnouncements(
  supabase: SupabaseClient,
  params: { tenantId: string; userId: string },
): Promise<AnnouncementRow[]> {
  const sb = supabase as unknown as Untyped;
  const now = new Date().toISOString();

  // Get all published announcements that require read confirmation
  const { data: announcements, error: annErr } = await sb
    .from("announcements")
    .select(
      "*, profiles!announcements_author_id_fkey(full_name, avatar_url)",
    )
    .eq("tenant_id", params.tenantId)
    .eq("requires_read_confirmation", true)
    .not("published_at", "is", null)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false });

  if (annErr) throw annErr;

  // Get user's read confirmations
  const { data: reads, error: readErr } = await sb
    .from("announcement_reads")
    .select("announcement_id")
    .eq("user_id", params.userId);

  if (readErr) throw readErr;

  const readIds = new Set(
    ((reads as { announcement_id: string }[]) ?? []).map(
      (r) => r.announcement_id,
    ),
  );

  return ((announcements as Record<string, unknown>[]) ?? [])
    .filter((row) => !readIds.has(row.id as string))
    .map((row) => {
      const profile = row.profiles as
        | { full_name?: string; avatar_url?: string }
        | null;
      return {
        ...(row as unknown as AnnouncementRow),
        author_full_name: profile?.full_name ?? undefined,
        author_avatar_url: profile?.avatar_url ?? undefined,
      };
    });
}

export async function getUserReadIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  const sb = supabase as unknown as Untyped;

  const { data, error } = await sb
    .from("announcement_reads")
    .select("announcement_id")
    .eq("user_id", userId);

  if (error) throw error;

  return new Set(
    ((data as { announcement_id: string }[]) ?? []).map(
      (r) => r.announcement_id,
    ),
  );
}

/* ─── Mutations ──────────────────────────────────────────── */

export async function createAnnouncement(
  supabase: SupabaseClient,
  payload: {
    tenantId: string;
    authorId: string;
    title: string;
    body: string;
    priority?: AnnouncementPriority;
    requiresReadConfirmation?: boolean;
    pinned?: boolean;
    publishNow?: boolean;
    expiresAt?: string | null;
  },
): Promise<AnnouncementRow> {
  const sb = supabase as unknown as Untyped;

  const insertPayload = {
    tenant_id: payload.tenantId,
    author_id: payload.authorId,
    title: payload.title,
    body: payload.body,
    priority: payload.priority ?? "normal",
    requires_read_confirmation: payload.requiresReadConfirmation ?? false,
    pinned: payload.pinned ?? false,
    published_at: payload.publishNow ? new Date().toISOString() : null,
    expires_at: payload.expiresAt ?? null,
  };

  const { data, error } = await sb
    .from("announcements")
    .insert(insertPayload as never)
    .select("*")
    .single();

  if (error) throw error;
  return data as unknown as AnnouncementRow;
}

export async function markAnnouncementRead(
  supabase: SupabaseClient,
  params: {
    announcementId: string;
    userId: string;
    tenantId: string;
  },
): Promise<void> {
  const sb = supabase as unknown as Untyped;

  const upsertPayload = {
    announcement_id: params.announcementId,
    user_id: params.userId,
    tenant_id: params.tenantId,
    read_at: new Date().toISOString(),
  };

  const { error } = await sb.from("announcement_reads").upsert(
    upsertPayload as never,
    { onConflict: "announcement_id,user_id" },
  );

  if (error) throw error;
}

export async function deleteAnnouncement(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const sb = supabase as unknown as Untyped;
  const { error } = await sb.from("announcements").delete().eq("id", id);
  if (error) throw error;
}
