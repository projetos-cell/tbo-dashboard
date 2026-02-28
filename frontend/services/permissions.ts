import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type RoleRow = Database["public"]["Tables"]["roles"]["Row"];
type RolePermissionRow = Database["public"]["Tables"]["role_permissions"]["Row"];

export async function listRoles(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<RoleRow[]> {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function listRolePermissions(
  supabase: SupabaseClient<Database>,
  roleId: string
): Promise<RolePermissionRow[]> {
  const { data, error } = await supabase
    .from("role_permissions")
    .select("*")
    .eq("role_id", roleId);

  if (error) throw error;
  return data ?? [];
}

export async function updateRolePermission(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Partial<RolePermissionRow>
): Promise<RolePermissionRow> {
  const { data, error } = await supabase
    .from("role_permissions")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createRole(
  supabase: SupabaseClient<Database>,
  role: Database["public"]["Tables"]["roles"]["Insert"]
): Promise<RoleRow> {
  const { data, error } = await supabase
    .from("roles")
    .insert(role as never)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRole(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: Partial<RoleRow>
): Promise<RoleRow> {
  const { data, error } = await supabase
    .from("roles")
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRole(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from("roles").delete().eq("id", id);
  if (error) throw error;
}
