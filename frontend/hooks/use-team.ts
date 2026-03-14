"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  TeamMember,
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
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ["team", "list"] });
      toast.success("Membro convidado", {
        description: `${input.full_name} foi adicionado a equipe.`,
      });
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      if (msg.includes("violates foreign key") || msg.includes("auth")) {
        toast.error("Erro ao convidar", {
          description:
            "O convite requer uma Edge Function para criar o usuario no auth. Contate o admin.",
        });
      } else if (msg.includes("duplicate") || msg.includes("unique")) {
        toast.error("E-mail ja cadastrado", {
          description: "Ja existe um membro com este e-mail.",
        });
      } else {
        toast.error("Erro ao convidar membro", { description: msg });
      }
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
      queryClient.invalidateQueries({ queryKey: ["team", "list"] });
      toast.success("Membro atualizado", {
        description: `Dados de ${data.full_name} salvos com sucesso.`,
      });
    },
    onError: (error) => {
      toast.error("Erro ao atualizar membro", {
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
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
      queryClient.invalidateQueries({ queryKey: ["team", "list"] });
      toast.success("Permissao alterada", {
        description: `${data.full_name} agora e ${data.role}.`,
      });
    },
    onError: (error) => {
      toast.error("Erro ao alterar permissao", {
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    },
  });
}

export function useToggleUserActive() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      toggleUserActive(supabase, id, is_active),
    onMutate: async ({ id, is_active }) => {
      await queryClient.cancelQueries({ queryKey: ["team", "list"] });
      const previousLists = queryClient.getQueriesData<TeamMember[]>({
        queryKey: ["team", "list"],
      });
      queryClient.setQueriesData<TeamMember[]>(
        { queryKey: ["team", "list"] },
        (old) =>
          old?.map((m) => (m.id === id ? { ...m, is_active } : m))
      );
      return { previousLists };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team", "list"] });
      toast.success(data.is_active ? "Membro reativado" : "Membro desativado", {
        description: data.is_active
          ? `${data.full_name} teve o acesso restaurado.`
          : `${data.full_name} teve todos os acessos removidos. O perfil foi mantido.`,
      });
    },
    onError: (error, _vars, context) => {
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error("Erro ao alterar status", {
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    },
  });
}

export function useDeleteTeamMember() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTeamMember(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", "list"] });
      toast.success("Membro excluido", {
        description: "O membro foi removido permanentemente.",
      });
    },
    onError: (error) => {
      toast.error("Erro ao excluir membro", {
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    },
  });
}
