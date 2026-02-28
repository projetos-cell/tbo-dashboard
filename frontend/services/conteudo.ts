import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type PageRow = Database["public"]["Tables"]["pages"]["Row"];

const FULL_COLS = "*";

/** Get all pages (not deleted) for the tenant */
export async function getPages(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<PageRow[]> {
  const { data, error } = await supabase
    .from("pages")
    .select(FULL_COLS)
    .eq("tenant_id", tenantId)
    .neq("is_deleted", true)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Search pages by title */
export async function searchPages(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  query: string
): Promise<PageRow[]> {
  const { data, error } = await supabase
    .from("pages")
    .select(FULL_COLS)
    .eq("tenant_id", tenantId)
    .neq("is_deleted", true)
    .ilike("title", `%${query}%`)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Get page count by space */
export async function getPageStats(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<{ total: number; withBlocks: number }> {
  const [totalRes, blocksRes] = await Promise.all([
    supabase
      .from("pages")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .neq("is_deleted", true),
    supabase
      .from("pages")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .neq("is_deleted", true)
      .eq("has_blocks", true),
  ]);

  if (totalRes.error) throw totalRes.error;
  if (blocksRes.error) throw blocksRes.error;

  return {
    total: totalRes.count ?? 0,
    withBlocks: blocksRes.count ?? 0,
  };
}
