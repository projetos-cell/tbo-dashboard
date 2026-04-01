import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getGlobalActivity,
  getActivityActors,
  getActivityEntityTypes,
  type GlobalActivityFilters,
} from "@/features/atividades/services/global-activity";

const supabase = createClient();

export function useGlobalActivity(filters: GlobalActivityFilters = {}, page = 0) {
  return useQuery({
    queryKey: ["global-activity", filters, page],
    queryFn: () => getGlobalActivity(supabase, filters, page),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useActivityActors() {
  return useQuery({
    queryKey: ["activity-actors"],
    queryFn: () => getActivityActors(supabase),
    staleTime: 5 * 60_000,
  });
}

export function useActivityEntityTypes() {
  return useQuery({
    queryKey: ["activity-entity-types"],
    queryFn: () => getActivityEntityTypes(supabase),
    staleTime: 10 * 60_000,
  });
}
