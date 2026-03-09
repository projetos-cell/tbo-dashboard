"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getRewards,
  createReward,
  updateReward,
  deleteReward,
  getRedemptions,
  createRedemption,
  updateRedemptionStatus,
  getRewardsKPIs,
} from "@/features/cultura/services/rewards";
import type { Database } from "@/lib/supabase/types";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

// ─── Rewards Catalog ───
export function useRewards(activeOnly = true) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["rewards", tenantId, activeOnly],
    queryFn: () => getRewards(supabase, tenantId!, activeOnly),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ─── Rewards KPIs ───
export function useRewardsKPIs() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["rewards-kpis", tenantId],
    queryFn: () => getRewardsKPIs(supabase, tenantId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}

// ─── Redemptions ───
export function useRedemptions(opts: { userId?: string; status?: string } = {}) {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["redemptions", tenantId, opts],
    queryFn: () => getRedemptions(supabase, tenantId!, opts),
    staleTime: 1000 * 60 * 2,
    enabled: !!tenantId,
  });
}

// ─── Create Reward ───
export function useCreateReward() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reward: Database["public"]["Tables"]["recognition_rewards"]["Insert"]) =>
      createReward(supabase, reward),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards-kpis"] });
    },
  });
}

// ─── Update Reward ───
export function useUpdateReward() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["recognition_rewards"]["Update"];
    }) => updateReward(supabase, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards-kpis"] });
    },
  });
}

// ─── Delete Reward ───
export function useDeleteReward() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReward(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards-kpis"] });
    },
  });
}

// ─── Create Redemption ───
export function useCreateRedemption() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (redemption: Database["public"]["Tables"]["recognition_redemptions"]["Insert"]) =>
      createRedemption(supabase, redemption),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["rewards-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["points-balance"] });
    },
  });
}

// ─── Update Redemption Status ───
export function useUpdateRedemptionStatus() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      approvedBy,
      notes,
    }: {
      id: string;
      status: "approved" | "rejected" | "delivered";
      approvedBy?: string;
      notes?: string;
    }) => updateRedemptionStatus(supabase, id, status, approvedBy, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["rewards-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["points-balance"] });
    },
  });
}
