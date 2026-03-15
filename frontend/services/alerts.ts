import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type NotificationRow =
  Database["public"]["Tables"]["notifications"]["Row"];

export type NotificationTriggerType =
  | "mention"
  | "thread_reply"
  | "task_assigned"
  | "task_updated"
  | "task_overdue"
  | "task_reminder";

export interface NotificationFilters {
  read?: boolean;
  type?: string;
  triggerType?: NotificationTriggerType;
}

export async function listNotifications(
  supabase: SupabaseClient<Database>,
  userId: string,
  filters?: NotificationFilters
): Promise<NotificationRow[]> {
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters?.read !== undefined) query = query.eq("read", filters.read);
  if (filters?.type) query = query.eq("type", filters.type);
  if (filters?.triggerType)
    query = query.eq("trigger_type", filters.triggerType);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function markAsRead(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true } as never)
    .eq("id", id);

  if (error) throw error;
}

export async function markAllAsRead(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true } as never)
    .eq("user_id", userId)
    .eq("read", false);

  if (error) throw error;
}

export async function deleteNotification(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) throw error;
}

// ─── Actor name lookup (cached in-memory per session) ───

const actorNameCache = new Map<string, string>();

export async function getActorName(
  supabase: SupabaseClient<Database>,
  actorId: string
): Promise<string> {
  if (actorNameCache.has(actorId)) return actorNameCache.get(actorId)!;

  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", actorId)
    .single();

  const name = data?.full_name ?? "Alguém";
  actorNameCache.set(actorId, name);
  return name;
}

// Batch-fetch actor names for a list of notifications
export async function enrichActorNames(
  supabase: SupabaseClient<Database>,
  notifications: NotificationRow[]
): Promise<Map<string, string>> {
  const actorIds = [
    ...new Set(
      notifications
        .map((n) => n.actor_id)
        .filter((id): id is string => !!id)
    ),
  ];

  // Filter out already-cached
  const uncached = actorIds.filter((id) => !actorNameCache.has(id));
  if (uncached.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id,full_name,avatar_url")
      .in("id", uncached);

    for (const profile of data ?? []) {
      actorNameCache.set(profile.id, profile.full_name);
    }
  }

  const map = new Map<string, string>();
  for (const id of actorIds) {
    map.set(id, actorNameCache.get(id) ?? "Alguém");
  }
  return map;
}

// ─── KPIs ───

export interface AlertKPIs {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}

export function computeAlertKPIs(notifications: NotificationRow[]): AlertKPIs {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString();

  return {
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    today: notifications.filter(
      (n) => n.created_at && n.created_at >= todayStart
    ).length,
    thisWeek: notifications.filter(
      (n) => n.created_at && n.created_at >= weekStartStr
    ).length,
  };
}
