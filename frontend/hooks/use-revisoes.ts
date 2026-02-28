"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import {
  getPendingReviews,
  getInProgressReviews,
  getCompletedReviews,
  getReviewKpis,
} from "@/services/revisoes";

function useSupabase() {
  return createClient();
}

function useTenantId() {
  return useAuthStore((s) => s.tenantId);
}

export function usePendingReviews() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["reviews", "pending", tenantId],
    queryFn: () => getPendingReviews(supabase, tenantId!),
    enabled: !!tenantId,
  });
}

export function useInProgressReviews() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["reviews", "in-progress", tenantId],
    queryFn: () => getInProgressReviews(supabase, tenantId!),
    enabled: !!tenantId,
  });
}

export function useCompletedReviews() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["reviews", "completed", tenantId],
    queryFn: () => getCompletedReviews(supabase, tenantId!),
    enabled: !!tenantId,
  });
}

export function useReviewKpis() {
  const supabase = useSupabase();
  const tenantId = useTenantId();

  return useQuery({
    queryKey: ["reviews", "kpis", tenantId],
    queryFn: () => getReviewKpis(supabase, tenantId!),
    enabled: !!tenantId,
  });
}
