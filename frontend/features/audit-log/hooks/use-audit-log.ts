"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getAuditLogs,
  getAuditLogActions,
  getAuditLogEntityTypes,
  type AuditLogFilters,
} from "@/features/audit-log/services/audit-log";

function useSupabase() {
  return createClient();
}

export function useAuditLogs(filters: AuditLogFilters = {}, page = 0) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["audit-logs", filters, page],
    queryFn: () => getAuditLogs(supabase, filters, page),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
}

export function useAuditLogActions() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["audit-log-actions"],
    queryFn: () => getAuditLogActions(supabase),
    staleTime: 1000 * 60 * 10,
  });
}

export function useAuditLogEntityTypes() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["audit-log-entity-types"],
    queryFn: () => getAuditLogEntityTypes(supabase),
    staleTime: 1000 * 60 * 10,
  });
}
