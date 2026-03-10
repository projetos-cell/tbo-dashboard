"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { listAuditLogs } from "@/features/auth/services/admin";

export function useAuditLogs(filters?: {
  action?: string;
  entity_type?: string;
  user_id?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}) {
  const supabase = createClient();
  const tenantId = useAuthStore((s) => s.tenantId);

  return useQuery({
    queryKey: ["audit-logs", tenantId, filters],
    queryFn: () => listAuditLogs(supabase, filters),
    staleTime: 1000 * 60 * 5,
    enabled: !!tenantId,
  });
}
