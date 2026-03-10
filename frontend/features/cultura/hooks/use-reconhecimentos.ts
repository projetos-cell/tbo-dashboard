"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getRecognitions,
  getRecognitionsForUser,
  createRecognition,
  likeRecognition,
  deleteRecognition,
  getUnreviewedRecognitions,
  reviewRecognition,
  getRecognitionKPIs,
  getPointsBalance,
  checkRateLimit,
  checkDuplicate,
} from "@/features/cultura/services/reconhecimentos";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

// ─── Recognitions list (paginated) ───
export function useRecognitions(opts: { limit?: number; offset?: number; source?: string } = {}) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["recognitions", tenantId, opts],
    queryFn: () => getRecognitions(supabase, opts),
    staleTime: 1000 * 60 * 2,
    enabled: !!tenantId,
  });
}

// ─── Recognitions for a specific user ───
export function useRecognitionsForUser(userId: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["recognitions", tenantId, "user", userId],
    queryFn: () => getRecognitionsForUser(supabase, userId),
    staleTime: 1000 * 60 * 2,
    enabled: !!tenantId && !!userId,
  });
}

// ─── Unreviewed (Fireflies auto-detected) ───
export function useUnreviewedRecognitions() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["recognitions", tenantId, "unreviewed"],
    queryFn: () => getUnreviewedRecognitions(supabase),
    staleTime: 1000 * 60 * 2,
    enabled: !!tenantId,
  });
}

// ─── Recognition KPIs ───
export function useRecognitionKPIs() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["recognition-kpis", tenantId],
    queryFn: () => getRecognitionKPIs(supabase),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ─── Points balance for a user ───
export function usePointsBalance(userId?: string) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["points-balance", tenantId, userId],
    queryFn: () => getPointsBalance(supabase, userId!),
    staleTime: 1000 * 60 * 2,
    enabled: !!tenantId && !!userId,
  });
}

// ─── Create recognition ───
export function useCreateRecognition() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recognition: Database["public"]["Tables"]["recognitions"]["Insert"]) =>
      createRecognition(supabase, recognition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recognitions"] });
      queryClient.invalidateQueries({ queryKey: ["recognition-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["points-balance"] });
    },
  });
}

// ─── Like recognition ───
export function useLikeRecognition() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => likeRecognition(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recognitions"] });
    },
  });
}

// ─── Delete recognition ───
export function useDeleteRecognition() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRecognition(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recognitions"] });
      queryClient.invalidateQueries({ queryKey: ["recognition-kpis"] });
    },
  });
}

// ─── Review recognition (Fireflies approve/reject) ───
export function useReviewRecognition() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      reviewRecognition(supabase, id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recognitions"] });
      queryClient.invalidateQueries({ queryKey: ["recognition-kpis"] });
    },
  });
}

// ─── Anti-fraud: rate limit check ───
export function useCheckRateLimit(fromUserId?: string, maxPerDay = 5) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["rate-limit", tenantId, fromUserId],
    queryFn: () => checkRateLimit(supabase, fromUserId!, maxPerDay),
    staleTime: 1000 * 60 * 1,
    enabled: !!tenantId && !!fromUserId,
  });
}

// ─── Anti-fraud: duplicate check ───
export function useCheckDuplicate(
  fromUser?: string,
  toUser?: string,
  valueId?: string,
  windowHours = 24
) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["duplicate-check", tenantId, fromUser, toUser, valueId],
    queryFn: () => checkDuplicate(supabase, fromUser!, toUser!, valueId!, windowHours),
    staleTime: 1000 * 60 * 1,
    enabled: !!tenantId && !!fromUser && !!toUser && !!valueId,
  });
}
