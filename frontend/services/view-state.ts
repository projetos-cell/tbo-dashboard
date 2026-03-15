import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ViewState {
  filters: Record<string, unknown>;
  sort: SortSpec[];
}

export interface SortSpec {
  field: string;
  dir: "asc" | "desc";
}

// ---------------------------------------------------------------------------
// Load view state for (user, workspace, view_key)
// ---------------------------------------------------------------------------

export async function loadViewState(
  supabase: SupabaseClient<Database>,
  userId: string,
  workspace: string,
  viewKey: string
): Promise<ViewState | null> {
  const { data, error } = await supabase
    .from("user_view_state" as never)
    .select("filters_json, sort_json" as never)
    .eq("user_id" as never, userId as never)
    .eq("workspace" as never, workspace as never)
    .eq("view_key" as never, viewKey as never)
    .maybeSingle();

  if (error) {
    console.warn("[loadViewState] failed:", error.message);
    return null;
  }

  if (!data) return null;

  const row = data as unknown as Record<string, unknown>;
  return {
    filters: (row.filters_json ?? {}) as Record<string, unknown>,
    sort: (row.sort_json ?? []) as unknown as SortSpec[],
  };
}

// ---------------------------------------------------------------------------
// Upsert view state (optimistic — caller handles rollback)
// ---------------------------------------------------------------------------

export async function saveViewState(
  supabase: SupabaseClient<Database>,
  userId: string,
  tenantId: string,
  workspace: string,
  viewKey: string,
  state: ViewState
): Promise<void> {
  const { error } = await supabase
    .from("user_view_state" as never)
    .upsert(
      {
        user_id: userId,
        tenant_id: tenantId,
        workspace,
        view_key: viewKey,
        filters_json: state.filters as Json,
        sort_json: state.sort as unknown as Json,
      } as never,
      { onConflict: "user_id,workspace,view_key" }
    );

  if (error) throw error;
}
