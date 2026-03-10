import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  TeamMember,
  TeamFilters,
  InviteUserInput,
  UpdateUserInput,
  ChangeRoleInput,
} from "@/schemas/team";

// ────────────────────────────────────────────────────
// Queries — read from profiles table
// ────────────────────────────────────────────────────

export async function fetchTeamMembers(
  supabase: SupabaseClient,
  filters?: TeamFilters
): Promise<TeamMember[]> {
  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.role) {
    query = query.eq("role", filters.role);
  }
  if (filters?.is_active !== undefined) {
    query = query.eq("is_active", filters.is_active);
  }
  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as TeamMember[];
}

export async function fetchTeamMember(
  supabase: SupabaseClient,
  id: string
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as TeamMember;
}

// ────────────────────────────────────────────────────
// Mutations — write to profiles table
// ────────────────────────────────────────────────────

export async function inviteTeamMember(
  supabase: SupabaseClient,
  input: InviteUserInput
): Promise<TeamMember> {
  // In production, this should use a Supabase Edge Function
  // that calls supabase.auth.admin.inviteUserByEmail()
  // because profiles.id has FK to auth.users(id)
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      email: input.email,
      full_name: input.full_name,
      role: input.role,
      department: input.department || null,
    } as never)
    .select()
    .single();

  if (error) throw error;
  return data as TeamMember;
}

export async function updateTeamMember(
  supabase: SupabaseClient,
  input: UpdateUserInput
): Promise<TeamMember> {
  const { id, ...updates } = input;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as TeamMember;
}

export async function changeUserRole(
  supabase: SupabaseClient,
  input: ChangeRoleInput
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role: input.role } as never)
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw error;
  return data as TeamMember;
}

export async function toggleUserActive(
  supabase: SupabaseClient,
  id: string,
  is_active: boolean
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ is_active } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as TeamMember;
}

export async function deleteTeamMember(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
