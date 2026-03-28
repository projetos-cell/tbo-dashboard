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

/** Promove uma pessoa para um novo nível (RPC transacional) */
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

      return promotePersonCareer(supabase, progressionData, toLevelId, pathId);
    },
    onMutate: async ({ profileId, toLevelId, pathId }) => {
      await queryClient.cancelQueries({ queryKey: [CAREER_QUERY_KEYS.personCareer, profileId] });
      const previous = queryClient.getQueryData([CAREER_QUERY_KEYS.personCareer, profileId]);
      queryClient.setQueryData([CAREER_QUERY_KEYS.personCareer, profileId], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        return { ...(old as object), career_level_id: toLevelId, career_path_id: pathId };
      });
      return { previous, profileId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          [CAREER_QUERY_KEYS.personCareer, context.profileId],
          context.previous
        );
      }
    },
    onSuccess: (_, { profileId, fromLevelId, toLevelId, pathId }) => {
      queryClient.invalidateQueries({ queryKey: [CAREER_QUERY_KEYS.personCareer, profileId] });
      queryClient.invalidateQueries({ queryKey: [CAREER_QUERY_KEYS.progressions, profileId] });
      queryClient.invalidateQueries({ queryKey: [CAREER_QUERY_KEYS.pathMembers, pathId] });
      queryClient.invalidateQueries({ queryKey: [CAREER_QUERY_KEYS.paths] });

      logAuditTrail({
        userId: userId ?? "",
        action: "update",
        table: "career_progressions",
        recordId: profileId,
        before: { career_level_id: fromLevelId },
        after: { career_level_id: toLevelId, career_path_id: pathId },
      });
    },
  });
}

/** Atualiza diretamente o nível de carreira (sem histórico — correção manual) */
export function useUpdatePersonCareerLevel() {
  const supabase = useSupabase();
  const userId = useUserId();
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
      previousLevelId?: string | null;
      previousPathId?: string | null;
    }) => {
      await updatePersonCareerLevel(supabase, profileId, levelId, pathId);
    },
    onMutate: async ({ profileId, levelId, pathId }) => {
      await queryClient.cancelQueries({ queryKey: [CAREER_QUERY_KEYS.personCareer, profileId] });
      const previous = queryClient.getQueryData([CAREER_QUERY_KEYS.personCareer, profileId]);
      queryClient.setQueryData([CAREER_QUERY_KEYS.personCareer, profileId], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        return { ...(old as object), career_level_id: levelId, career_path_id: pathId };
      });
      return { previous, profileId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          [CAREER_QUERY_KEYS.personCareer, context.profileId],
          context.previous
        );
      }
    },
    onSuccess: (_, { profileId, levelId, pathId, previousLevelId, previousPathId }) => {
      queryClient.invalidateQueries({ queryKey: [CAREER_QUERY_KEYS.personCareer, profileId] });
      queryClient.invalidateQueries({ queryKey: [CAREER_QUERY_KEYS.paths] });

      logAuditTrail({
        userId: userId ?? "",
        action: "update",
        table: "profiles",
        recordId: profileId,
        before: { career_level_id: previousLevelId ?? null, career_path_id: previousPathId ?? null },
        after: { career_level_id: levelId, career_path_id: pathId },
      });
    },
  });
}
