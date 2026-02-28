import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type PortalAccessRow =
  Database["public"]["Tables"]["client_portal_access"]["Row"];

export async function listPortalAccess(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<PortalAccessRow[]> {
  const { data, error } = await supabase
    .from("client_portal_access")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createAccess(
  supabase: SupabaseClient<Database>,
  access: Database["public"]["Tables"]["client_portal_access"]["Insert"]
): Promise<PortalAccessRow> {
  const { data, error } = await supabase
    .from("client_portal_access")
    .insert(access as never)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateAccess(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Database["public"]["Tables"]["client_portal_access"]["Update"]
): Promise<PortalAccessRow> {
  const { data, error } = await supabase
    .from("client_portal_access")
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAccess(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("client_portal_access")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function revokeAccess(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<PortalAccessRow> {
  const { data, error } = await supabase
    .from("client_portal_access")
    .update({ is_active: false } as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export interface PortalKPIs {
  total: number;
  active: number;
  lastLogin: string | null;
}

export function computePortalKPIs(
  accesses: PortalAccessRow[]
): PortalKPIs {
  const active = accesses.filter((a) => a.is_active).length;

  const lastLogin = accesses.reduce<string | null>((latest, a) => {
    if (!a.last_login) return latest;
    if (!latest) return a.last_login;
    return a.last_login > latest ? a.last_login : latest;
  }, null);

  return {
    total: accesses.length,
    active,
    lastLogin,
  };
}
