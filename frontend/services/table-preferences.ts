import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { ColumnPref, SortPref, TablePreference } from "@/lib/column-types";

/* ------------------------------------------------------------------ */
/* Get preferences for a specific table                                */
/* ------------------------------------------------------------------ */

export interface TablePrefsData {
  columns: ColumnPref[];
  sort?: SortPref | null;
}

export async function getTablePreferences(
  supabase: SupabaseClient<Database>,
  userId: string,
  tableId: string
): Promise<TablePrefsData | null> {
  const { data, error } = await supabase
    .from("user_table_preferences" as never)
    .select("columns, sort")
    .eq("user_id", userId)
    .eq("table_id", tableId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  return {
    columns: row.columns as ColumnPref[],
    sort: (row.sort as SortPref) ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Save (upsert) preferences for a specific table                      */
/* ------------------------------------------------------------------ */

export async function saveTablePreferences(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  userId: string,
  tableId: string,
  prefs: TablePrefsData
): Promise<void> {
  const { error } = await supabase
    .from("user_table_preferences" as never)
    .upsert(
      {
        tenant_id: tenantId,
        user_id: userId,
        table_id: tableId,
        columns: prefs.columns,
        sort: prefs.sort ?? null,
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
