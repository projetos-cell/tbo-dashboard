"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { logAuditTrail } from "@/lib/audit-trail";
import {
  getCareerPaths,
  getCareerPath,
  getPersonCareer,
  getCareerProgressions,
  promotePersonCareer,
  updatePersonCareerLevel,
  getPathMembers,
  type CreateProgressionData,
} from "@/features/career-paths/services/career-paths";

// ── Helpers ──────────────────────────────────────────────────────────────────

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

function useUserId() {
  return useAuthStore((s) => s.user?.id ?? null);
}

// ── Query keys ───────────────────────────────────────────────────────────────

export const CAREER_QUERY_KEYS = {
  paths: "career-paths",
  path: "career-path",
  personCareer: "person-career",
  progressions: "career-progressions",
  pathMembers: "career-path-members",
} as const;

// ── Read hooks ───────────────────────────────────────────────────────────────

/** Lista todos os career paths do tenant com contagem de membros */
export function useCareerPaths() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: [CAREER_QUERY_KEYS.paths, tenantId],
    queryFn: () => getCareerPaths(supabase),
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId,
  });
}

/** Busca um career path com trilhas, níveis e competências */
export function useCareerPath(pathId: string | null) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: [CAREER_QUERY_KEYS.path, pathId],
    queryFn: () => getCareerPath(supabase, pathId!),
    staleTime: 1000 * 60 * 10,
    enabled: !!tenantId && !!pathId,
  });
}

/** Dados de carreira de uma pessoa (nível atual + path + competências) */
export function usePersonCareer(profileId: string | null) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: [CAREER_QUERY_KEYS.personCareer, profileId],
    queryFn: () => getPersonCareer(supabase, profileId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!profileId,
  });
}

/** Histórico de progressões de uma pessoa */
export function useCareerProgressions(profileId: string | null) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: [CAREER_QUERY_KEYS.progressions, profileId],
    queryFn: () => getCareerProgressions(supabase, profileId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!profileId,
  });
}

/** Membros de um nucleo */
export function usePathMembers(pathId: string | null) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: [CAREER_QUERY_KEYS.pathMembers, pathId],
    queryFn: () => getPathMembers(supabase, pathId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId && !!pathId,
  });
}

// ── Mutation hooks ───────────────────────────────────────────────────────────

/** Promove uma pessoa para um novo nível (cria progressão + atualiza perfil) */
export function usePromotePersonCareer() {
  const supabase = useSupabase();
  const tenantId = useTenantId();
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      fromLevelId,
      toLevelId,
      pathId,
      notes,
    }: {
      profileId: string;
      fromLevelId: string | null;
      toLevelId: string;
      pathId: string;
      notes?: string;
    }) => {
      if (!tenantId) throw new Error("Tenant não encontrado");

      const progressionData: CreateProgressionData = {
        tenant_id: tenantId,
        profile_id: profileId,
        from_level_id: fromLevelId,
        to_level_id: toLevelId,
        promoted_by: userId,
        notes: notes ?? null,
      };

      await promotePersonCareer(supabase, progressionData, toLevelId, pathId);
    },
    onSuccess: (_, { profileId, pathId }) => {
      queryClient.invalidateQueries({ queryKey: [CAREER_QUERY_KEYS.personCareer, profileId] });
      queryClient.invalidateQueries({ queryKey: [CAREER_QUERY_KEYS.progressions, profileId] });
      queryClient.invalidateQueries({ queryKey: [CAREER_QUERY_KEYS.pathMembers, pathId] });
      queryClient.invalidateQueries({ queryKey: [CAREER_QUERY_KEYS.paths] });
      logAuditTrail({
        userId: userId ?? "",
        action: "update",
        table: "profiles",
        recordId: profileId,
        after: { career_promotion: true },
      });
    },
  });
}

/** Atualiza diretamente o nível de carreira de uma pessoa (sem histórico) */
export function useUpdatePersonCareerLevel() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      levelId,
      pathId,
    }: {
      profileId: string;
      levelId: string | null;
      pathId: string | null;
    }) => {
      await updatePersonCareerLevel(supabase, profileId, levelId, pathId);
    },
    onSuccess: (_, { profileId }) => {
      queryClient.invalidateQueries({ queryKey: [CAREER_QUERY_KEYS.personCareer, profileId] });
      queryClient.invalidateQueries({ queryKey: [CAREER_QUERY_KEYS.paths] });
    },
  });
}
