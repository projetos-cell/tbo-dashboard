/**
 * Feature #46 — Webhook / Bot messages service
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface ChatWebhook {
  id: string;
  channel_id: string;
  tenant_id: string;
  name: string;
  token: string;
  is_active: boolean;
  created_at: string;
}

export async function getChannelWebhooks(
  supabase: SupabaseClient<Database>,
  channelId: string,
): Promise<ChatWebhook[]> {
  const { data, error } = await supabase
    .from("chat_webhooks" as never)
    .select("id,channel_id,tenant_id,name,token,is_active,created_at")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ChatWebhook[];
}

export async function createWebhook(
  supabase: SupabaseClient<Database>,
  params: { channelId: string; tenantId: string; name: string; createdBy: string },
): Promise<ChatWebhook> {
  const { data, error } = await supabase
    .from("chat_webhooks" as never)
    .insert({
      channel_id: params.channelId,
      tenant_id: params.tenantId,
      name: params.name,
      created_by: params.createdBy,
    } as never)
    .select("id,channel_id,tenant_id,name,token,is_active,created_at")
    .single();
  if (error) throw error;
  return data as unknown as ChatWebhook;
}

export async function deleteWebhook(
  supabase: SupabaseClient<Database>,
  webhookId: string,
): Promise<void> {
  const { error } = await supabase
    .from("chat_webhooks" as never)
    .delete()
    .eq("id", webhookId);
  if (error) throw error;
}

export async function toggleWebhook(
  supabase: SupabaseClient<Database>,
  webhookId: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("chat_webhooks" as never)
    .update({ is_active: isActive } as never)
    .eq("id", webhookId);
  if (error) throw error;
}

/** Constructs the public URL for a webhook token */
export function getWebhookUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(".supabase.co", ".supabase.co/functions/v1") ??
    "";
  return `${base}/chat-webhook?token=${token}`;
}
