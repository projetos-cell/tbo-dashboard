import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { ColumnPref, TablePreference } from "@/lib/column-types";

/* ------------------------------------------------------------------ */
/* Get preferences for a specific table                                */
/* ------------------------------------------------------------------ */

export async function getTablePreferences(
  supabase: SupabaseClient<Database>,
  userId: string,
  tableId: string
): Promise<ColumnPref[] | null> {
  const { data, error } = await supabase
    .from("user_table_preferences" as never)
    .select("columns")
    .eq("user_id", userId)
    .eq("table_id", tableId)
    .maybeSingle();

  if (error || !data) return null;
  return (data as Record<string, unknown>).columns as ColumnPref[];
}

/* ------------------------------------------------------------------ */
/* Save (upsert) preferences for a specific table                      */
/* ------------------------------------------------------------------ */

export async function saveTablePreferences(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string,
  tableId: string,
  columns: ColumnPref[]
): Promise<void> {
  const { error } = await supabase
    .from("user_table_preferences" as never)
    .upsert(
      {
        tenant_id: tenantId,
        user_id: userId,
        table_id: tableId,
        columns,
      } as never,
      { onConflict: "tenant_id,user_id,table_id" }
    );

  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/* Delete preferences (reset to defaults)                              */
/* ------------------------------------------------------------------ */

export async function resetTablePreferences(
  supabase: SupabaseClient<Database>,
  userId: string,
  tableId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_table_preferences" as never)
    .delete()
    .eq("user_id", userId)
    .eq("table_id", tableId);

  if (error) throw error;
}
