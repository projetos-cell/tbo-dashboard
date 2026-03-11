import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface SidebarPrefsData {
  group_order: string[];
  group_items: Record<string, string[]>;
  collapsed: string[];
}

/* ------------------------------------------------------------------ */
/* Get sidebar preferences for current user                            */
/* ------------------------------------------------------------------ */

export async function getSidebarPreferences(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<SidebarPrefsData | null> {
  const { data, error } = await supabase
    .from("user_sidebar_preferences" as never)
    .select("group_order, group_items, collapsed")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  return {
    group_order: (row.group_order as string[]) ?? [],
    group_items: (row.group_items as Record<string, string[]>) ?? {},
    collapsed: (row.collapsed as string[]) ?? [],
  };
}

/* ------------------------------------------------------------------ */
/* Save (upsert) sidebar preferences                                   */
/* ------------------------------------------------------------------ */

export async function saveSidebarPreferences(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string,
  prefs: SidebarPrefsData,
): Promise<void> {
  const { error } = await supabase
    .from("user_sidebar_preferences" as never)
    .upsert(
      {
        tenant_id: tenantId,
        user_id: userId,
        group_order: prefs.group_order,
        group_items: prefs.group_items,
        collapsed: prefs.collapsed,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "tenant_id,user_id" },
    );

  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Reset sidebar preferences (back to defaults)                        */
/* ------------------------------------------------------------------ */

export async function resetSidebarPreferences(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_sidebar_preferences" as never)
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}
