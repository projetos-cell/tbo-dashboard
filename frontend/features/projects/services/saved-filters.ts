import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface SavedFilter {
  id: string;
  tenant_id: string;
  user_id: string;
  view_key: string;
  name: string | null;
  filters: Record<string, unknown>;
  sort_config: Record<string, unknown>;
  group_config: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export async function getSavedFilters(
  supabase: SupabaseClient<Database>,
  userId: string,
  viewKey: string,
): Promise<SavedFilter[]> {
  const { data, error } = await supabase
    .from("saved_view_filters" as never)
    .select("*")
    .eq("user_id", userId)
    .eq("view_key", viewKey)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SavedFilter[];
}

export async function saveFilter(
  supabase: SupabaseClient<Database>,
  params: {
    tenant_id: string;
    user_id: string;
    view_key: string;
    name: string;
    filters: Record<string, unknown>;
    sort_config?: Record<string, unknown>;
    group_config?: Record<string, unknown>;
    is_default?: boolean;
  },
): Promise<SavedFilter> {
  // If setting as default, unset other defaults first
  if (params.is_default) {
    await supabase
      .from("saved_view_filters" as never)
      .update({ is_default: false } as never)
      .eq("user_id", params.user_id)
      .eq("view_key", params.view_key);
  }

  const { data, error } = await supabase
    .from("saved_view_filters" as never)
    .insert({
      tenant_id: params.tenant_id,
      user_id: params.user_id,
      view_key: params.view_key,
      name: params.name,
      filters: params.filters,
      sort_config: params.sort_config ?? {},
      group_config: params.group_config ?? {},
      is_default: params.is_default ?? false,
    } as never)
    .select()
    .single();

  if (error) throw error;
  return data as SavedFilter;
}

export async function updateFilter(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Partial<Pick<SavedFilter, "name" | "filters" | "sort_config" | "group_config" | "is_default">>,
): Promise<SavedFilter> {
  const { data, error } = await supabase
    .from("saved_view_filters" as never)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as SavedFilter;
}

export async function deleteFilter(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("saved_view_filters" as never)
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function getDefaultFilter(
  supabase: SupabaseClient<Database>,
  userId: string,
  viewKey: string,
): Promise<SavedFilter | null> {
  const { data, error } = await supabase
    .from("saved_view_filters" as never)
    .select("*")
    .eq("user_id", userId)
    .eq("view_key", viewKey)
    .eq("is_default", true)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as SavedFilter) ?? null;
}
