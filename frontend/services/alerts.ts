import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

export async function listNotifications(
  supabase: SupabaseClient<Database>,
  userId: string,
  tenantId: string,
  filters?: { read?: boolean; type?: string }
): Promise<NotificationRow[]> {
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (filters?.read !== undefined) query = query.eq("read", filters.read);
  if (filters?.type) query = query.eq("type", filters.type);

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
  userId: string,
  tenantId: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true } as never)
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
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
