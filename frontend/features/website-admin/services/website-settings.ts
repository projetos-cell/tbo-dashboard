import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { WebsiteSettings, WebsiteSettingsUpdate } from "../types";

type Client = SupabaseClient<Database>;

export async function getWebsiteSettings(
  supabase: Client,
): Promise<WebsiteSettings | null> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("website_settings")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as WebsiteSettings | null;
}

export async function upsertWebsiteSettings(
  supabase: Client,
  tenantId: string,
  updates: WebsiteSettingsUpdate,
): Promise<WebsiteSettings> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("website_settings")
    .upsert(
      { tenant_id: tenantId, ...updates } as never,
      { onConflict: "tenant_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data as WebsiteSettings;
}
