"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  fetchTeamMembers,
  fetchTeamMember,
  inviteTeamMember,
  updateTeamMember,
  changeUserRole,
  toggleUserActive,
  deleteTeamMember,
} from "@/services/team";
import type {
  TeamFilters,
  InviteUserInput,
  UpdateUserInput,
  ChangeRoleInput,
} from "@/schemas/team";

// ────────────────────────────────────────────────────
// Query Keys
// ────────────────────────────────────────────────────

export const teamKeys = {
  all: ["team"] as const,
  list: (filters?: TeamFilters) => ["team", "list", filters] as const,
  detail: (id: string) => ["team", "detail", id] as const,
};

// ────────────────────────────────────────────────────
// Queries
// ────────────────────────────────────────────────────

export function useTeamMembers(filters?: TeamFilters) {
  const supabase = createClient();

  return useQuery({
    queryKey: teamKeys.list(filters),
    queryFn: () => fetchTeamMembers(supabase, filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeamMember(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => fetchTeamMember(supabase, id),
    enabled: !!id,
  });
}

// ────────────────────────────────────────────────────
// Mutations
// ────────────────────────────────────────────────────

export function useInviteTeamMember() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InviteUserInput) => inviteTeamMember(supabase, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useUpdateTeamMember() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserInput) => updateTeamMember(supabase, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useChangeUserRole() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ChangeRoleInput) => changeUserRole(supabase, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useToggleUserActive() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      toggleUserActive(supabase, id, is_active),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useDeleteTeamMember() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTeamMember(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}
